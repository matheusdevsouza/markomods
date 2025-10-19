import express from 'express';
import { 
  updateProfile,
  changePassword,
  updatePrivacySettings,
  updateNotificationSettings,
  updateThemeSettings,
  updateLanguageSettings,
  updateAccountSettings,
  deleteAccount
} from '../controllers/userSettingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// configuracoes (perfil, senha, privacidade, notificacoes, tema, idioma, conta e excluir conta)
router.put('/profile', updateProfile);

router.put('/change-password', changePassword);

router.put('/privacy-settings', updatePrivacySettings);

router.put('/notification-settings', updateNotificationSettings);

router.put('/theme-settings', updateThemeSettings);

router.put('/language-settings', updateLanguageSettings);

router.put('/account-settings', updateAccountSettings);

router.delete('/delete-account', deleteAccount);

export default router;

