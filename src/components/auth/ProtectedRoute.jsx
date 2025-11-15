import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMods';

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
    return null;
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

