import express from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// middleware de autenticação
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleAuth.js';

// configuração do multer para upload de imagens  
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/banners');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `banner-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

// garantir que o diretório de upload existe
const ensureUploadDir = async () => {
  const uploadDir = path.join(__dirname, '../../uploads/banners');
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// upload de banner
router.post('/banner/upload', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    await ensureUploadDir();
    
    upload.single('banner')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Erro no upload do arquivo'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      // retornar a URL do arquivo
      const fileUrl = `/uploads/banners/${req.file.filename}`;
      
      res.json({
        success: true,
        message: 'Banner enviado com sucesso',
        url: fileUrl,
        filename: req.file.filename
      });
    });
  } catch (error) {
    console.error('Erro no upload do banner:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// atualizar URL do banner
router.post('/banner/update', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { banner_url, banner_link } = req.body;

    if (!banner_url) {
      return res.status(400).json({
        success: false,
        message: 'URL do banner é obrigatória'
      });
    }

    // salvar a URL do banner em um arquivo de configuração
    const configPath = path.join(__dirname, '../../config/banner.json');
    const bannerConfig = {
      banner_url: banner_url,
      banner_link: banner_link || null,
      updated_at: new Date().toISOString()
    };

    await fs.writeFile(configPath, JSON.stringify(bannerConfig, null, 2));

    res.json({
      success: true,
      message: 'Banner atualizado com sucesso',
      banner_url: banner_url,
      banner_link: banner_link || null
    });
  } catch (error) {
    console.error('Erro ao atualizar banner:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// obter configurações do banner
router.get('/banner/config', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../config/banner.json');
    
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      res.json({
        success: true,
        banner_url: config.banner_url || '/src/assets/images/markomods-banner.png',
        banner_link: config.banner_link || null
      });
    } catch (fileError) {
      res.json({
        success: true,
        banner_url: '/src/assets/images/markomods-banner.png',
        banner_link: null
      });
    }
  } catch (error) {
    console.error('Erro ao obter configuração do banner:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// rota pública para pegar a configuração do banner
router.get('/banner/public-config', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../config/banner.json');
    
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      res.json({
        success: true,
        banner_url: config.banner_url || '/src/assets/images/markomods-banner.png',
        banner_link: config.banner_link || null
      });
    } catch (fileError) {
      res.json({
        success: true,
        banner_url: '/src/assets/images/markomods-banner.png',
        banner_link: null
      });
    }
  } catch (error) {
    console.error('Erro ao obter configuração pública do banner:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
