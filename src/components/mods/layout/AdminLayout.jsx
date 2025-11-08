import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeMods } from '@/contexts/ThemeContextMods';
import { useAuth } from '@/contexts/AuthContextMods';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from '../../../hooks/useTranslation';
import { toast } from 'sonner';
import {
  Sun,
  Moon,
  Menu,
  X,
  Home,
  Users,
  Package,
  LogOut,
  Shield,
  Activity,
  MessageSquare,
  Clock,
  ChevronDown,
  User,
  Crown,
  UserCog,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAvatarUrl } from '@/utils/avatarUtils';

const navigationToastMap = new Map();

const AdminLayout = () => {
  const { t } = useTranslation();
  const { theme, changeTheme } = useThemeMods();
  const { currentUser, logout } = useAuth();
  const { hasPermission, loading } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    'Principal': true,
    'Gerenciamento': true,
    'Conteúdo': true,
    'Sistema': true
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }
  }, []);

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('adminSidebarCollapsed', String(newState));
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationSections = [
    {
      title: 'Principal',
      items: [
        { 
          name: 'Dashboard', 
          href: '/admin', 
          icon: Home, 
          permission: 'access_admin_panel' 
        },
      ]
    },
    {
      title: 'Gerenciamento',
      items: [
        { 
          name: 'Usuários', 
          href: '/admin/users', 
          icon: Users, 
          permission: 'view_users'
        },
        { 
          name: 'Administradores', 
          href: '/admin/administrators', 
          icon: Shield, 
          permission: 'manage_administrators',
          requireSuperAdmin: true
        },
      ]
    },
    {
      title: 'Conteúdo',
      items: [
        { 
          name: 'Mods', 
          href: '/admin/mods', 
          icon: Package, 
          permission: 'view_mods' 
        },
        { 
          name: 'Changelogs', 
          href: '/admin/changelogs', 
          icon: Clock, 
          permission: 'view_changelogs' 
        },
        { 
          name: t('modDetail.comments'), 
          href: '/admin/comments-moderation', 
          icon: MessageSquare, 
          permission: 'view_comments' 
        },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { 
          name: 'Logs', 
          href: '/admin/logs', 
          icon: Activity, 
          permission: 'view_logs' 
        },
      ]
    },
  ];

  const getAllNavigationItems = () => {
    return navigationSections.flatMap(section => section.items);
  };

  const getVisibleNavigationSections = () => {
    if (!currentUser) return [];
    return navigationSections;
  };

  const handleNavigationClick = (e, item) => {
    if (!currentUser) {
      e.preventDefault();
      return;
    }

    if (currentUser.role === 'admin') {
      return;
    }

    const toastKey = `${item.href}-${currentUser.id}`;

    if (item.requireSuperAdmin) {
      e.preventDefault();
      if (!navigationToastMap.has(toastKey)) {
        navigationToastMap.set(toastKey, true);
        toast.error('Acesso Negado', {
          description: 'Você não tem permissão para acessar esta funcionalidade. Apenas Administradores podem acessar.',
          duration: 5000,
        });
        setTimeout(() => {
          navigationToastMap.delete(toastKey);
        }, 6000);
      }
      return;
    }

    if (loading) {
      e.preventDefault();
      return;
    }

    if (!hasPermission(item.permission)) {
      e.preventDefault();
      if (!navigationToastMap.has(toastKey)) {
        navigationToastMap.set(toastKey, true);
        const permissionNames = {
          'view_users': 'Ver Usuários',
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

        const permissionName = permissionNames[item.permission] || item.permission;
        
        toast.error('Acesso Negado', {
          description: `Você não tem permissão para acessar "${permissionName}". Entre em contato com um administrador se precisar desta funcionalidade.`,
          duration: 5000,
        });
        setTimeout(() => {
          navigationToastMap.delete(toastKey);
        }, 6000);
      }
    }
  };

  const isActiveRoute = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const isItemBlocked = (item) => {
    if (!currentUser) return true;
    if (currentUser.role === 'admin') {
      return false;
    }
    if (item.requireSuperAdmin) {
      return true;
    }
    if (loading) {
      return false;
    }
    return !hasPermission(item.permission);
  };

  const getRoleConfig = (role) => {
    const roleConfigs = {
      'admin': { icon: Crown, label: 'Admin', color: 'text-purple-400' },
      'supervisor': { icon: Shield, label: 'Supervisor', color: 'text-blue-400' },
      'moderator': { icon: UserCog, label: 'Moderador', color: 'text-green-400' }
    };
    return roleConfigs[role] || { icon: User, label: 'Membro', color: 'text-gray-400' };
  };

  const visibleSections = getVisibleNavigationSections();
  const allNavigation = getAllNavigationItems();

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-card border-r border-border/40 transform transition-all duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          <div className={cn(
            "relative flex h-16 items-center border-b border-border/40 transition-all duration-300",
            sidebarCollapsed ? "px-4 justify-center" : "px-6 justify-center"
          )}>
            {!sidebarCollapsed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            )}
            <AnimatePresence mode="wait">
              {sidebarCollapsed && (
                <motion.div
                  key="expand"
                  initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 text-primary/70 hover:text-primary"
                    onClick={handleSidebarToggle}
                    title="Expandir sidebar"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </motion.div>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  key="collapse"
                  initial={{ opacity: 0, scale: 0.8, rotate: 90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: -90 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="absolute right-3 flex items-center gap-2"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex h-8 w-8 hover:bg-primary/10 text-primary/70 hover:text-primary"
                    onClick={handleSidebarToggle}
                    title="Recolher sidebar"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, x: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronLeft className="h-5 w-5 text-primary" />
                    </motion.div>
                  </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-8 w-8"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-4">
            {visibleSections.map((section) => {
              const isExpanded = expandedSections[section.title] ?? true;
              
              return (
                <div key={section.title}>
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-3 py-2 mb-2 rounded-md hover:bg-muted/50 transition-colors duration-200 group"
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                        {section.title}
                      </p>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isExpanded ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>
                  )}
                  {sidebarCollapsed && (
                    <div className="flex justify-center mb-2">
                      <div className="w-8 h-0.5 bg-border/30 rounded-full"></div>
                    </div>
                  )}
                  <div
                    className={cn(
                      "space-y-1 transition-all duration-300 ease-in-out overflow-hidden",
                      !sidebarCollapsed && !isExpanded ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
                    )}
                  >
                    {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActiveRoute(item.href);
                        const blocked = isItemBlocked(item);
                        
                        return (
                          <div key={item.name} className="relative group">
                            <Link
                              to={item.href}
                              className={cn(
                                "relative flex items-center rounded-md transition-all duration-200 z-10",
                                sidebarCollapsed 
                                  ? "justify-center px-3 py-2.5" 
                                  : "px-3 py-2",
                                active
                                  ? "bg-primary/10 text-primary"
                                  : blocked
                                  ? "text-muted-foreground/40 hover:text-muted-foreground/50 hover:bg-muted/20 cursor-not-allowed"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                              onClick={(e) => {
                                handleNavigationClick(e, item);
                                if (!e.defaultPrevented) {
                                  setSidebarOpen(false);
                                }
                              }}
                            >
                              {active && !blocked && (
                                <div className={cn(
                                  "absolute bg-primary rounded-r-full transition-all duration-200 -z-10",
                                  sidebarCollapsed 
                                    ? "left-0 top-1/2 -translate-y-1/2 w-1 h-8" 
                                    : "left-0 top-1/2 -translate-y-1/2 w-1 h-6"
                                )} />
                              )}
                              <Icon className={cn(
                                "flex-shrink-0 transition-all duration-200 relative z-10",
                                sidebarCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3",
                                active && !blocked && "text-primary",
                                blocked && "opacity-40"
                              )} />
                              {!sidebarCollapsed && (
                                <span className={cn(
                                  "text-sm font-medium truncate relative z-10 flex items-center gap-1.5 flex-1",
                                  blocked && "opacity-40"
                                )}>
                                  {item.name}
                                  {blocked && (
                                    <Lock className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
                                  )}
                                </span>
                              )}
                              {sidebarCollapsed && blocked && (
                                <Lock className="absolute top-1 right-1 h-2.5 w-2.5 text-muted-foreground/60 z-20" />
                              )}
                            </Link>
                            {sidebarCollapsed && (
                              <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 whitespace-nowrap z-50">
                                {item.name}
                                {blocked && (
                                  <span className="ml-1.5 text-xs text-muted-foreground/70">(Bloqueado)</span>
                                )}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-2.5 h-2.5 bg-popover border-l border-b border-border rotate-45"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                </div>
              );
            })}
          </nav>
          
          <div className={cn(
            "border-t border-border/40 transition-all duration-300",
            sidebarCollapsed ? "p-3" : "p-4"
          )}>
            <div className={cn(
              "flex items-center transition-all duration-300 mb-3",
              sidebarCollapsed ? "justify-center" : "space-x-3"
            )}>
              <Avatar className={cn(
                "flex-shrink-0 border-2 border-primary/20",
                sidebarCollapsed ? "h-10 w-10" : "h-12 w-12"
              )}>
                <AvatarImage 
                  src={currentUser?.avatar_url ? getAvatarUrl(currentUser.avatar_url) : undefined}
                  alt={currentUser?.display_name || currentUser?.username}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentUser?.display_name?.charAt(0).toUpperCase() || 
                   currentUser?.username?.charAt(0).toUpperCase() || 
                   'U'}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {currentUser?.display_name || currentUser?.username}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {currentUser?.role && ['admin', 'supervisor', 'moderator'].includes(currentUser.role) && (() => {
                      const roleConfig = getRoleConfig(currentUser.role);
                      const RoleIcon = roleConfig.icon;
                      return (
                        <div className="flex items-center gap-1">
                          <RoleIcon className={cn("h-3 w-3", roleConfig.color)} />
                          <p className={cn("text-xs capitalize", roleConfig.color)}>
                            {roleConfig.label}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                  {currentUser?.email && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                sidebarCollapsed ? "justify-center px-0" : "justify-start"
              )}
            >
              <LogOut className={cn(
                "flex-shrink-0",
                sidebarCollapsed ? "h-5 w-5" : "h-4 w-4 mr-2"
              )} />
              {!sidebarCollapsed && <span>Sair</span>}
            </Button>
          </div>
        </div>
      </aside>
      
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
          <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-primary">
                {allNavigation.find(item => isActiveRoute(item.href))?.name || 'Admin'}
              </h1>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300"
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/" className="text-muted-foreground hover:text-foreground hover:bg-primary/10">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

