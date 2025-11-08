import express from 'express';
import { uploadAvatar, updateProfile, changePassword, getAllUsers, toggleUserBan, deleteUser, editUser, requestAccountDeletion, confirmAccountDeletion, verifyDeletionToken } from '../controllers/userController.js';
import { authenticateToken, requirePermission, optionalAuth } from '../middleware/auth.js';
import { uploadAvatar as uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();
router.get('/account/delete/verify', verifyDeletionToken);
router.post('/account/delete/confirm', optionalAuth, confirmAccountDeletion);
router.use(authenticateToken);

router.post('/avatar', uploadMiddleware, uploadAvatar);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.post('/account/delete/request', requestAccountDeletion);

router.get('/', requirePermission('view_users'), getAllUsers);
router.patch('/:userId', requirePermission('manage_users'), editUser);
router.patch('/:userId/ban', requirePermission('manage_users'), toggleUserBan);
router.delete('/:userId', requirePermission('manage_users'), deleteUser);

export default router;
