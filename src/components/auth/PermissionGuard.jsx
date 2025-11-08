import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMods';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const routePermissionMap = {
  '/admin': 'access_admin_panel',
  '/admin/users': 'manage_users',
  '/admin/administrators': 'manage_administrators',
  '/admin/mods': 'view_mods',
  '/admin/changelogs': 'view_changelogs',
  '/admin/comments-moderation': 'view_comments',
  '/admin/logs': 'view_logs',
};

const toastShownMap = new Map();

const PermissionGuard = ({ children, requiredPermission = null, requireSuperAdmin = false }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  const permission = requiredPermission || routePermissionMap[location.pathname];
  const hasRequiredPermission = permission ? hasPermission(permission) : true;
  const stableToastKey = `${location.pathname}-${permission || 'admin'}`;
  
  useEffect(() => {
    if (authLoading || permissionsLoading) return;
    if (!currentUser) return;

    if (requireSuperAdmin) {
      if (currentUser.role !== 'admin') {
        if (!toastShownMap.has(stableToastKey)) {
          toastShownMap.set(stableToastKey, true);
          toast.error('Acesso Negado', {
            description: 'Você não tem permissão para acessar esta funcionalidade. Apenas Administradores podem acessar.',
            duration: 5000,
          });
          setTimeout(() => toastShownMap.delete(stableToastKey), 6000);
        }
        if (!shouldRedirect) {
          setTimeout(() => {
            setRedirectTo('/admin');
            setShouldRedirect(true);
          }, 500);
        }
      }
    } else if (permission && !hasRequiredPermission) {
      if (permission === 'access_admin_panel') {
        if (!shouldRedirect) {
          setRedirectTo('/dashboard');
          setShouldRedirect(true);
        }
        return;
      }

      if (!toastShownMap.has(stableToastKey)) {
        toastShownMap.set(stableToastKey, true);
        const permissionNames = {
          'manage_users': 'Gerenciar Usuários',
          'manage_administrators': 'Gerenciar Administradores',
          'view_mods': 'Visualizar Mods',
          'manage_mods': 'Gerenciar Mods',
          'view_changelogs': 'Visualizar Changelogs',
          'manage_changelogs': 'Gerenciar Changelogs',
          'view_comments': 'Visualizar Comentários',
          'manage_comments': 'Gerenciar Comentários',
          'view_logs': 'Visualizar Logs',
        };
        const permissionName = permissionNames[permission] || permission;
        toast.error('Acesso Negado', {
          description: `Você não tem permissão para acessar "${permissionName}". Entre em contato com um administrador se precisar desta funcionalidade.`,
          duration: 5000,
        });
        setTimeout(() => toastShownMap.delete(stableToastKey), 6000);
      }
      if (!shouldRedirect) {
        setTimeout(() => {
          setRedirectTo('/admin');
          setShouldRedirect(true);
        }, 500);
      }
    }
  }, [currentUser?.id, currentUser?.role, permission, hasRequiredPermission, requireSuperAdmin, authLoading, permissionsLoading, stableToastKey, shouldRedirect]);

  useEffect(() => {
    setShouldRedirect(false);
    setRedirectTo(null);
  }, [location.pathname]);

  useEffect(() => {
    if (shouldRedirect && redirectTo) {
      navigate(redirectTo, { replace: true });
      if (permission === 'access_admin_panel' && redirectTo === '/dashboard') {
        setTimeout(() => {
          if (!toastShownMap.has(stableToastKey)) {
            toastShownMap.set(stableToastKey, true);
            toast.error('Acesso Negado', {
              description: 'Você não tem permissão para acessar o Painel Administrativo. Entre em contato com um administrador se precisar desta funcionalidade.',
              duration: 5000,
            });
            setTimeout(() => toastShownMap.delete(stableToastKey), 6000);
          }
        }, 200);
      }
    }
  }, [shouldRedirect, redirectTo, navigate, permission, stableToastKey]);

  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando permissões...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && currentUser.role !== 'admin') {
    if (shouldRedirect && redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return null;
  }

  if (permission && !hasRequiredPermission) {
    if (permission === 'access_admin_panel') {
      return <Navigate to="/dashboard" replace />;
    }
    if (shouldRedirect && redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return null;
  }

  return children;
};

export default PermissionGuard;

