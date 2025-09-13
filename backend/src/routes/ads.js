import express from 'express';
import { getAdsConfig, updateAdsConfig, getPageAdsConfig, isGoogleAdsenseActive } from '../controllers/adsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas administrativas (requerem autenticação e admin)
router.get('/admin/ads-config', authenticateToken, requireAdmin, getAdsConfig);
router.post('/admin/ads-config', authenticateToken, requireAdmin, updateAdsConfig);

// Rotas públicas (para buscar configurações de anúncios)
router.get('/ads/page/:page', getPageAdsConfig);
router.get('/ads/google-adsense-status', isGoogleAdsenseActive);

export default router;