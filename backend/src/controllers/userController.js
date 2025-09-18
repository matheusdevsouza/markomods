import { UserModel } from '../models/UserModel.js';
import { logError, logInfo } from '../config/logger.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { LogService } from '../services/LogService.js';
// Middleware de upload movido para arquivo separado

// Buscar perfil do usuário
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Remover informações sensíveis
    const { password_hash, ...userProfile } = user;
    
    res.json({
      success: true,
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    logError('Erro ao buscar perfil do usuário', error, { userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { username, email, display_name } = req.body;

    // Verificar se username já existe (se foi alterado)
    if (username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Nome de usuário já está em uso'
        });
      }
    }

    // Verificar se email já existe (se foi alterado)
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Preparar dados para atualização
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (display_name !== undefined) updateData.display_name = display_name;

    // Atualizar usuário
    const updatedUser = await UserModel.update(userId, updateData);
    
    // Remover informações sensíveis
    const { password_hash, ...userProfile } = updatedUser;

    logInfo('Perfil do usuário atualizado', { userId, updates: Object.keys(updateData) });

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    logError('Erro ao atualizar perfil do usuário', error, { userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Upload de avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const userId = req.user.id;
    
    // Construir URL relativa para o avatar (será resolvida pelo frontend)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Atualizar usuário com nova URL do avatar
    const updateResult = await UserModel.update(userId, { avatar_url: avatarUrl });
    
    // Buscar usuário atualizado
    const updatedUser = await UserModel.findById(userId);
    if (!updatedUser) {
      throw new Error('Usuário não encontrado após atualização');
    }
    
    const { password_hash, ...userProfile } = updatedUser;

    // Log da atividade
    await LogService.logUsers(
      userId,
      'Avatar atualizado',
      `Avatar do usuário ${updatedUser.username} foi atualizado`,
      req.ip,
      req.get('User-Agent')
    );

    logInfo('Avatar do usuário atualizado', { userId, avatarUrl });

    res.json({
      success: true,
      message: 'Avatar atualizado com sucesso',
      data: {
        user: userProfile,
        avatarUrl
      }
    });
  } catch (error) {
    logError('Erro ao fazer upload do avatar', error, { userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar perfil do usuário
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remover campos sensíveis
    delete updateData.password;
    delete updateData.role;
    delete updateData.is_verified;
    delete updateData.is_banned;

    const updatedUser = await UserModel.update(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Log da atividade
    await LogService.logUsers(
      userId,
      'Perfil atualizado',
      `Perfil do usuário ${updatedUser.username} foi atualizado`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUser
    });
  } catch (error) {
    logError('Erro ao atualizar perfil', error, { userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Alterar senha
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Buscar usuário atual
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha (o método updatePassword já faz o hash internamente)
    await UserModel.updatePassword(userId, newPassword);

    // Log da atividade
    await LogService.logUsers(
      userId,
      'Senha alterada',
      `Senha do usuário ${user.username} foi alterada`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    logError('Erro ao alterar senha', error, { userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar conta
export const deleteAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { password } = req.body;

    // Verificar senha
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Deletar usuário completamente
    await UserModel.deleteAccountCompletely(userId);

    logInfo('Conta do usuário deletada', { userId });

    res.json({
      success: true,
      message: 'Conta deletada com sucesso'
    });
  } catch (error) {
    logError('Erro ao deletar conta', error, { userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar todos os usuários (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    
    // Log da atividade
    await LogService.logUsers(
      req.user.id,
      'Lista de usuários consultada',
      'Administrador consultou lista completa de usuários',
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logError('Erro ao buscar usuários', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Banir/Desbanir usuário (admin)
export const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_banned, ban_reason } = req.body;

    // Verificar se não está tentando banir a si próprio
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode banir a si próprio'
      });
    }

    // Buscar usuário para verificar role
    const targetUser = await UserModel.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se não está tentando banir um administrador
    if (is_banned && ['admin', 'super_admin'].includes(targetUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível banir administradores'
      });
    }

    // Preparar dados de atualização
    const updateData = { 
      is_banned,
      updated_at: new Date()
    };

    if (is_banned) {
      // Usuário sendo banido
      updateData.ban_reason = ban_reason || 'Banimento administrativo';
      updateData.banned_at = new Date();
      updateData.banned_by = req.user.id;
      
    } else {
      // Usuário sendo desbanido
      updateData.ban_reason = null;
      updateData.banned_at = null;
      updateData.banned_by = null;
      
    }


    const updatedUser = await UserModel.update(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }


    // Log da atividade
    await LogService.logUsers(
      req.user.id,
      is_banned ? 'Usuário banido' : 'Usuário desbanido',
      `Usuário ${updatedUser.username} foi ${is_banned ? 'banido' : 'desbanido'} por ${req.user.username}. ${is_banned ? `Motivo: ${ban_reason}` : ''}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: `Usuário ${is_banned ? 'banido' : 'desbanido'} com sucesso`,
      data: updatedUser
    });
  } catch (error) {
    logError('Erro ao alterar status do usuário', error, { userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Editar usuário (admin)
export const editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, display_name, email, role, is_verified } = req.body;
    const adminId = req.user.id;


    // Verificar se o usuário existe
    const userToEdit = await UserModel.findById(userId);
    if (!userToEdit) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }


    // Verificar se não está tentando editar outro admin (apenas super_admin pode editar admins)
    if ((userToEdit.role === 'admin' || userToEdit.role === 'super_admin') && req.user.role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'Apenas super administradores podem editar outros administradores'
      });
    }


    // Atualizar usuário
    const updatedUser = await UserModel.updateUser(userId, {
      username,
      display_name,
      email,
      role,
      is_verified: is_verified === true || is_verified === 'true'
    });


    res.json({
      success: true,
      message: 'Usuário editado com sucesso',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor: ' + error.message
    });
  }
};

// Deletar usuário (admin)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;


    // Verificar se o usuário a ser deletado existe
    const userToDelete = await UserModel.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }


    // Verificar se não está tentando deletar a si mesmo
    if (userId === adminId) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta'
      });
    }

    // Verificar se não está tentando deletar outro admin
    if (userToDelete.role === 'admin' || userToDelete.role === 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar contas de administradores'
      });
    }


    // Deletar usuário completamente
    await UserModel.deleteAccountCompletely(userId);


    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor: ' + error.message
    });
  }
};
