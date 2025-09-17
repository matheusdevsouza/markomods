import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // Adicionado para verificar e criar diretório de uploads

// Importar configurações
import { testConnection } from './config/database.js';
import { authenticateToken } from './middleware/auth.js';
import { uploadEditorImage } from './middleware/upload.js';
import { requestLogger } from './config/logger.js';
import { securityMiddleware } from './services/SecurityService.js';
import { adminSecurityMiddleware } from './middleware/adminSecurity.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import logRoutes from './routes/logs.js';
import modsRoutes from './routes/mods.js';
import commentsRoutes from './routes/comments.js';
import adsRoutes from './routes/ads.js';
import userSettingsRoutes from './routes/userSettings.js';
import securityRoutes from './routes/security.js';
// Removido: rotas do editor customizado

// Configurar dotenv
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './production.env' });
} else {
  // Tentar carregar .env primeiro, depois config.env como fallback
  try {
    dotenv.config({ path: './.env' });
  } catch (error) {
    dotenv.config({ path: './config.env' });
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurar trust proxy para rate limiting
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// =====================================================
// MIDDLEWARES DE SEGURANÇA
// =====================================================

// Helmet para headers de segurança MÁXIMA
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  hidePoweredBy: true,
  ieNoOpen: true,
  noSniff: true,
  xssFilter: true,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' }
}));

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origem (como aplicações mobile) e origens locais
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000', 
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      undefined // Para requisições sem origem
    ];
    
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(null, true); // Por enquanto, permitir todas as origens para desenvolvimento
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Cross-Origin-Resource-Policy'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting mais permissivo para desenvolvimento
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 1000, // 1000 requisições por IP por minuto (muito permissivo)
  message: {
    success: false,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    retryAfter: Math.round(1 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para health checks e rotas públicas
    return req.path === '/health' || 
           req.path.startsWith('/api/mods/public') ||
           req.path.startsWith('/api/mods/mod/') ||
           req.path.startsWith('/api/mods/search') ||
           req.path.startsWith('/api/mods/content-types') ||
           req.path.startsWith('/api/mods/stats/count');
  }
});

// Rate limiting ULTRA AGRESSIVO para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP por 15 minutos
  message: {
    success: false,
    message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    retryAfter: Math.round(15 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    // Log de tentativas suspeitas
    console.warn(`🚨 RATE LIMIT EXCEDIDO: IP ${req.ip} - ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
      retryAfter: Math.round(15 * 60 * 1000 / 1000)
    });
  }
});

// Rate limiting para uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 uploads por IP por hora
  message: {
    success: false,
    message: 'Limite de uploads excedido. Tente novamente em 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para rotas públicas de mods (mais permissivo)
const publicModsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 1000, // 1000 requisições por IP por minuto (muito permissivo)
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em instantes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para rotas públicas de leitura
    return req.method === 'GET' && (
      req.path === '/public' || 
      req.path.startsWith('/public/') ||
      req.path.startsWith('/mod/') ||
      req.path === '/search' ||
      req.path === '/content-types' ||
      req.path === '/stats/count' ||
      req.path === '/test' ||
      req.path.startsWith('/test-')
    );
  }
});

// Rate limiting para comentários (mais permissivo)
const commentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 50, // 50 comentários por IP por minuto (muito mais permissivo)
  message: {
    success: false,
    message: 'Você está comentando muito rápido. Tente novamente em instantes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para leitura de comentários
    return req.method === 'GET';
  }
});

// Aplicar rate limiting global
app.use(limiter);

// Middleware de segurança
app.use(securityMiddleware());

// =====================================================
// MIDDLEWARES DE PROCESSAMENTO
// =====================================================

// Compressão
app.use(compression());

// Parser de JSON
app.use(express.json({ limit: '10mb' }));

// Parser de URL encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logs
app.use(morgan('combined'));
app.use(requestLogger);

// =====================================================
// ROTAS
// =====================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes com rate limiting específico
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userSettingsRoutes); // Mover userSettingsRoutes antes de userRoutes
app.use('/api/user', userRoutes);
app.use('/api/logs', adminSecurityMiddleware, logRoutes);
app.use('/api/mods', publicModsLimiter, modsRoutes); // Usar rate limiting mais permissivo para mods
app.use('/api/comments', commentLimiter, commentsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/security', adminSecurityMiddleware, securityRoutes);
// Removido: app.use('/api/editor', editorRoutes);

// Upload de imagens do editor (rota direta para evitar problemas de roteamento aninhado)
app.post('/api/mods/editor/upload-image', authenticateToken, uploadEditorImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imagePath = `/uploads/editor-images/${req.file.filename}`;
    const absoluteUrl = `${baseUrl}${imagePath}`;
    return res.status(201).json({ success: true, url: absoluteUrl, path: imagePath });
  } catch (error) {
    console.error('Erro no upload de imagem do editor (global):', error);
    return res.status(500).json({ success: false, message: 'Erro ao fazer upload da imagem' });
  }
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Backend Eu, Marko! Mods - API funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      health: '/health'
    },
    documentation: 'Consulte a documentação para mais detalhes'
  });
});

// Rota para arquivos estáticos (uploads)
const uploadsPath = path.join(__dirname, '../uploads');

// Verificar e criar diretórios de uploads (base e subpastas)
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
const uploadsSubdirs = ['avatars', 'thumbnails', 'editor-images'];
for (const dir of uploadsSubdirs) {
  const full = path.join(uploadsPath, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
}

// Rota específica para avatares com headers CORP corretos
app.get('/uploads/avatars/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, 'avatars', filename);
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Avatar não encontrado' });
  }
  
  // Definir headers específicos para resolver problemas CORP
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cache-Control': 'public, max-age=31536000'
  });
  
  // Servir o arquivo
  res.sendFile(filePath);
});

// Middleware de arquivos estáticos para outros arquivos
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, path) => {
    // Permitir CORS para imagens
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Definir Cross-Origin-Resource-Policy como cross-origin para permitir acesso
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Cache para imagens
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 ano
    }
  }
}));

// =====================================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// =====================================================

// 404 - Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Tratamento global de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// =====================================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================================

const startServer = async () => {
  try {
    console.log('🔄 Iniciando processo de inicialização do servidor...');
    
    // Testar conexão com banco
    console.log('🔄 Testando conexão com banco de dados...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Falha na conexão com o banco de dados. Servidor não iniciará.');
      process.exit(1);
    }
    
    console.log('✅ Conexão com banco estabelecida. Iniciando servidor HTTP...');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado com sucesso!');
      console.log(`📡 Porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️ Banco: ${process.env.DB_NAME || 'markomods_db'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📚 API: http://localhost:${PORT}/api`);
      console.log('✅ Backend pronto para receber requisições!');
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais para graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

