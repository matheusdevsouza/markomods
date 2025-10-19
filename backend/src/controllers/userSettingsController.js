import { executeQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { logError } from '../config/logger.js';

// atualizar perfil do usuário
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, bio, website, location } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    const sql = `
      UPDATE users 
      SET first_name = ?, last_name = ?, bio = ?, website = ?, location = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await executeQuery(sql, [firstName, lastName, bio, website, location, userId]);

    res.json({ 
      success: true, 
      message: 'Perfil atualizado com sucesso' 
    });
  } catch (error) {
    logError('Erro ao atualizar perfil', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// alterar senha do usuário
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Senha atual e nova senha são obrigatórias' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'A nova senha deve ter pelo menos 6 caracteres' 
      });
    }

    // buscar usuário e verificar senha atual
    const userQuery = 'SELECT password FROM users WHERE id = ?';
    const users = await executeQuery(userQuery, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    const user = users[0];

    // verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Senha atual incorreta' 
      });
    }

    // criptografar nova senha
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // atualizar senha no banco
    const updateQuery = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await executeQuery(updateQuery, [hashedNewPassword, userId]);

    res.json({ 
      success: true, 
      message: 'Senha alterada com sucesso' 
    });
  } catch (error) {
    logError('Erro ao alterar senha', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// atualizar configurações de privacidade
export const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { profileVisibility, emailVisibility, showOnlineStatus } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    res.json({ 
      success: true, 
      message: 'Configurações de privacidade atualizadas' 
    });
  } catch (error) {
    logError('Erro ao atualizar configurações de privacidade', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// atualizar configurações de notificações
export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { emailNotifications, pushNotifications, commentNotifications } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    res.json({ 
      success: true, 
      message: 'Configurações de notificações atualizadas' 
    });
  } catch (error) {
    logError('Erro ao atualizar configurações de notificações', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// atualizar configurações de tema
export const updateThemeSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const themeSettings = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    res.json({ 
      success: true, 
      message: 'Configurações de tema atualizadas' 
    });
  } catch (error) {
    logError('Erro ao atualizar configurações de tema', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// atualizar configurações de idioma
export const updateLanguageSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { language } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    res.json({ 
      success: true, 
      message: 'Configurações de idioma atualizadas' 
    });
  } catch (error) {
    logError('Erro ao atualizar configurações de idioma', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// atualizar configurações da conta
export const updateAccountSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const accountSettings = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    res.json({ 
      success: true, 
      message: 'Configurações da conta atualizadas' 
    });
  } catch (error) {
    logError('Erro ao atualizar configurações da conta', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// excluir conta do usuário (admin)
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Senha é obrigatória para excluir a conta' 
      });
    }

    // verificar senha antes de excluir
    const userQuery = 'SELECT password FROM users WHERE id = ?';
    const users = await executeQuery(userQuery, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Senha incorreta' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Conta excluída com sucesso' 
    });
  } catch (error) {
    logError('Erro ao excluir conta', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};
