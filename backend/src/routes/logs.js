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

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Buscar logs com filtros
router.get('/', getLogs);

// Buscar atividade recente
router.get('/recent', getRecentActivity);

// Buscar logs por categoria
router.get('/category/:category', getLogsByCategory);

// Buscar logs por usuário
router.get('/user/:userId', getLogsByUser);

// Buscar logs por recurso
router.get('/resource/:resourceType/:resourceId', getLogsByResource);

// Buscar logs por período
router.get('/date-range', getLogsByDateRange);

// Buscar resumo dos logs
router.get('/summary', getLogsSummary);

// Exportar logs (apenas para administradores)
router.get('/export', requireRole(['admin', 'moderator']), exportLogs);

// Limpar logs antigos (apenas para administradores)
router.delete('/clear-old', requireRole(['admin']), clearOldLogs);

export default router;








