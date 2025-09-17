
import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useThemeMods } from '@/contexts/ThemeContextMods';
import { useAuth } from '@/contexts/AuthContextMods';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { 
  Search, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Shield,
  LogIn,
  Heart,
  Download,
  Star,
  Palette,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Calendar,
  Activity
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';

const Header = React.memo(() => {
  const { theme, changeTheme } = useThemeMods();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Debug: logar o estado do usuário
  // Debug logs removidos para limpar o console

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-none flex h-20 items-center justify-between">
          {/* Logo - Esquerda */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/marko logo.png" 
              alt="Eu, Marko! Mods Logo" 
              className={`h-10 w-auto transition-all duration-300 ${
                theme === 'dark' 
                  ? 'brightness-75 contrast-125' 
                  : 'brightness-100 contrast-100'
              }`} 
            />
          </Link>
          
          {/* Barra de Busca - Centralizada (Funcional) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="w-full">
              <form onSubmit={(e) => {
                e.preventDefault();
                const searchTerm = e.target.search.value.trim();
                if (searchTerm) {
                  navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                }
              }} className="relative flex items-center">
                <Search className="absolute left-3 text-muted-foreground h-4 w-4 pointer-events-none" />
                <Input
                  name="search"
                  type="text"
                  placeholder={t('mods.search.placeholder')}
                  className="pl-10 pr-12 w-full minecraft-input bg-background/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 focus:border-primary transition-all duration-300 text-foreground placeholder:text-muted-foreground/70"
                />
                <Button 
                  type="submit"
                  className="absolute right-0 h-full px-3 bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white border-l border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm rounded-l-none"
                  size="sm"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Botões - Direita */}
          <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Usuário Logado */}
          {currentUser && isAuthenticated ? (
            <>
              {/* Botão de Tema */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              
              {/* Seletor de Idioma */}
              <LanguageSelector />
              
              {/* Menu do Usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 px-3 hover:bg-primary/10 transition-all duration-300 group">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarImage 
                          src={currentUser.avatar_url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${currentUser.avatar_url}` : undefined} 
                          alt={currentUser.display_name || currentUser.username} 
                        />
                        <AvatarFallback className="text-sm bg-primary/10 text-primary font-medium">
                          {currentUser.display_name?.substring(0, 2).toUpperCase() || currentUser.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium group-hover:text-white transition-colors duration-200">{currentUser.display_name || currentUser.username}</span>
                      {currentUser?.role && ['admin', 'super_admin', 'moderator'].includes(currentUser.role) && <Shield className="h-4 w-4 text-primary" />}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 glass-effect">
                  {/* Header do Usuário */}
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex items-center space-x-3">
                                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage 
                          src={currentUser.avatar_url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${currentUser.avatar_url}` : undefined} 
                          alt={currentUser.display_name || currentUser.username} 
                        />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary font-medium">
                          {currentUser.display_name?.substring(0, 2).toUpperCase() || currentUser.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-none text-foreground">{currentUser.display_name || currentUser.username}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">{currentUser.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {currentUser?.role && ['admin', 'super_admin', 'moderator'].includes(currentUser.role) && (
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              {currentUser.role === 'super_admin' ? 'Super Admin' : 
                               currentUser.role === 'admin' ? 'Admin' : 'Moderador'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Seção Principal */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer hover:text-white focus:text-white">
                        <User className="mr-3 h-4 w-4" />
                        <div className="flex-1">
                                                  <span className="hover:text-white">{t('nav.dashboard')}</span>
                        <p className="text-xs text-muted-foreground hover:text-muted-foreground">{t('nav.dashboardDesc')}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/favorites" className="cursor-pointer hover:text-white focus:text-white">
                        <Heart className="mr-3 h-4 w-4" />
                        <div className="flex-1">
                          <span className="hover:text-white">{t('nav.favorites')}</span>
                          <p className="text-xs text-muted-foreground hover:text-muted-foreground">{t('nav.favoritesDesc')}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/downloads" className="cursor-pointer hover:text-white focus:text-white">
                        <Download className="mr-3 h-4 w-4" />
                        <div className="flex-1">
                          <span className="hover:text-white">{t('nav.downloads')}</span>
                          <p className="text-xs text-muted-foreground hover:text-muted-foreground">{t('nav.downloadsDesc')}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Seção Admin */}
                  {currentUser?.role && ['admin', 'super_admin', 'moderator'].includes(currentUser.role) && (
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild className="hover:text-white focus:text-white">
                          <Link to="/admin" className="cursor-pointer text-primary">
                            <Shield className="mr-3 h-4 w-4" />
                            <div className="flex-1">
                              <span>{t('nav.adminPanel')}</span>
                              <p className="text-xs text-muted-foreground">{t('nav.adminPanelDesc')}</p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Seção Configurações */}
                  <DropdownMenuGroup>
                    
                    
                    <DropdownMenuItem asChild>
                      <Link to="/changelog" className="cursor-pointer hover:text-white focus:text-white">
                        <BookOpen className="mr-3 h-4 w-4" />
                        <div className="flex-1">
                          <span className="hover:text-white">{t('nav.changelog')}</span>
                          <p className="text-xs text-muted-foreground hover:text-muted-foreground">{t('nav.changelogDesc')}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/faq" className="cursor-pointer hover:text-white focus:text-white">
                        <HelpCircle className="mr-3 h-4 w-4" />
                        <div className="flex-1">
                          <span className="hover:text-white">{t('nav.faq')}</span>
                          <p className="text-xs text-muted-foreground hover:text-muted-foreground">{t('nav.faqDesc')}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/contact" className="cursor-pointer hover:text-white focus:text-white">
                        <MessageSquare className="mr-3 h-4 w-4" />
                        <div className="flex-1">
                          <span className="hover:text-white">{t('nav.contact')}</span>
                          <p className="text-xs text-muted-foreground hover:text-muted-foreground">{t('nav.contactDesc')}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Logout */}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
                    <LogOut className="mr-3 h-4 w-4" />
                    <div className="flex-1">
                      <span>{t('nav.logout')}</span>
                      <p className="text-xs text-muted-foreground">{t('nav.logoutDesc')}</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Botões de Login/Registro para usuários não logados */
            <>
              <Button asChild className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white border-2 border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg h-10 sm:h-auto" title="Login">
                <Link to="/login" className="flex items-center justify-center">
                  <div className="relative">
                    <LogIn size={16} className="sm:mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-1" />
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="font-bold text-sm sm:text-base tracking-wide hidden sm:inline">Login</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
              </Button>
              
              <Button asChild className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white border-2 border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg h-10 sm:h-auto" title="Registro">
                <Link to="/register" className="flex items-center justify-center">
                  <div className="relative">
                    <User size={16} className="sm:mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-1" />
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="font-bold text-sm sm:text-base tracking-wide hidden sm:inline">Registro</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
              </Button>

              {/* Botão de Tema - Movido para a direita dos botões de autenticação */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
              
              {/* Seletor de Idioma */}
              <LanguageSelector />
            </>
          )}
          </div>
        </div>
      </div>

      {/* Barra de Busca Mobile (Funcional) */}
      <div className="md:hidden border-t border-border/40 px-4 py-3">
        <form onSubmit={(e) => {
          e.preventDefault();
          const searchTerm = e.target.searchMobile.value.trim();
          if (searchTerm) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
          }
        }} className="relative flex items-center">
          <Search className="absolute left-3 text-muted-foreground h-4 w-4 pointer-events-none" />
          <Input
            name="searchMobile"
            type="text"
            placeholder={t('mods.search.placeholder')}
            className="pl-10 pr-20 w-full minecraft-input bg-background/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 focus:border-primary transition-all duration-300 text-foreground placeholder:text-muted-foreground/70"
          />
          <Button 
            type="submit"
            className="absolute right-0 h-full px-3 bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white border-l border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm rounded-l-none"
            size="sm"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
});

// Footer component removido - agora usando o componente Footer.jsx importado

const MainLayout = () => {
  const location = useLocation();
  
  // Páginas onde o footer deve ser desabilitado
  const pagesWithoutFooter = ['/mods', '/addons'];
  const shouldShowFooter = !pagesWithoutFooter.some(page => location.pathname.startsWith(page));
  
  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      {/* Efeito de Eclipse Roxo no Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Eclipse Principal - Centro Direito */}
        <div 
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(106, 80, 190, 0.2) 0%, rgba(168, 139, 250, 0.15) 50%, transparent 100%)',
            animation: 'float 8s ease-in-out infinite'
          }}
        ></div>
        
        {/* Eclipse Secundário - Canto Superior Esquerdo */}
        <div 
          className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(82, 62, 150, 0.15) 0%, rgba(106, 80, 190, 0.1) 50%, transparent 100%)',
            animationDelay: '2s'
          }}
        ></div>
        
        {/* Eclipse Terciário - Centro Inferior */}
        <div 
          className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(168, 139, 250, 0.1) 0%, rgba(196, 181, 253, 0.08) 50%, transparent 100%)',
            animationDelay: '4s'
          }}
        ></div>
        
        {/* Padrões Irregulares - Formas Orgânicas */}
        <div 
          className="absolute top-1/3 right-1/3 w-64 h-48 rounded-[100px_50px_120px_80px] blur-2xl transform rotate-12"
          style={{
            background: 'linear-gradient(135deg, rgba(106, 80, 190, 0.12) 0%, transparent 100%)'
          }}
        ></div>
        
        <div 
          className="absolute bottom-1/3 right-0 w-56 h-40 rounded-[80px_120px_60px_100px] blur-2xl transform -rotate-6"
          style={{
            background: 'linear-gradient(315deg, rgba(82, 62, 150, 0.1) 0%, transparent 100%)'
          }}
        ></div>
        
        <div 
          className="absolute top-1/2 left-1/4 w-48 h-56 rounded-[60px_100px_80px_120px] blur-2xl transform rotate-45"
          style={{
            background: 'linear-gradient(45deg, rgba(168, 139, 250, 0.08) 0%, transparent 100%)'
          }}
        ></div>
        
        {/* Linhas de Energia Sutil */}
        <div 
          className="absolute top-1/4 left-1/2 w-32 h-1 blur-sm transform rotate-12"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(168, 139, 250, 0.2) 50%, transparent 100%)'
          }}
        ></div>
        <div 
          className="absolute bottom-1/3 right-1/3 w-24 h-1 blur-sm transform -rotate-30"
          style={{
            background: 'linear-gradient(270deg, transparent 0%, rgba(106, 80, 190, 0.15) 50%, transparent 100%)'
          }}
        ></div>
      </div>
      
      <Header />
      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <Outlet />
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
