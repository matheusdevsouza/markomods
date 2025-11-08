import { UserModel } from '../models/UserModel.js';
import { logError, logInfo } from '../config/logger.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { LogService } from '../services/LogService.js';
import { AccountDeletionTokenModel } from '../models/AccountDeletionTokenModel.js';
import { EmailService } from '../services/EmailService.js';
import { renderEmailTemplate } from '../services/EmailTemplate.js';
import { v4 as uuidv4 } from 'uuid';
import encryptionService from '../services/EncryptionService.js';

// buscar perfil do usuário
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

    const decryptedUser = encryptionService.decryptUserData(user, true);
    const { password_hash, ...userProfile } = decryptedUser;
    
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

// atualizar perfil do usuário
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

    // verificar se username já existe (se foi alterado)
    if (username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Nome de usuário já está em uso'
        });
      }
    }

    // verificar se email já existe (se foi alterado)
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // preparar dados para atualização
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (display_name !== undefined) updateData.display_name = display_name;

    const userBeforeUpdate = await UserModel.findById(userId);
    const decryptedBeforeUpdate = encryptionService.decryptUserData(userBeforeUpdate, true);
    
    const updatedUser = await UserModel.update(userId, updateData);
    const decryptedUpdatedUser = encryptionService.decryptUserData(updatedUser, true);
    
    const { password_hash, ...userProfile } = decryptedUpdatedUser;

    logInfo('Perfil do usuário atualizado', { userId, updates: Object.keys(updateData) });
    
    const changes = [];
    if (username && username !== decryptedBeforeUpdate?.username) {
      changes.push(`username: ${decryptedBeforeUpdate?.username || 'N/A'} → ${username}`);
      try {
        console.log('📝 Criando log de alteração de username...');
        await LogService.logProfileChange(
          userId,
          'Nome de usuário alterado',
          `Usuário alterou nome de usuário de "${decryptedBeforeUpdate?.username || 'N/A'}" para "${username}"`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          { field: 'username', old: decryptedBeforeUpdate?.username, new: username },
          { action: 'username_change' }
        );
        console.log('✅ Log de alteração de username criado');
      } catch (logErr) {
        console.error('❌ Erro ao criar log de alteração de username:', logErr);
        logError('Erro ao criar log de alteração de username', logErr, { userId });
      }
    }
    
    if (display_name !== undefined && display_name !== decryptedBeforeUpdate?.display_name) {
      changes.push(`display_name: ${decryptedBeforeUpdate?.display_name || 'N/A'} → ${display_name || 'N/A'}`);
      try {
        console.log('📝 Criando log de alteração de display_name...');
        await LogService.logProfileChange(
          userId,
          'Nome de exibição alterado',
          `Usuário alterou nome de exibição de "${decryptedBeforeUpdate?.display_name || 'N/A'}" para "${display_name || 'N/A'}"`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          { field: 'display_name', old: decryptedBeforeUpdate?.display_name, new: display_name },
          { action: 'display_name_change' }
        );
        console.log('✅ Log de alteração de display_name criado');
      } catch (logErr) {
        console.error('❌ Erro ao criar log de alteração de display_name:', logErr);
        logError('Erro ao criar log de alteração de display_name', logErr, { userId });
      }
    }
    
    if (email && email !== decryptedBeforeUpdate?.email) {
      changes.push(`email: ${decryptedBeforeUpdate?.email || 'N/A'} → ${email}`);
      try {
        console.log('📝 Criando log de alteração de email...');
        await LogService.logProfileChange(
          userId,
          'Email alterado',
          `Usuário alterou email de "${decryptedBeforeUpdate?.email || 'N/A'}" para "${email}"`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          { field: 'email', old: decryptedBeforeUpdate?.email, new: email },
          { action: 'email_change' }
        );
        console.log('✅ Log de alteração de email criado');
      } catch (logErr) {
        console.error('❌ Erro ao criar log de alteração de email:', logErr);
        logError('Erro ao criar log de alteração de email', logErr, { userId });
      }
    }

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

// upload de avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const userId = req.user.id;
    
    const userBeforeUpdate = await UserModel.findById(userId);
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updateResult = await UserModel.update(userId, { avatar_url: avatarUrl });
    
    const updatedUser = await UserModel.findById(userId);
    if (!updatedUser) {
      throw new Error('Usuário não encontrado após atualização');
    }
    
    const { password_hash, ...userProfile } = updatedUser;

    try {
      console.log('📝 Criando log de alteração de avatar...');
      await LogService.logProfileChange(
      userId,
      'Avatar atualizado',
        `Usuário alterou sua foto de perfil`,
        req.ip || 'N/A',
        req.get('User-Agent') || 'N/A',
        { field: 'avatar_url', old: userBeforeUpdate?.avatar_url, new: avatarUrl },
        { 
          action: 'avatar_change',
          avatar_url: avatarUrl,
          filename: req.file?.filename,
          file_size: req.file?.size
        }
      );
      console.log('✅ Log de alteração de avatar criado');
    } catch (logErr) {
      console.error('❌ Erro ao criar log de alteração de avatar:', logErr);
      logError('Erro ao criar log de alteração de avatar', logErr, { userId });
    }

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

// atualizar perfil 
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // remover campos sensíveis
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

    // log da atividade
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

// alterar senha
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // buscar usuário atual
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // atualizar senha
    await UserModel.updatePassword(userId, newPassword);

    // log da atividade
    try {
      await LogService.logPasswordChange(
      userId,
      'Senha alterada',
      `Senha do usuário ${user.username} foi alterada`,
        req.ip || 'N/A',
        req.get('User-Agent') || 'N/A',
        { action: 'password_change' }
    );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de alteração de senha:', logErr);
    }

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

// solicitar exclusão de conta (enviar email de confirmação)
export const requestAccountDeletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, confirmPassword } = req.body;

    // validar senha
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, digite sua senha duas vezes para confirmar'
      });
    }

    // verificar se as senhas sao iguais
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'As senhas não coincidem'
      });
    }

    // buscar user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    const decryptedUser = encryptionService.decryptUserData(user, true);
    await AccountDeletionTokenModel.invalidateUserTokens(userId);
    const tokenId = uuidv4();
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await AccountDeletionTokenModel.create({
      id: tokenId,
      userId: user.id,
      token: token,
      expiresAt: expiresAt
    });

    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const deleteUrl = `${baseUrl}/confirm-account-deletion?token=${encodeURIComponent(token)}`;

    await EmailService.sendMail({
      to: decryptedUser.email,
      subject: 'Confirmar Exclusão de Conta - Eu, Marko!',
      html: renderEmailTemplate({
        preheader: 'Confirme a exclusão permanente da sua conta',
        title: 'Confirmar Exclusão de Conta',
        intro: `
          <p style="margin: 0 0 16px 0;">Olá <strong>${decryptedUser.display_name || decryptedUser.username}</strong>,</p>
          <p style="margin: 0 0 16px 0;">Recebemos uma solicitação para excluir permanentemente sua conta no <strong>Eu, Marko!</strong></p>
          <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #DC2626; font-weight: 600; margin: 0; font-size: 15px;">
              ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL
            </p>
          </div>
          <p style="margin: 0 0 12px 0;">Todos os dados relacionados à sua conta serão <strong>permanentemente excluídos</strong>, incluindo:</p>
          <ul style="text-align: left; margin: 12px 0; padding-left: 24px; line-height: 1.8;">
            <li>Seu perfil e informações pessoais</li>
            <li>Seus mods e conteúdo criado</li>
            <li>Seus comentários e interações</li>
            <li>Seus favoritos e downloads</li>
            <li>Todo o histórico de atividades</li>
          </ul>
          <p style="margin: 16px 0 0 0;">Se você realmente deseja excluir sua conta, clique no botão abaixo. Caso contrário, ignore este e-mail.</p>
        `,
        buttonText: 'Confirmar Exclusão de Conta',
        buttonUrl: deleteUrl,
        buttonColor: '#DC2626', 
        secondary: `Se o botão não funcionar, copie e cole este link no navegador:<br/><a href="${deleteUrl}" style="word-break: break-all;">${deleteUrl}</a>`,
        timingNote: 'Este link expira em 24 horas. Se você não solicitou a exclusão, ignore este e-mail.',
        footerNote: 'Este é um e-mail automático. Não responda.'
      })
    });

    try {
      await LogService.logSecurity(
        userId,
        'Solicitação de exclusão de conta',
        `Usuário ${user.username} solicitou exclusão de conta`,
        req.ip || 'N/A',
        req.get('User-Agent') || 'N/A',
        'warning',
        { action: 'account_deletion_requested' }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de solicitação de exclusão:', logErr);
    }

    logInfo('Solicitação de exclusão de conta enviada', { userId, email: user.email });

    res.json({
      success: true,
      message: 'E-mail de confirmação de exclusão enviado. Verifique sua caixa de entrada.'
    });
  } catch (error) {
    logError('Erro ao solicitar exclusão de conta', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const verifyDeletionToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const tokenRecord = await AccountDeletionTokenModel.findByToken(token);
    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    res.json({
      success: true,
      message: 'Token válido'
    });
  } catch (error) {
    logError('Erro ao verificar token de exclusão', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const confirmAccountDeletion = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de confirmação não fornecido'
      });
    }

    const tokenRecord = await AccountDeletionTokenModel.findByToken(token);
    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    const user = await UserModel.findById(tokenRecord.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const decryptedUser = encryptionService.decryptUserData(user, true);

    await AccountDeletionTokenModel.markUsed(tokenRecord.id);

      try {
        await LogService.logSecurity(
          tokenRecord.user_id,
          'Conta excluída permanentemente',
          `Conta do usuário ${decryptedUser.username} foi excluída permanentemente via confirmação de email`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          'error',
          { action: 'account_deleted_permanently', email: decryptedUser.email }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de exclusão de conta:', logErr);
      }

    await UserModel.deleteAccountCompletely(tokenRecord.user_id);

    logInfo('Conta do usuário deletada permanentemente', { userId: tokenRecord.user_id, email: decryptedUser.email });

    res.json({
      success: true,
      message: 'Conta excluída permanentemente com sucesso'
    });
  } catch (error) {
    logError('Erro ao confirmar exclusão de conta', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

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

    // verificar senha
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // deletar usuário completamente
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

// buscar todos os usuários (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll({}, true);
    
    // log da atividade
    await LogService.logUsers(
      req.user.id,
      'Lista de usuários visualizada',
      'Administrador visualizou lista completa de usuários',
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

// banir/desbanir usuário (admin)
export const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_banned, ban_reason } = req.body;

    // verificar se não está tentando banir a propria conta
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode banir a si próprio'
      });
    }

    // buscar usuário para verificar o cargo
    const targetUser = await UserModel.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // verificar se não está tentando banir um administrador
    if (is_banned && ['supervisor', 'admin'].includes(targetUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível banir administradores'
      });
    }

    // preparar dados de atualização
    const updateData = { 
      is_banned,
      updated_at: new Date()
    };

    if (is_banned) {

      // usuário sendo banido (se nao tiver motivo = banimento administrativo)
      updateData.ban_reason = ban_reason || 'Banimento administrativo';
      updateData.banned_at = new Date();
      updateData.banned_by = req.user.id;
      
    } else {

      // usuário sendo desbanido
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

    const decryptedUpdatedUser = encryptionService.decryptUserData(updatedUser, true);
    const adminUser = await UserModel.findById(req.user.id, true);
    const decryptedAdminUser = encryptionService.decryptUserData(adminUser, true);

    // log da atividade
    await LogService.logUsers(
      req.user.id,
      is_banned ? 'Usuário banido' : 'Usuário desbanido',
      `Usuário ${decryptedUpdatedUser.username} foi ${is_banned ? 'banido' : 'desbanido'} por ${decryptedAdminUser.username}. ${is_banned ? `Motivo: ${ban_reason}` : ''}`,
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

// editar usuário (admin)
export const editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, display_name, email, role, is_verified } = req.body;
    const adminId = req.user.id;


    // verificar se o usuário existe
    const userToEdit = await UserModel.findById(userId, true);
    if (!userToEdit) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }


    // verificar se não está tentando editar outro admin
    if ((userToEdit.role === 'supervisor' || userToEdit.role === 'admin') && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Apenas administradores podem editar outros administradores'
      });
    }


    const updatedUser = await UserModel.updateUser(userId, {
      username,
      display_name,
      email,
      role,
      is_verified: is_verified !== undefined ? is_verified : undefined
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

// deletar usuário (admin)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;


    // verificar se o usuário que está sendo deletado existe
    const userToDelete = await UserModel.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }


    // verificar se não está tentando deletar a propria conta
    if (userId === adminId) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta'
      });
    }

    // verificar se não está tentando deletar outro admin
    if (userToDelete.role === 'supervisor' || userToDelete.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar contas de administradores'
      });
    }


    // deletar usuário completamente
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
