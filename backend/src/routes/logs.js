import express from 'express';
import { 
  getLogs, 
  getRecentActivity, 
  getLogsByCategory, 
  getLogsByUser, 
  getLogsByResource, 
  getLogsByDateRange, 
  getLogsSummary, 
  exportLogs, 
  clearOldLogs 
} from '../controllers/logController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// todas essas rotas pedem autenticação (servem pra ver logs, exportar ou lumpar)
router.use(authenticateToken);
router.get('/', getLogs);
router.get('/recent', getRecentActivity);
router.get('/category/:category', getLogsByCategory);
router.get('/user/:userId', getLogsByUser);
router.get('/resource/:resourceType/:resourceId', getLogsByResource);
router.get('/date-range', getLogsByDateRange);
router.get('/summary', getLogsSummary);
router.get('/export', requireRole(['admin', 'moderator']), exportLogs);
router.delete('/clear-old', requireRole(['admin']), clearOldLogs);

export default router;








