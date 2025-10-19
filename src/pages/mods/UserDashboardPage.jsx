
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Heart, 
  Star, 
  User, 
  ArrowRight, 
  CalendarDays, 
  Clock, 
  FileText,
  TrendingUp,
  Activity,
  Gamepad2,
  Sparkles,
  Eye,
  Calendar,
  MapPin,
  Edit3,
  RefreshCw,
  MessageSquare,
  Search,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { useMods } from '@/contexts/ModsContext';
import ModCard from '@/components/mods/ModCard';
import { useAuth } from '@/contexts/AuthContextMods';
import { useDownloads } from '@/contexts/DownloadsContext';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import PaginationControls from '@/components/ui/PaginationControls';

const UserDashboardPage = React.memo(() => {
  const navigate = useNavigate();
  const { mods, loadingMods } = useMods();
  const { currentUser, isAuthenticated, loading } = useAuth();
  const { downloadHistory, totalDownloads } = useDownloads();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [userStats, setUserStats] = useState({
    favoriteMods: [],
    userCommentsCount: 0,
    userComments: []
  });

  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsPerPage] = useState(5);
  const [commentsSearch, setCommentsSearch] = useState('');
  const [commentsDateFilter, setCommentsDateFilter] = useState('all');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsData, setCommentsData] = useState([]);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [favoritesPage, setFavoritesPage] = useState(1);
  const [favoritesPerPage] = useState(4);
  const [downloadsPage, setDownloadsPage] = useState(1);
  const [downloadsPerPage] = useState(4);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchUserStats();
      fetchUserComments();
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchUserComments();
    }
  }, [commentsPage, commentsSearch, commentsDateFilter]);

  const fetchUserComments = async () => {
    try {
      setCommentsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return;
      }

      const params = new URLSearchParams({
        page: commentsPage.toString(),
        limit: commentsPerPage.toString(),
        search: commentsSearch,
        date_filter: commentsDateFilter
      });

      const response = await fetch(`/api/comments/user/list?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCommentsData(data.data?.comments || []);
        setCommentsTotal(data.data?.total || 0);
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar seus comentários',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar comentários',
        variant: 'destructive'
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return;
      }

      // Buscar favoritos do usuário
      const favoritesResponse = await fetch('/api/mods/user/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        
        setUserStats(prev => ({
          ...prev,
          favoriteMods: favoritesData.data || []
        }));
      } else {
      }

      try {
        const countResp = await fetch('/api/mods/user/downloads/count', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (countResp.ok) {
          const data = await countResp.json();
          const localExtra = parseInt(localStorage.getItem('userDownloadTotalLocal') || '0', 10);
        }
      } catch (e) {
      }

      try {
        const commentsCountResp = await fetch('/api/comments/user/count', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (commentsCountResp.ok) {
          const data = await commentsCountResp.json();
          setUserStats(prev => ({ ...prev, userCommentsCount: data.data?.total || 0 }));
        }
      } catch (e) {
      }

      try {
        const listResp = await fetch('/api/comments/user/list?limit=20', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (listResp.ok) {
          const data = await listResp.json();
          setUserStats(prev => ({ ...prev, userComments: data.data || [] }));
        }
      } catch (e) {
      }

      try {
        const histResp = await fetch('/api/mods/user/downloads/history?limit=10', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (histResp.ok) {
          const data = await histResp.json();
          let history = data.data || [];
          try {
            const localRaw = localStorage.getItem('userDownloadHistory');
            const localList = localRaw ? JSON.parse(localRaw) : [];
            const map = new Map();
            [...localList, ...history].forEach(item => {
              const key = item.modId || item.mod_id || item.id;
              if (!map.has(key)) map.set(key, item);
            });
            history = Array.from(map.values()).slice(0, 20);
          } catch {}
        }
      } catch (e) {
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas estatísticas',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Comentário excluído!',
          description: 'Seu comentário foi removido com sucesso.'
        });
        // Recarregar comentários e estatísticas
        fetchUserComments();
        fetchUserStats();
        // Disparar evento para atualizar contagem
        window.dispatchEvent(new CustomEvent('commentsUpdated'));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir comentário');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir o comentário',
        variant: 'destructive'
      });
    }
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      handleDeleteComment(commentToDelete.id);
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  const handlePageChange = (newPage) => {
    setCommentsPage(newPage);
  };

  const resetFilters = () => {
    setCommentsSearch('');
    setCommentsDateFilter('all');
    setCommentsPage(1);
  };

  const userFavoriteMods = userStats.favoriteMods || [];

  const totalFavoritesPages = Math.ceil(userFavoriteMods.length / favoritesPerPage);
  const paginatedFavorites = userFavoriteMods.slice(
    (favoritesPage - 1) * favoritesPerPage,
    favoritesPage * favoritesPerPage
  );

  const handleFavoritesPageChange = (page) => {
    setFavoritesPage(page);
  };

  const totalDownloadsPages = Math.ceil(downloadHistory.length / downloadsPerPage);
  const paginatedDownloads = downloadHistory.slice(
    (downloadsPage - 1) * downloadsPerPage,
    downloadsPage * downloadsPerPage
  );

  const handleDownloadsPageChange = (page) => {
    setDownloadsPage(page);
  };

  const totalCommentsPages = Math.ceil(commentsData.length / commentsPerPage);
  const paginatedComments = commentsData.slice(
    (commentsPage - 1) * commentsPerPage,
    commentsPage * commentsPerPage
  );

  const handleCommentsPageChange = (page) => {
    setCommentsPage(page);
  };

  const handleFavoriteUpdate = () => {
    fetchUserStats();
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'favoritesUpdated') {
        handleFavoriteUpdate();
      }
      if (e.key === 'downloadsUpdated') {
        try {
          const raw = localStorage.getItem('userDownloadHistory');
          const list = raw ? JSON.parse(raw) : [];
          const extra = parseInt(localStorage.getItem('userDownloadTotalLocal') || '0', 10);
        } catch {}
      }
      if (e.key === 'commentsUpdated') {
        fetchUserStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const handleCommentsUpdate = () => {
      fetchUserStats();
    };
    window.addEventListener('commentsUpdated', handleCommentsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('commentsUpdated', handleCommentsUpdate);
    };
  }, []);

  if (loading || loadingMods) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="text-center py-12">
        <User size={64} className="mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-2xl font-minecraft text-primary mb-2">{t('dashboard.restrictedAccess')}</h2>
        <p className="text-muted-foreground mb-6">{t('dashboard.loginRequired')}</p>
        <Button asChild className="minecraft-btn">
          <Link to="/login">{t('dashboard.login')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-2xl p-8 border border-primary/30 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-full p-1 animate-pulse"></div>
            <Avatar className="h-24 w-24 border-4 border-background relative z-10">
                              <AvatarImage 
                  src={currentUser.avatar_url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${currentUser.avatar_url}` : undefined} 
                  alt={currentUser.display_name || currentUser.username || 'Avatar do usuário'} 
                />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-3xl font-minecraft">
                {(currentUser.display_name && currentUser.display_name.substring(0, 2).toUpperCase()) || 
                 (currentUser.username && currentUser.username.substring(0, 2).toUpperCase()) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-minecraft text-primary hover:text-white transition-colors duration-300">
                {currentUser.display_name || currentUser.username || 'Usuário'}
              </h1>
              {currentUser.role && ['admin', 'super_admin', 'moderator'].includes(currentUser.role) && (
                <Badge variant="secondary" className={`px-3 py-1 ${
                  currentUser.role === 'super_admin' || currentUser.role === 'admin' 
                    ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-600 border-purple-500/30' 
                    : 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-600 border-blue-500/30'
                }`}>
                  <Sparkles size={14} className="mr-1" />
                  {currentUser.role === 'super_admin' ? t('dashboard.roles.superAdmin') : 
                   currentUser.role === 'admin' ? t('dashboard.roles.admin') : t('dashboard.roles.moderator')}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={16} className="text-primary" />
                <span>{t('dashboard.memberSince')} {(() => {
                  try {
                    if (!currentUser.created_at) return t('dashboard.dateNotAvailable');
                    const date = new Date(currentUser.created_at);
                    if (isNaN(date.getTime())) return t('dashboard.dateNotAvailable');
                    return date.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                  } catch (error) {
                    return t('dashboard.dateNotAvailable');
                  }
                })()}</span>
              </div>
              
              {currentUser.last_login && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} className="text-primary" />
                  <span>{t('dashboard.lastLogin')} {(() => {
                    try {
                      if (!currentUser.last_login) return t('dashboard.dateNotAvailable');
                      const date = new Date(currentUser.last_login);
                      if (isNaN(date.getTime())) return t('dashboard.dateNotAvailable');
                      return date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch (error) {
                      return t('dashboard.dateNotAvailable');
                    }
                  })()}</span>
                </div>
              )}
            </div>
            
            {currentUser.bio && (
              <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                <div className="flex items-start gap-2">
                  <FileText size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground italic leading-relaxed">"{currentUser.bio}"</p>
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/edit-profile')}
              className="group relative overflow-hidden bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-primary/40 text-primary hover:from-primary/20 hover:via-purple-500/20 hover:to-blue-500/20 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 px-6 py-2.5 font-medium"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Edit3 size={16} className="mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">{t('dashboard.editProfile')}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="minecraft-card hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-minecraft uppercase text-blue-600">{t('dashboard.stats.totalDownloads')}</CardTitle>
            <Download className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalDownloads}</div>
            <p className="text-xs text-muted-foreground pt-1">{t('dashboard.stats.downloadsPerformed')}</p>
          </CardContent>
        </Card>

        <Card className="minecraft-card hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-minecraft uppercase text-red-600">{t('dashboard.stats.favoriteMods')}</CardTitle>
            <Heart className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{userStats.favoriteMods.length}</div>
            <p className="text-xs text-muted-foreground pt-1">{t('dashboard.stats.modsSaved')}</p>
          </CardContent>
        </Card>

        <Card className="minecraft-card hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-minecraft uppercase text-green-600">{t('modDetail.comments')}</CardTitle>
            <MessageSquare className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{userStats.userCommentsCount}</div>
            <p className="text-xs text-muted-foreground pt-1">Comentários feitos</p>
          </CardContent>
        </Card>
      </div>

      <Card className="minecraft-card border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-minecraft text-primary flex items-center">
                <Heart size={22} className="mr-2 text-red-500" /> 
                {t('dashboard.favoriteMods.title')}
              </CardTitle>
              <CardDescription>{t('dashboard.favoriteMods.description')}</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFavoriteUpdate}
              className="hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 group"
            >
              <RefreshCw size={16} className="mr-2 group-hover:text-red-500" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userStats.favoriteMods.length > 0 && userFavoriteMods.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                {paginatedFavorites.map((mod, index) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ModCard mod={mod} showStats={false} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} />
                  </motion.div>
                ))}
              </div>
              
              {userFavoriteMods.length > favoritesPerPage && (
                <div className="mt-6">
                  <PaginationControls
                    currentPage={favoritesPage}
                    totalPages={totalFavoritesPages}
                    onPageChange={handleFavoritesPageChange}
                    className="justify-center"
                    theme="red"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center shadow-lg">
                  <Heart size={64} className="text-red-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">{t('dashboard.favoriteMods.noFavorites')}</h3>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                {t('dashboard.favoriteMods.noFavoritesDescription')}
              </p>
              <Button asChild className="minecraft-btn bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-lg px-8 py-3">
                <Link to="/mods">
                  <Gamepad2 size={20} className="mr-3" />
                  {t('dashboard.favoriteMods.exploreMods')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="minecraft-card border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/5">
        <CardHeader>
          <CardTitle className="text-xl font-minecraft text-primary flex items-center">
            <Download size={22} className="mr-2 text-blue-500" /> 
            {t('dashboard.downloadHistory.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.downloadHistory.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {downloadHistory.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 1xl:grid-cols-5">
                {paginatedDownloads.map((item, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                      <ModCard mod={{
                        id: item.modId || item.mod_id || item.id,
                        title: item.title || item.name,
                        name: item.title || item.name,
                        thumbnail_url: item.thumbnail_url,
                        minecraft_version: item.minecraft_version,
                        short_description: item.short_description || '',
                        tags: item.tags || []
                      }} showStats={false} />
                    </motion.div>
                  ))}
              </div>
              
              {downloadHistory.length > downloadsPerPage && (
                <div className="mt-6">
                  <PaginationControls
                    currentPage={downloadsPage}
                    totalPages={totalDownloadsPages}
                    onPageChange={handleDownloadsPageChange}
                    className="justify-center"
                    theme="blue"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mb-6">
                <Download size={48} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{t('dashboard.downloadHistory.noDownloads')}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t('dashboard.downloadHistory.noDownloadsDescription')}
              </p>
              <Button asChild className="minecraft-btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500/90 hover:to-blue-600/90">
                <Link to="/mods">
                  <Gamepad2 size={16} className="mr-2" />
                  {t('dashboard.downloadHistory.exploreMods')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="minecraft-card border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-minecraft text-primary flex items-center">
                <MessageSquare size={22} className="mr-2 text-green-500" /> 
                {t('modDetail.comments')}
              </CardTitle>
              <CardDescription>Gerencie todos os seus comentários</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchUserComments()}
              className="hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500 group"
            >
              <RefreshCw size={16} className="mr-2 group-hover:text-green-500" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Buscar nos seus comentários..."
                    value={commentsSearch}
                    onChange={(e) => setCommentsSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={commentsDateFilter} onValueChange={setCommentsDateFilter}>
                  <SelectTrigger>
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="Filtrar por data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as datas</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500 group"
              >
                Limpar
              </Button>
            </div>
          </div>

          {commentsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : commentsData && commentsData.length > 0 ? (
            <div className="space-y-4">
              {paginatedComments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-lg border border-green-500/20 bg-background/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                        </Badge>
                        {comment.is_approved === false && (
                          <Badge variant="destructive" className="text-xs">
                            Pendente
                          </Badge>
                        )}
                        {comment.rating && (
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-current" />
                            <span className="text-sm text-muted-foreground">{comment.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-foreground mb-3 line-clamp-3 break-words overflow-wrap-anywhere">{comment.content}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Mod: {comment.mod_title || 'Mod não encontrado'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500 group">
                        <Link to={`/mods/${comment.mod_slug}`}>
                          <Eye size={14} className="mr-1 group-hover:text-green-500" />
                          Ver
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCommentToDelete(comment);
                          setShowDeleteModal(true);
                        }}
                        className="hover:bg-red-500/10 hover:border-red-500/50 text-red-500 hover:text-red-600 group"
                      >
                        <Trash2 size={14} className="mr-1 group-hover:text-red-600" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {commentsData.length > commentsPerPage && (
                <div className="mt-6">
                  <PaginationControls
                    currentPage={commentsPage}
                    totalPages={totalCommentsPages}
                    onPageChange={handleCommentsPageChange}
                    className="justify-center"
                    theme="green"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center shadow-lg">
                  <MessageSquare size={64} className="text-green-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                {commentsSearch || commentsDateFilter !== 'all' ? 'Nenhum comentário encontrado' : 'Nenhum comentário ainda'}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                {commentsSearch || commentsDateFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca ou data para encontrar seus comentários.'
                  : 'Explore nossa biblioteca de mods e deixe seus comentários para encontrá-los facilmente aqui'
                }
              </p>
              <Button asChild className="minecraft-btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-500/90 hover:to-green-600/90 text-lg px-8 py-3">
                <Link to="/mods">
                  <Gamepad2 size={20} className="mr-3" />
                  Explorar Mods
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-red-500/20 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Excluir Comentário</h3>
                <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja excluir este comentário? Ele será removido permanentemente do mod.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteComment}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
});

export default UserDashboardPage;
