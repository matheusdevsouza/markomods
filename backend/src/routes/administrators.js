import express from 'express';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';
import { UserModel } from '../models/UserModel.js';
import { RolePermissionsModel } from '../models/RolePermissionsModel.js';
import { logError, logInfo, logWarn } from '../config/logger.js';
import encryptionService from '../services/EncryptionService.js';

const router = express.Router();

router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const administrators = await UserModel.findByRoles(['moderator', 'supervisor', 'admin'], true);
    
    res.json({
      success: true,
      data: administrators
    });
  } catch (error) {
    logError('Erro ao listar administradores', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar administradores'
    });
  }
});

router.patch('/:userId/role', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole, password } = req.body;
    const currentUserId = req.user.id;

    const user = await UserModel.findById(userId, true);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode alterar seu próprio cargo'
      });
    }

    const allowedRoles = ['member', 'moderator', 'supervisor', 'admin'];
    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Cargo inválido'
      });
    }

      if (newRole === 'admin' && user.role !== 'admin') {
        if (!password) {
          return res.status(400).json({
            success: false,
            message: 'Senha de confirmação necessária para promover para Admin'
          });
        }

        const superAdminPassword = process.env.SUPER_ADMIN_PROMOTION_PASSWORD;
        
        if (!superAdminPassword) {
          logError('SUPER_ADMIN_PROMOTION_PASSWORD não configurada no .env');
          return res.status(500).json({
            success: false,
            message: 'Configuração de segurança não encontrada'
          });
        }

        const trimmedPassword = (password || '').trim();
        const trimmedSuperAdminPassword = (superAdminPassword || '').trim();
        
        logInfo('Verificando senha de promoção para admin', {
          providedPasswordLength: trimmedPassword.length,
          expectedPasswordLength: trimmedSuperAdminPassword.length,
          passwordsMatch: trimmedPassword === trimmedSuperAdminPassword
        });
        
        const isValidPassword = trimmedPassword === trimmedSuperAdminPassword;

        if (!isValidPassword) {
          logWarn('Tentativa de promover para admin com senha incorreta', {
            userId: currentUserId,
            targetUserId: userId,
            targetUsername: user.username,
            providedPasswordLength: trimmedPassword.length,
            expectedPasswordLength: trimmedSuperAdminPassword.length,
            providedPasswordFirstChar: trimmedPassword.length > 0 ? trimmedPassword[0] : 'empty',
            expectedPasswordFirstChar: trimmedSuperAdminPassword.length > 0 ? trimmedSuperAdminPassword[0] : 'empty'
          });
          return res.status(403).json({
            success: false,
            message: 'Senha de confirmação incorreta'
          });
        }
      }

    if (user.role === 'admin' && newRole !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível rebaixar um Admin. Esta ação é permanente.'
      });
    }

    await UserModel.updateRole(userId, newRole);

    logInfo('Cargo de administrador atualizado', {
      adminId: currentUserId,
      targetUserId: userId,
      oldRole: user.role,
      newRole: newRole
    });

    const updatedUser = await UserModel.findById(userId, true);

    res.json({
      success: true,
      message: `Cargo atualizado para ${newRole}`,
      data: updatedUser
    });
  } catch (error) {
    logError('Erro ao atualizar cargo', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cargo'
    });
  }
});

router.get('/permissions', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const allPermissions = await RolePermissionsModel.findAll();
    
    res.json({
      success: true,
      data: allPermissions
    });
  } catch (error) {
    logError('Erro ao buscar permissões', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar permissões'
    });
  }
});

router.get('/my-permissions', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (req.user.role === 'admin') {
      return res.json({
        success: true,
        data: [{ role: 'admin', permissions: {}, isSuperAdmin: true }]
      });
    }

    const rolePermissions = await RolePermissionsModel.findByRole(req.user.role);
    
    if (!rolePermissions) {
      return res.json({
        success: true,
        data: [{ role: req.user.role, permissions: {} }]
      });
    }

    res.json({
      success: true,
      data: [rolePermissions]
    });
  } catch (error) {
    logError('Erro ao buscar permissões do usuário', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar permissões'
    });
  }
});

router.put('/permissions/:role', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;

    const allowedRoles = ['moderator', 'supervisor', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Cargo inválido'
      });
    }

    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível alterar permissões do Admin'
      });
    }

    await RolePermissionsModel.updatePermissions(role, permissions);

    logInfo('Permissões do cargo atualizadas', {
      adminId: req.user.id,
      role: role
    });

    const updatedPermissions = await RolePermissionsModel.findByRole(role);

    res.json({
      success: true,
      message: 'Permissões atualizadas com sucesso',
      data: updatedPermissions
    });
  } catch (error) {
    logError('Erro ao atualizar permissões', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar permissões'
    });
  }
});

export default router;

