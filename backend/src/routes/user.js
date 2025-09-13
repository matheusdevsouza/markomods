import express from 'express';
import { uploadAvatar, updateProfile, changePassword, getAllUsers, toggleUserBan, deleteUser, editUser } from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { uploadAvatar as uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas para usuários autenticados
router.post('/avatar', uploadMiddleware, uploadAvatar);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

// Rotas administrativas (requerem admin)
router.get('/', requireAdmin, getAllUsers);
router.patch('/:userId', requireAdmin, editUser);
router.patch('/:userId/ban', requireAdmin, toggleUserBan);
router.delete('/:userId', requireAdmin, deleteUser);

export default router;
