
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useThemeMods } from '@/contexts/ThemeContextMods';
import { useAuth } from '@/contexts/AuthContextMods';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../../../hooks/useTranslation';
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
  Megaphone,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
  const { t } = useTranslation();
  const { theme, changeTheme } = useThemeMods();
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Usuários', href: '/admin/users', icon: Users },
    { name: 'Mods', href: '/admin/mods', icon: Package },
    { name: 'Anúncios', href: '/admin/ads', icon: Megaphone },
    { name: 'Changelogs', href: '/admin/changelogs', icon: Clock },
    { name: t('modDetail.comments'), href: '/admin/comments-moderation', icon: MessageSquare },
    { name: 'Logs', href: '/admin/logs', icon: Activity },
  ];

  const isActiveRoute = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:inset-0 lg:flex-shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header do Sidebar */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border/40">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">Admin Panel</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navegação */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActiveRoute(item.href)
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer do Sidebar */}
          <div className="border-t border-border/40 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {currentUser?.username}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {currentUser?.role}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Principal */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
          <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
            {/* Botão Menu Mobile + Título */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Título da Página - Agora mais próximo do menu */}
              <h1 className="text-lg font-semibold text-foreground">
                {navigation.find(item => isActiveRoute(item.href))?.name || 'Admin'}
              </h1>
            </div>

            {/* Spacer para empurrar botões para a direita */}
            <div className="flex-1"></div>

            {/* Botões da Direita */}
            <div className="flex items-center space-x-3">
              {/* Botão de Tema */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Botão Voltar para Home */}
              <Button variant="ghost" asChild>
                <Link to="/" className="text-muted-foreground hover:text-foreground hover:bg-primary/10">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Conteúdo da Página */}
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
