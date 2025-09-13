import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMods';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = React.memo(({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  requireModerator = false,
  requireSuperAdmin = false,
  requireOwnership = false,
  requireVerified = false,
  userId = null
}) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Rota que requer autenticação
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se usuário está banido
  if (isAuthenticated && currentUser && currentUser.is_banned) {
    return <Navigate to="/banned" replace />;
  }

  // Rota que requer admin
  if (requireAdmin && (!currentUser || !['admin', 'super_admin', 'moderator'].includes(currentUser.role))) {
    return <Navigate to="/" replace />;
  }

  // Rota que requer super admin
  if (requireSuperAdmin && (!currentUser || currentUser.role !== 'super_admin')) {
    // Redirecionar para dashboard normal se não for super_admin
    return <Navigate to="/dashboard" replace />;
  }

  // Rota que requer verificação de email
  if (requireVerified && (!currentUser || !currentUser.is_verified)) {
    return <Navigate to="/verify-email" replace />;
  }

  // Rota que requer propriedade (usuário só pode acessar seus próprios dados)
  if (requireOwnership && userId && (!currentUser || currentUser.id !== userId)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Rota que não deve ser acessada por usuários logados (ex: login/registro)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
});

export default ProtectedRoute;

