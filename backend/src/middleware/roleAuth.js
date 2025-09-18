/**
 * Middleware para verificar se o usuário tem as roles necessárias
 * @param {string[]} allowedRoles - Array de roles permitidas
 * @returns {Function} Middleware function
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // Verificar se o usuário tem uma das roles permitidas
      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Permissões insuficientes'
        });
      }

      // Se chegou até aqui, o usuário tem permissão
      next();
    } catch (error) {
      console.error('Erro na verificação de role:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

// Export já foi feito acima com export const requireRole
