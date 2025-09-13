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

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Configurações de perfil
router.put('/profile', updateProfile);

// Configurações de senha
router.put('/change-password', changePassword);

// Configurações de privacidade
router.put('/privacy-settings', updatePrivacySettings);

// Configurações de notificações
router.put('/notification-settings', updateNotificationSettings);

// Configurações de tema
router.put('/theme-settings', updateThemeSettings);

// Configurações de idioma
router.put('/language-settings', updateLanguageSettings);

// Configurações de conta
router.put('/account-settings', updateAccountSettings);

// Excluir conta (sistema existente para admins)
router.delete('/delete-account', deleteAccount);

export default router;

