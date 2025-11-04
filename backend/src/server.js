import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { testConnection } from './config/database.js';
import { authenticateToken } from './middleware/auth.js';
import { uploadEditorImage } from './middleware/upload.js';
import { requestLogger } from './config/logger.js';
import { securityMiddleware } from './services/SecurityService.js';
import { adminSecurityMiddleware } from './middleware/adminSecurity.js';
import { validateDomain, logSuspiciousActivity } from './middleware/domainValidation.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import logRoutes from './routes/logs.js';
import modsRoutes from './routes/mods.js';
import commentsRoutes from './routes/comments.js';
import userSettingsRoutes from './routes/userSettings.js';
import securityRoutes from './routes/security.js';
import adminRoutes from './routes/admin.js';
import changelogRoutes from './routes/changelogs.js';
import ChangelogModel from './models/ChangelogModel.js';
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './production.env' });
} else {
  try {
    dotenv.config({ path: './.env' });
  } catch (error) {
    dotenv.config({ path: './config.env' });
  }
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.youtube.com", "https://*.youtube.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://www.youtube.com", "https://*.youtube.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com", "https://*.youtube.com"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  permissionsPolicy: {
    fullscreen: ["'self'", "https://www.youtube.com"],
    gyroscope: ["'self'", "https://www.youtube.com"],
    accelerometer: ["'self'", "https://www.youtube.com"],
    camera: ["'self'"],
    microphone: ["'self'"],
    geolocation: ["'self'"],
    payment: ["'self'"],
    usb: ["'self'"]
  },
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
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://www.youtube.com https://*.youtube.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://www.youtube.com https://*.youtube.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://www.youtube.com https://youtube.com https://*.youtube.com; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'"
  );
  next();
});
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      undefined
    ];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Cross-Origin-Resource-Policy'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(logSuspiciousActivity);
app.use(validateDomain);
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    retryAfter: Math.round(1 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' ||
           req.path.startsWith('/api/mods/public') ||
           req.path.startsWith('/api/mods/mod/') ||
           req.path.startsWith('/api/mods/search') ||
           req.path.startsWith('/api/mods/content-types') ||
           req.path.startsWith('/api/mods/stats/count');
  }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    retryAfter: Math.round(15 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.warn(`🚨 RATE LIMIT EXCEDIDO: IP ${req.ip} - ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
      retryAfter: Math.round(15 * 60 * 1000 / 1000)
    });
  }
});
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Limite de uploads excedido. Tente novamente em 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
const publicModsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em instantes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.method === 'GET' || req.path.includes('/download');
  }
});
const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Você está comentando muito rápido. Tente novamente em instantes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.method === 'GET';
  }
});
app.use(limiter);
app.use(securityMiddleware());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));
app.use(requestLogger);
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userSettingsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/logs', adminSecurityMiddleware, logRoutes);
app.use('/api/mods', publicModsLimiter, modsRoutes);
app.use('/api/comments', commentLimiter, commentsRoutes);
app.use('/api/security', adminSecurityMiddleware, securityRoutes);
app.use('/api/admin', adminSecurityMiddleware, adminRoutes);
app.use('/api/changelogs', changelogRoutes);
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
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Backend Eu, Marko! - API funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      health: '/health'
    },
    documentation: 'Consulte a documentação para mais detalhes'
  });
});
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
const uploadsSubdirs = ['avatars', 'thumbnails', 'editor-images', 'videos'];
for (const dir of uploadsSubdirs) {
  const full = path.join(uploadsPath, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
}
app.get('/uploads/avatars/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, 'avatars', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Avatar não encontrado' });
  }
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cache-Control': 'public, max-age=31536000'
  });
  res.sendFile(filePath);
});

const normalizeText = (text) => {
  const map = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ç': 'c', 'ñ': 'n',
    'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
    'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
    'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
    'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
    'Ç': 'C', 'Ñ': 'N'
  };
  
  return text.replace(/[àáâãäåèéêëìíîïòóôõöùúûüçñÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇÑ]/g, (char) => map[char] || char);
};

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, 'downloads', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }
  
  const modName = decodeURIComponent(req.query.modName || 'mod');
  const modLoader = decodeURIComponent(req.query.modLoader || '');
  const minecraftVersion = decodeURIComponent(req.query.minecraftVersion || '');
  const modVersion = decodeURIComponent(req.query.modVersion || '');
  const fileExtension = path.extname(filename);
  
  const sanitizedName = normalizeText(modName).replace(/[^a-zA-Z0-9\-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const sanitizedLoader = normalizeText(modLoader).replace(/[^a-zA-Z0-9\-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const sanitizedMinecraftVersion = normalizeText(minecraftVersion).replace(/[^a-zA-Z0-9.-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const sanitizedModVersion = normalizeText(modVersion).replace(/[^a-zA-Z0-9.-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  let downloadFilename;
  if (sanitizedLoader && sanitizedMinecraftVersion && sanitizedModVersion) {
    downloadFilename = `${sanitizedName}-${sanitizedLoader}-${sanitizedMinecraftVersion}-${sanitizedModVersion}${fileExtension}`;
  } else if (sanitizedMinecraftVersion && sanitizedModVersion) {
    downloadFilename = `${sanitizedName}-${sanitizedMinecraftVersion}-${sanitizedModVersion}${fileExtension}`;
  } else {
    downloadFilename = `${sanitizedName}${fileExtension}`;
  }
  
  let contentType = 'application/octet-stream';
  if (fileExtension === '.jar') {
    contentType = 'application/java-archive';
  } else if (fileExtension === '.zip') {
    contentType = 'application/zip';
  } else if (fileExtension === '.mcpack') {
    contentType = 'application/x-mcpack';
  } else if (fileExtension === '.mcaddon') {
    contentType = 'application/x-mcaddon';
  }
  
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Content-Disposition': `attachment; filename="${downloadFilename}"`,
    'Content-Type': contentType
  });
  
  res.sendFile(filePath);
});

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
      res.set('Cache-Control', 'public, max-age=31536000');
    }
    if (path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.ogg')) {
      res.set('Cache-Control', 'public, max-age=86400');
    }
  }
}));
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});
const startServer = async () => {
  try {
    console.log('🔄 Iniciando processo de inicialização do servidor...');
    console.log('🔄 Testando conexão com banco de dados...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Falha na conexão com o banco de dados. Servidor não iniciará.');
      process.exit(1);
    }
    console.log('✅ Conexão com banco estabelecida. Iniciando servidor HTTP...');
    try { await ChangelogModel.ensureTable(); } catch (e) { console.error('Erro ao garantir tabela changelogs', e); }
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado com sucesso!');
      console.log(`📡 Porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️ Banco: ${process.env.DB_NAME || 'markomods'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📚 API: http://localhost:${PORT}/api`);
      console.log('✅ Backend pronto para receber requisições!');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});
startServer();