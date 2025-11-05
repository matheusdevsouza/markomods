
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset;
      setIsScrolled(scrollPosition > 50);
    };
    
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollY]);
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 0.98]);
  const headerBlurValue = useTransform(scrollY, [0, 100], [8, 12]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-background/95 supports-[backdrop-filter]:bg-background/60 transition-colors duration-300 ${
          isMobile 
            ? (isScrolled ? 'border-primary/30' : 'border-border/40')
            : (isScrolled ? 'border-b border-primary/30' : '')
        }`}
        style={{
          opacity: headerOpacity,
          backdropFilter: useTransform(headerBlurValue, (val) => `blur(${val}px)`),
          WebkitBackdropFilter: useTransform(headerBlurValue, (val) => `blur(${val}px)`),
        }}
        animate={{
          boxShadow: isScrolled
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 30px rgba(106, 80, 190, 0.25), 0 0 60px rgba(106, 80, 190, 0.15)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
      >
      {/* divisor superior do header - apenas mobile */}
      <motion.div 
        className={`w-full border-b border-border/40 ${isMobile ? '' : 'hidden'}`}
        animate={{
          opacity: isScrolled ? 0.95 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />
      <motion.div 
        className="w-full"
        animate={{
          paddingTop: isMobile && !isScrolled ? '0.75rem' : isMobile ? '0.5rem' : '0',
          paddingLeft: isScrolled 
            ? '0.5rem'
            : isMobile ? '0.75rem' : 'clamp(0.75rem, 1vw + 0.5rem, 4rem)',
          paddingRight: isScrolled 
            ? '0.5rem'
            : isMobile ? '0.75rem' : 'clamp(0.75rem, 1vw + 0.5rem, 4rem)',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
      >
        <motion.div 
          className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2"
          animate={{
            minHeight: isScrolled 
              ? isMobile ? '2.75rem' : '3.5rem'
              : isMobile ? '3rem' : '4rem',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
        >
          {/* Primeira linha: Logo e botões (mobile) / Logo, Searchbar centralizado e botões (desktop) */}
          <div className="flex items-center justify-between w-full md:flex-1 gap-2">
            <motion.div
              animate={{
                scale: isScrolled 
                  ? isMobile ? 0.92 : 0.95
                  : 1,
                opacity: isScrolled ? 0.9 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center flex-shrink-0">
                <motion.img 
                  src="/markomods-logo2.png" 
                  alt="MarkoMods Logo" 
                  className={`h-7 sm:h-8 md:h-9 lg:h-10 w-auto transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer ${
                    theme === 'dark' 
                      ? 'brightness-75 contrast-125' 
                      : 'brightness-100 contrast-100'
                  }`}
                  animate={{
                    filter: isScrolled ? 'brightness(0.9)' : 'brightness(1)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              </Link>
            </motion.div>
            
            {/* barra de busca - visível apenas em desktop, centralizada */}
            <motion.div 
              className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8"
              animate={{
                opacity: isScrolled ? 0.9 : 1,
                scale: isScrolled ? 0.98 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <div className="w-full">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const searchTerm = e.target.search.value.trim();
                  if (searchTerm) {
                    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                  }
                }} className="relative flex items-center">
                  <Search className="absolute left-3 text-muted-foreground h-4 w-4 pointer-events-none z-10" />
                  <Input
                    name="search"
                    type="text"
                    placeholder={t('mods.search.placeholder')}
                    className="pl-10 pr-12 w-full minecraft-input bg-background/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 focus:border-primary transition-all duration-300 text-foreground placeholder:text-muted-foreground/70 !rounded-lg text-sm md:text-base h-9 md:h-10"
                  />
                  <Button 
                    type="submit"
                    className="absolute right-0 h-full px-3 bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white border-l border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm rounded-r-lg"
                    size="sm"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
            
            {/* botões da direita - sempre visíveis */}
            <motion.div 
              className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 lg:space-x-3 flex-shrink-0"
              animate={{
                scale: isScrolled 
                  ? isMobile ? 0.92 : 0.95
                  : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
          {/* usuário logado */}
          {currentUser && isAuthenticated ? (
            <>
              {/* seletor de idioma - apenas desktop */}
              <div className="hidden md:block">
                <LanguageSelector />
              </div>
              
              {/* botão de tema */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300"
              >
                {theme === 'dark' ? (
                  <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
                ) : (
                  <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
                )}
              </Button>
              
              {/* menu do usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-7 px-1.5 sm:h-8 sm:px-2 md:h-9 md:px-2.5 lg:h-10 lg:px-3 hover:bg-primary/10 transition-all duration-300 group">
                    <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 border-2 border-primary/20">
                        <AvatarImage 
                          src={currentUser.avatar_url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${currentUser.avatar_url}` : undefined} 
                          alt={currentUser.display_name || currentUser.username} 
                        />
                        <AvatarFallback className="text-[10px] sm:text-xs md:text-sm bg-primary/10 text-primary font-medium">
                          {currentUser.display_name?.substring(0, 2).toUpperCase() || currentUser.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:block text-xs md:text-sm font-medium group-hover:text-white transition-colors duration-200">{currentUser.display_name || currentUser.username}</span>
                      {currentUser?.role && ['admin', 'super_admin', 'moderator'].includes(currentUser.role) && <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-primary" />}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 glass-effect">
                  {/* header do usuário */}
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
                  
                  {/* seção principal */}
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
                  
                  {/* seção admin */}
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
                  
                  {/* seção configurações */}
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
                    
                    <DropdownMenuItem asChild>
                      <Link to="/donate" className="cursor-pointer hover:text-white focus:text-white">
                        <Heart className="mr-3 h-4 w-4" />
                        <div className="flex-1">
                          <span className="hover:text-white">{t('nav.donate')}</span>
                          <p className="text-xs text-muted-foreground hover:text-muted-foreground">{t('nav.donateDesc')}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  {/* logout */}
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
            
            /* botões de login/registro para usuários não logados */
            <>
              {/* botões à esquerda: tema e idioma */}
              <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
                {/* botão de tema */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
                  )}
                </Button>
                
                {/* seletor de idioma - visível em todas as telas */}
                <LanguageSelector />
              </div>
              
              {/* botões à direita: login e registro */}
              <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
                {/* botão de login */}
                <Button asChild className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white border-2 border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg h-8 sm:h-9 md:h-10" title="Login">
                  <Link to="/login" className="flex items-center justify-center">
                    <LogIn size={14} className="sm:size-4 md:size-5 mr-1 sm:mr-1.5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-1" />
                    <span className="font-bold text-xs sm:text-sm md:text-base tracking-wide">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </Link>
                </Button>
                
                {/* botão de registro - apenas desktop */}
                <Button asChild className="hidden md:flex group relative overflow-hidden bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white border-2 border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg h-8 sm:h-9 md:h-10" title="Registro">
                  <Link to="/register" className="flex items-center justify-center">
                    <User size={14} className="sm:size-4 md:size-5 mr-1 sm:mr-1.5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-1" />
                    <span className="font-bold text-xs sm:text-sm md:text-base tracking-wide">Registro</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </Link>
                </Button>
              </div>
            </>
          )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* barra de busca mobile - linha separada abaixo do header, entre os divisores */}
      <motion.div 
        className="md:hidden border-t border-border/40"
        style={{
          backdropFilter: useTransform(headerBlurValue, (val) => `blur(${val}px)`),
          WebkitBackdropFilter: useTransform(headerBlurValue, (val) => `blur(${val}px)`),
        }}
        animate={{
          opacity: isScrolled ? 0.95 : 1,
          paddingLeft: isScrolled 
            ? '0.5rem'
            : isMobile ? '0.75rem' : 'clamp(0.75rem, 1vw + 0.5rem, 4rem)',
          paddingRight: isScrolled 
            ? '0.5rem'
            : isMobile ? '0.75rem' : 'clamp(0.75rem, 1vw + 0.5rem, 4rem)',
          paddingTop: isScrolled ? '0.5rem' : '0.625rem',
          paddingBottom: isScrolled ? '0.5rem' : '0.625rem',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const searchTerm = e.target.searchMobile.value.trim();
          if (searchTerm) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
          }
        }} className="relative flex items-center">
          <Search className="absolute left-3 text-muted-foreground h-4 w-4 pointer-events-none z-10" />
          <Input
            name="searchMobile"
            type="text"
            placeholder={t('mods.search.placeholder')}
            className="pl-10 pr-12 w-full minecraft-input bg-background/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 focus:border-primary transition-all duration-300 text-foreground placeholder:text-muted-foreground/70 !rounded-lg text-sm sm:text-base h-9 sm:h-10"
          />
          <Button 
            type="submit"
            className="absolute right-0 h-full px-2 sm:px-3 bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white border-l border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm rounded-r-lg"
            size="sm"
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </form>
      </motion.div>
      
      {/* divisor inferior do header */}
      <motion.div 
        className="w-full border-b border-border/40"
        animate={{
          opacity: isScrolled ? 0.95 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />

    </motion.header>
  );
});

const MainLayout = () => {
  const location = useLocation();
  
  const pagesWithoutFooter = ['/mods', '/addons'];
  const shouldShowFooter = !pagesWithoutFooter.some(page => location.pathname.startsWith(page));
  
  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">

      {/* efeito de eclipse roxo no background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        
        {/* eclipse principal - centro direito */}
        <div 
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(106, 80, 190, 0.2) 0%, rgba(168, 139, 250, 0.15) 50%, transparent 100%)',
            animation: 'float 8s ease-in-out infinite'
          }}
        ></div>
        
        {/* eclipse secundário - canto superior esquerdo */}
        <div 
          className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(82, 62, 150, 0.15) 0%, rgba(106, 80, 190, 0.1) 50%, transparent 100%)',
            animationDelay: '2s'
          }}
        ></div>
        
        {/* eclipse terciário - centro inferior */}
        <div 
          className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(168, 139, 250, 0.1) 0%, rgba(196, 181, 253, 0.08) 50%, transparent 100%)',
            animationDelay: '4s'
          }}
        ></div>
        
        {/* padrões irregulares - formas orgânicas */}
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
        
        {/* linhas de energia sutil */}
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
      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-20 sm:pt-24 md:pt-28 lg:pt-32">
        <Outlet />
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
