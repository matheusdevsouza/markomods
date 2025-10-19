import express from 'express';
import { uploadAvatar, updateProfile, changePassword, getAllUsers, toggleUserBan, deleteUser, editUser } from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { uploadAvatar as uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateToken);

// rotas para usuários autenticados
router.post('/avatar', uploadMiddleware, uploadAvatar);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

// rotas administrativas
router.get('/', requireAdmin, getAllUsers);
router.patch('/:userId', requireAdmin, editUser);
router.patch('/:userId/ban', requireAdmin, toggleUserBan);
router.delete('/:userId', requireAdmin, deleteUser);

export default router;
