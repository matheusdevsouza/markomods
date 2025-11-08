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

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && currentUser && currentUser.is_banned) {
    return <Navigate to="/banned" replace />;
  }

  if (requireAdmin && (!currentUser || !['supervisor', 'admin', 'moderator'].includes(currentUser.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSuperAdmin && (!currentUser || currentUser.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireVerified && (!currentUser || !currentUser.is_verified)) {
    return <Navigate to="/verify-email" replace />;
  }

  if (requireOwnership && userId && (!currentUser || currentUser.id !== userId)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
});

export default ProtectedRoute;

