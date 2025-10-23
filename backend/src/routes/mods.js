import express from 'express';
import path from 'path';
import { authenticateToken, requireAdmin, optionalAuth, publicOrAuthenticated } from '../middleware/auth.js';
import { uploadModMedia, validateModMedia, uploadEditorImage } from '../middleware/upload.js';
import { adminSecurityMiddleware } from '../middleware/adminSecurity.js';
import {
  createMod,
  getAllMods,
  getPublicMods,
  getModById,
  getModBySlug,
  updateMod,
  deleteMod,
  toggleModStatus,
  getModStats,
  downloadMod,
  advancedSearch,
  getContentTypes,
  getModsCount,
  registerView,
  registerDownload,
  getUserDownloadsCount,
  getUserDownloadHistory,
  toggleFavorite,
  checkFavorite,
  getUserFavorites
} from '../controllers/modsController.js';

const router = express.Router();

// rotas públicas (nao precisa de autenticaçao)
router.get('/public', getPublicMods);
router.get('/public/:slug', getModBySlug);
router.get('/search', advancedSearch);
router.get('/content-types', getContentTypes);
router.get('/stats/count', getModsCount);

// testes
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Rota pública funcionando!' });
});

router.get('/test-mod/:id', (req, res) => {
  const { id } = req.params;
  res.json({ 
    success: true, 
    message: 'Rota de teste funcionando!', 
    modId: id,
    timestamp: new Date().toISOString()
  });
});

// buscar mod por ID 
router.get('/mod/:id', (req, res) => {
  getModById(req, res);
});

// registrar visualização
router.post('/mod/:id/view', registerView);
router.post('/:id/view', registerView);

// servir arquivos de thumbnail
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// middleware para permitir acesso público para GET /id
router.use(publicOrAuthenticated);

// rotas administrativas (precisa de admin e segurança)
router.get('/admin', adminSecurityMiddleware, requireAdmin, getAllMods);
router.get('/admin/stats', adminSecurityMiddleware, requireAdmin, getModStats);
router.get('/admin/:id', adminSecurityMiddleware, requireAdmin, getModById);

// rotas para usuários autenticados
router.post('/:id/download', optionalAuth, downloadMod);
router.get('/user/downloads/count', authenticateToken, getUserDownloadsCount);
router.get('/user/downloads/history', authenticateToken, getUserDownloadHistory);

// rotas para favoritos
router.post('/:id/favorite', authenticateToken, toggleFavorite);
router.get('/:id/favorite', authenticateToken, checkFavorite);
router.get('/user/favorites', authenticateToken, getUserFavorites);

// rotas de criação/edição
router.post('/', adminSecurityMiddleware, requireAdmin, uploadModMedia, validateModMedia, createMod);
router.put('/:id', adminSecurityMiddleware, requireAdmin, uploadModMedia, validateModMedia, updateMod);
router.delete('/:id', adminSecurityMiddleware, requireAdmin, deleteMod);
router.patch('/:id/status', adminSecurityMiddleware, requireAdmin, toggleModStatus);

// upload de imagens do editor
router.post('/editor/upload-image', authenticateToken, uploadEditorImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imagePath = `/uploads/editor-images/${req.file.filename}`;
    const absoluteUrl = `${baseUrl}${imagePath}`;
    return res.status(201).json({ success: true, url: absoluteUrl, path: imagePath });
  } catch (error) {
    console.error('Erro no upload de imagem do editor:', error);
    return res.status(500).json({ success: false, message: 'Erro ao fazer upload da imagem' });
  }
});

export default router;

