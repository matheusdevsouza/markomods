import { JWTService } from '../services/JWTService.js';
import { UserModel } from '../models/UserModel.js';
import { logError, logWarn } from '../config/logger.js';

// Middleware de autenticação básica
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    // Verificar token
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
    
    // Buscar usuário no banco
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
    
    // Adicionar usuário ao request
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

// Middleware para verificar se usuário está autenticado (opcional)
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
    // Em caso de erro, continuar sem autenticação
    next();
  }
};

// Middleware para verificar permissões de admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
  }
  
  const allowedRoles = ['admin', 'super_admin', 'moderator'];
  
  if (!allowedRoles.includes(req.user.role)) {
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

// Middleware para verificar permissões de super admin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
  }
  
  if (req.user.role !== 'super_admin') {
    logWarn('Tentativa de acesso não autorizado (Super Admin)', {
      userId: req.user.id,
      userRole: req.user.role,
      endpoint: req.originalUrl
    });
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas super administradores.'
    });
  }
  
  next();
};

// Middleware para verificar permissões de moderador
export const requireModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
  }
  
  if (!['moderator', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas moderadores.'
    });
  }
  
  next();
};

// Middleware para verificar roles específicos
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
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

// Middleware para verificar ownership (usuário só pode acessar seus próprios recursos)
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticação necessária'
        });
      }
      
      // Admins podem acessar qualquer recurso
      if (['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
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
      
      // Verificar se o usuário é o dono do recurso
      // Esta lógica pode ser expandida conforme necessário
      if (resourceType === 'user' && resourceId === req.user.id) {
        return next();
      }
      
      // Para outros tipos de recursos, implementar verificação específica
      // Por enquanto, apenas usuários podem acessar seus próprios recursos
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

// Middleware para verificar se usuário está verificado
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

// Middleware que permite acesso público para GET requests em rotas específicas
export const publicOrAuthenticated = async (req, res, next) => {
  try {
    // Se for GET request para buscar mod por ID, permitir acesso público
    if (req.method === 'GET' && req.params.id && !isNaN(req.params.id)) {
      return next();
    }
    
    // Para outras rotas, verificar autenticação
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    // Verificar token
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
    
    // Buscar usuário no banco
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
    
    // Adicionar usuário ao request
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

// Middleware para comentários: acesso público mas com autenticação opcional
export const commentsPublicOrAuthenticated = async (req, res, next) => {
  try {
    // Permitir acesso público para GET requests
    if (req.method === 'GET') {
      // Se houver token, processá-lo para obter informações do usuário
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        try {
          // Verificar token
          const verification = JWTService.verifyAccessToken(token);
          
          if (verification.valid) {
            // Buscar usuário no banco
            const user = await UserModel.findById(verification.payload.id);
            
            if (user && !user.is_banned) {
              // Adicionar usuário ao request
              req.user = user;
              req.token = token;
            }
          }
        } catch (tokenError) {
          // Se houver erro no token, continuar sem autenticação
        }
      }
      
      // Sempre permitir acesso para GET requests
      return next();
    }
    
    // Para outros métodos, verificar autenticação
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    // Verificar token
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
    
    // Buscar usuário no banco
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
    
    // Adicionar usuário ao request
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

