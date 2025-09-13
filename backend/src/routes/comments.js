import express from 'express';
import { authenticateToken, requireAdmin, requireSuperAdmin, commentsPublicOrAuthenticated } from '../middleware/auth.js';
import {
  createComment,
  listCommentsByMod,
  getPendingComments,
  getRejectedComments,
  getRecentComments,
  approveComment,
  rejectComment,
  deleteComment,
  createReply,
  getReplies,
  voteComment,
  getUserComments,
  getUserCommentsCount
} from '../controllers/commentsController.js';

const router = express.Router();

// Público mas com autenticação opcional: listar comentários de um mod
router.get('/mod/:modId', commentsPublicOrAuthenticated, listCommentsByMod);

// Autenticado: criar comentário
router.post('/', authenticateToken, createComment);

// Autenticado: deletar comentário (autor ou admin)
router.delete('/:commentId', authenticateToken, deleteComment);

// Autenticado: votar em comentário
router.post('/:commentId/vote', authenticateToken, voteComment);

// Autenticado: comentários do usuário
router.get('/user/list', authenticateToken, getUserComments);
router.get('/user/count', authenticateToken, getUserCommentsCount);

// Admin: moderação de comentários
router.get('/admin/pending', authenticateToken, requireAdmin, getPendingComments);
router.get('/admin/rejected', authenticateToken, requireAdmin, getRejectedComments);
router.get('/admin/recent', authenticateToken, requireAdmin, getRecentComments);
router.post('/admin/:commentId/approve', authenticateToken, requireAdmin, approveComment);
router.post('/admin/:commentId/reject', authenticateToken, requireAdmin, rejectComment);

// Super Admin: sistema de respostas
router.post('/reply', authenticateToken, requireSuperAdmin, createReply);
router.get('/replies/:parentId', getReplies);

export default router;


