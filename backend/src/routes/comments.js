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

// público mas com autenticação opcional (listar comentários de um mod)
router.get('/mod/:modId', commentsPublicOrAuthenticated, listCommentsByMod);

// autenticado (criar comentário)
router.post('/', authenticateToken, createComment);

// autenticado (deletar, comentar, votar, etc)
router.delete('/:commentId', authenticateToken, deleteComment);
router.post('/:commentId/vote', authenticateToken, voteComment);
router.get('/user/list', authenticateToken, getUserComments);
router.get('/user/count', authenticateToken, getUserCommentsCount);
router.get('/admin/pending', authenticateToken, requireAdmin, getPendingComments);
router.get('/admin/rejected', authenticateToken, requireAdmin, getRejectedComments);
router.get('/admin/recent', authenticateToken, requireAdmin, getRecentComments);
router.post('/admin/:commentId/approve', authenticateToken, requireAdmin, approveComment);
router.post('/admin/:commentId/reject', authenticateToken, requireAdmin, rejectComment);

// admin (sistema de respostas e moderação)
router.post('/reply', authenticateToken, requireSuperAdmin, createReply);
router.get('/replies/:parentId', getReplies);

export default router;


