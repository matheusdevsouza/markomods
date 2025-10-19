import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword
} from '../middleware/validation.js';
import {
  forgotPasswordRateLimit,
  resetPasswordRateLimit,
  verifyTokenRateLimit
} from '../middleware/rateLimiting.js';

const router = express.Router();

// rotas públicas
router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/forgot-password', forgotPasswordRateLimit(), validateForgotPassword, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordRateLimit(), validateResetPassword, AuthController.resetPassword);
router.get('/verify-reset-token/:token', verifyTokenRateLimit(), AuthController.verifyResetToken);

// rotas protegidas
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/verify', authenticateToken, AuthController.verifyToken);
router.post('/refresh', authenticateToken, AuthController.refreshTokens);
router.post('/change-password', authenticateToken, validateChangePassword, AuthController.changePassword);

// verificação de e-mail
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', authenticateToken, AuthController.resendVerification);

export default router;

