import express from 'express';
import { authenticateToken, requireAdmin, requireSuperAdmin, requirePermission, commentsPublicOrAuthenticated } from '../middleware/auth.js';
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

router.get('/mod/:modId', commentsPublicOrAuthenticated, listCommentsByMod);

router.post('/', authenticateToken, createComment);

router.delete('/:commentId', authenticateToken, deleteComment);
router.post('/:commentId/vote', authenticateToken, voteComment);
router.get('/user/list', authenticateToken, getUserComments);
router.get('/user/count', authenticateToken, getUserCommentsCount);
router.get('/admin/pending', authenticateToken, requirePermission('view_comments'), getPendingComments);
router.get('/admin/rejected', authenticateToken, requirePermission('view_comments'), getRejectedComments);
router.get('/admin/recent', authenticateToken, requirePermission('view_comments'), getRecentComments);
router.post('/admin/:commentId/approve', authenticateToken, requirePermission('manage_comments'), approveComment);
router.post('/admin/:commentId/reject', authenticateToken, requirePermission('manage_comments'), rejectComment);

router.post('/reply', authenticateToken, requireSuperAdmin, createReply);
router.get('/replies/:parentId', getReplies);

export default router;


