// middleware para verificar se o usuário tem os cargos permitidas
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // verificar se tem algum cargo permitido
      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Permissões insuficientes'
        });
      }

      // se ele chegou até aqui, tem permissão
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

