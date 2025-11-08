import { JWTService } from '../services/JWTService.js';
import { UserModel } from '../models/UserModel.js';
import { RolePermissionsModel } from '../models/RolePermissionsModel.js';
import { logError, logWarn, logInfo } from '../config/logger.js';
import { LogService } from '../services/LogService.js';
import encryptionService from '../services/EncryptionService.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; 
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    if (!token) {
      try {
        await LogService.logUnauthorizedAccess(
          ip,
          userAgent,
          'Token de acesso não fornecido',
          `Tentativa de acesso à rota protegida ${req.method} ${req.path} sem token de autenticação`,
          {
            path: req.path,
            method: req.method,
            reason: 'no_token'
          }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de acesso não autorizado:', logErr);
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    const verification = JWTService.verifyAccessToken(token);
    
    if (!verification.valid) {
      try {
        await LogService.logUnauthorizedAccess(
          ip,
          userAgent,
          verification.error === 'TOKEN_EXPIRED' ? 'Token expirado' : 'Token inválido',
          `Tentativa de acesso à rota protegida ${req.method} ${req.path} com token inválido. Erro: ${verification.error || 'invalid_token'}`,
          {
            path: req.path,
            method: req.method,
            reason: verification.error || 'invalid_token',
            tokenPreview: token.substring(0, 20) + '...'
          }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de token inválido:', logErr);
      }
      
      if (verification.error === 'TOKEN_EXPIRED') {
        return res.status(401).json({
          success: false,
          message: 'Token de acesso expirado',
          error: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token de acesso inválido'
      });
    }
    
    const user = await UserModel.findById(verification.payload.id);
    
    if (!user) {
      try {
        await LogService.logSecurity(
          verification.payload.id,
          'Tentativa de acesso com usuário inexistente',
          `Token válido para usuário ${verification.payload.id} mas usuário não encontrado no banco de dados. Rota: ${req.method} ${req.path}`,
          ip,
          userAgent,
          'error',
          {
            path: req.path,
            method: req.method,
            userId: verification.payload.id,
            reason: 'user_not_found'
          }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de usuário não encontrado:', logErr);
      }
      
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    if (user.is_banned) {
      const decryptedUser = encryptionService.decryptUserData(user, true);
      try {
        await LogService.logSecurity(
          user.id,
          'Tentativa de acesso com conta banida',
          `Usuário banido tentou acessar rota protegida: ${req.method} ${req.path}. Motivo do banimento: ${user.ban_reason || 'Não especificado'}`,
          ip,
          userAgent,
          'warning',
          {
            path: req.path,
            method: req.method,
            userId: user.id,
            username: decryptedUser.username,
            banReason: user.ban_reason,
            reason: 'account_banned'
          }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de conta banida:', logErr);
      }
      
      return res.status(403).json({
        success: false,
        message: 'Conta suspensa ou banida'
      });
    }
    
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    logError('Erro no middleware de autenticação', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    
    if (token) {
      try {
        const verification = JWTService.verifyAccessToken(token);
        
        if (verification.valid) {
          const user = await UserModel.findById(verification.payload.id);
          if (user && !user.is_banned) {
            req.user = user;
            req.token = token;
          }
        } else {
        }
      } catch (tokenError) {
      }
    } else {
    }
    
    next();
  } catch (error) {
    next();
  }
};

export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
  }
  
  const allowedRoles = ['supervisor', 'admin', 'moderator'];
  
  if (!allowedRoles.includes(req.user.role)) {
    const decryptedUser = encryptionService.decryptUserData(req.user, true);
    try {
      await LogService.logSecurity(
        req.user.id,
        'Tentativa de acesso sem permissão de administrador',
        `Usuário com role '${req.user.role}' tentou acessar rota administrativa: ${req.method} ${req.originalUrl}. Roles permitidos: ${allowedRoles.join(', ')}`,
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        'warning',
        {
          path: req.originalUrl,
          method: req.method,
          userId: req.user.id,
          username: decryptedUser.username,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          reason: 'insufficient_permissions'
        }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de acesso sem permissão:', logErr);
    }
    
    logWarn('Tentativa de acesso não autorizado', {
      userId: req.user.id,
      userRole: req.user.role,
      requiredRoles: allowedRoles,
      endpoint: req.originalUrl
    });
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissões insuficientes.'
    });
  }
  
  next();
};

export const requireAdminOrSuperAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
  }
  
  const allowedRoles = ['supervisor', 'admin'];
  
  if (!allowedRoles.includes(req.user.role)) {
    const decryptedUser = encryptionService.decryptUserData(req.user, true);
    try {
      await LogService.logSecurity(
        req.user.id,
        'Tentativa de acesso de moderador a rota restrita',
        `Moderador tentou acessar rota restrita apenas para admin/supervisor: ${req.method} ${req.originalUrl}`,
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        'warning',
        {
          path: req.originalUrl,
          method: req.method,
          userId: req.user.id,
          username: decryptedUser.username,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          reason: 'moderator_blocked'
        }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de moderador bloqueado:', logErr);
    }
    
    logWarn('Tentativa de acesso não autorizado (Moderador bloqueado)', {
      userId: req.user.id,
      userRole: req.user.role,
      requiredRoles: allowedRoles,
      endpoint: req.originalUrl
    });
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores têm acesso a esta funcionalidade.'
    });
  }
  
  next();
};

export const requireSuperAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
  }
  
  if (req.user.role !== 'admin') {
    const decryptedUser = encryptionService.decryptUserData(req.user, true);
    try {
      await LogService.logSecurity(
        req.user.id,
        'Tentativa de acesso a rota de super administrador',
        `Usuário com role '${req.user.role}' tentou acessar rota restrita apenas para admin: ${req.method} ${req.originalUrl}`,
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        'error',
        {
          path: req.originalUrl,
          method: req.method,
          userId: req.user.id,
          username: decryptedUser.username,
          userRole: req.user.role,
          requiredRole: 'admin',
          reason: 'super_admin_only'
        }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de super admin:', logErr);
    }
    
    logWarn('Tentativa de acesso não autorizado (Apenas Admin)', {
      userId: req.user.id,
      userRole: req.user.role,
      endpoint: req.originalUrl
    });
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
  
  next();
};

export const requireModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
  }
  
      if (!['moderator', 'supervisor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas moderadores.'
    });
  }
  
  next();
};

export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária'
      });
    }
    
      if (!allowedRoles.includes(req.user.role)) {
      const decryptedUser = encryptionService.decryptUserData(req.user, true);
      try {
        await LogService.logSecurity(
          req.user.id,
          'Tentativa de acesso sem role adequada',
          `Usuário com role '${req.user.role}' tentou acessar rota que requer roles: ${allowedRoles.join(', ')}. Rota: ${req.method} ${req.originalUrl}`,
          req.ip || 'unknown',
          req.get('User-Agent') || 'unknown',
          'warning',
          {
            path: req.originalUrl,
            method: req.method,
            userId: req.user.id,
            username: decryptedUser.username,
            userRole: req.user.role,
            requiredRoles: allowedRoles,
            reason: 'insufficient_role'
          }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de role insuficiente:', logErr);
      }
      
      logWarn('Tentativa de acesso não autorizado', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.originalUrl
      });
      
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.'
      });
    }
    
    next();
  };
};

export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticação necessária'
        });
      }
      
      if (['supervisor', 'admin', 'moderator'].includes(req.user.role)) {
        return next();
      }
      
      let resourceId;
      
      switch (resourceType) {
        case 'user':
          resourceId = req.params.userId || req.params.id;
          break;
        case 'mod':
          resourceId = req.params.modId;
          break;
        case 'comment':
          resourceId = req.params.commentId;
          break;
        default:
          resourceId = req.params.id;
      }
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID do recurso não fornecido'
        });
      }
      
      if (resourceType === 'user' && resourceId === req.user.id) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar este recurso.'
      });
      
    } catch (error) {
      logError('Erro no middleware de ownership', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
  }
  
  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: 'Conta não verificada. Verifique seu email antes de continuar.'
    });
  }
  
  next();
};

export const publicOrAuthenticated = async (req, res, next) => {
  try {
    if (req.method === 'GET' && req.params.id && !isNaN(req.params.id)) {
      return next();
    }
    
    if (req.method === 'POST' && req.params.id && req.path.endsWith('/download')) {
      return next();
    }
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    const verification = JWTService.verifyAccessToken(token);
    
    if (!verification.valid) {
      if (verification.error === 'TOKEN_EXPIRED') {
        return res.status(401).json({
          success: false,
          message: 'Token de acesso expirado',
          error: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token de acesso inválido'
      });
    }
    
    const user = await UserModel.findById(verification.payload.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        message: 'Conta suspensa ou banida'
      });
    }
    
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    logError('Erro no middleware publicOrAuthenticated', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const commentsPublicOrAuthenticated = async (req, res, next) => {
  try {
    if (req.method === 'GET') {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        try {
          const verification = JWTService.verifyAccessToken(token);
          
          if (verification.valid) {
            const user = await UserModel.findById(verification.payload.id);
            
            if (user && !user.is_banned) {
              req.user = user;
              req.token = token;
            }
          }
        } catch (tokenError) {
        }
      }
      
      return next();
    }
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    const verification = JWTService.verifyAccessToken(token);
    
    if (!verification.valid) {
      if (verification.error === 'TOKEN_EXPIRED') {
        return res.status(401).json({
          success: false,
          message: 'Token de acesso expirado',
          error: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token de acesso inválido'
      });
    }
    
    const user = await UserModel.findById(verification.payload.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        message: 'Conta suspensa ou banida'
      });
    }
    
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    logError('Erro no middleware commentsPublicOrAuthenticated', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticação necessária'
        });
      }

      const userRole = req.user.role;

      if (userRole === 'admin') {
        return next();
      }

      const hasPermission = await RolePermissionsModel.hasPermission(userRole, permission);

      if (!hasPermission) { 
        const decryptedUser = encryptionService.decryptUserData(req.user, true);
        try {
          await LogService.logSecurity(
            req.user.id,
            'Tentativa de acesso sem permissão específica',
            `Usuário com role '${userRole}' tentou acessar rota que requer permissão '${permission}'. Rota: ${req.method} ${req.originalUrl}`,
            req.ip || 'unknown',
            req.get('User-Agent') || 'unknown',
            'warning',
            {
              path: req.originalUrl,
              method: req.method,
              userId: req.user.id,
              username: decryptedUser.username,
              userRole: userRole,
              requiredPermission: permission,
              reason: 'insufficient_permission'
            }
          );
        } catch (logErr) {
          console.error('❌ Erro ao criar log de permissão insuficiente:', logErr);
        }
        
        logWarn('Tentativa de acesso sem permissão', {
          userId: req.user.id,
          userRole: userRole,
          requiredPermission: permission,
          endpoint: req.originalUrl
        });

        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Você não tem permissão para realizar esta ação.'
        });
      }

      next();
    } catch (error) {
      logError('Erro ao verificar permissão', error, {
        userId: req.user?.id,
        permission: permission
      });

      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar permissões'
      });
    }
  };
};

