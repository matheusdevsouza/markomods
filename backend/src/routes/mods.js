import express from 'express';
import path from 'path';
import { authenticateToken, requireAdmin, optionalAuth, publicOrAuthenticated } from '../middleware/auth.js';
import { uploadThumbnail, validateThumbnail, uploadEditorImage } from '../middleware/upload.js';
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

// Rotas públicas (não requerem autenticação)
router.get('/public', getPublicMods); // Listar todos os mods públicos
router.get('/public/:slug', getModBySlug); // Buscar mod por slug
router.get('/search', advancedSearch); // Busca avançada
router.get('/content-types', getContentTypes); // Buscar tipos de conteúdo
router.get('/stats/count', getModsCount); // Buscar contagem total de mods

// Rota de teste pública
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Rota pública funcionando!' });
});

// Rota de teste para mod específico
router.get('/test-mod/:id', (req, res) => {
  const { id } = req.params;
  res.json({ 
    success: true, 
    message: 'Rota de teste funcionando!', 
    modId: id,
    timestamp: new Date().toISOString()
  });
});

// Rota para buscar mod por ID (público) - DEVE vir ANTES das rotas autenticadas
router.get('/mod/:id', (req, res) => {
  getModById(req, res);
});

// Rota para registrar visualização (pública) - DEVE vir DEPOIS da rota /mod/:id
router.post('/mod/:id/view', registerView);

// Rota para servir arquivos de thumbnail
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// IMPORTANTE: Todas as rotas abaixo desta linha usam middleware que permite acesso público para GET /:id
// Rotas que requerem autenticação ou permitem acesso público
router.use(publicOrAuthenticated);

// Rotas administrativas (requerem admin + segurança extra)
router.get('/admin', adminSecurityMiddleware, requireAdmin, getAllMods);
router.get('/admin/stats', adminSecurityMiddleware, requireAdmin, getModStats);
router.get('/admin/:id', adminSecurityMiddleware, requireAdmin, getModById);

// Rotas para usuários autenticados
router.post('/:id/download', downloadMod);
router.get('/user/downloads/count', authenticateToken, getUserDownloadsCount);
router.get('/user/downloads/history', authenticateToken, getUserDownloadHistory);

// Rotas para favoritos (requerem autenticação)
router.post('/:id/favorite', authenticateToken, toggleFavorite);
router.get('/:id/favorite', authenticateToken, checkFavorite);
router.get('/user/favorites', authenticateToken, getUserFavorites);

// Rotas de criação/edição (requerem admin + segurança extra)
router.post('/', adminSecurityMiddleware, requireAdmin, uploadThumbnail, validateThumbnail, createMod);
router.put('/:id', adminSecurityMiddleware, requireAdmin, uploadThumbnail, validateThumbnail, updateMod);
router.delete('/:id', adminSecurityMiddleware, requireAdmin, deleteMod);
router.patch('/:id/status', adminSecurityMiddleware, requireAdmin, toggleModStatus);

// Upload de imagens do editor (TipTap/Quill). Requer usuário autenticado.
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

