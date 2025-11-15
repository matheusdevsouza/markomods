import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContextMods';
import { useTranslation } from '../../hooks/useTranslation';
import ModCard from '../../components/mods/ModCard';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Heart, ArrowLeft, Package, Eye, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PaginationControls from '@/components/ui/PaginationControls';

const FavoritesPage = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [favoritesPerPage] = useState(12);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchFavorites();
  }, [currentUser, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError(t('favorites.errors.authTokenNotFound'));
        setLoading(false);
        return;
      }

      const response = await fetch('/api/mods/user/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('favorites.errors.loadError'));
      }
    } catch (error) {
      setError(t('favorites.errors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (modId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/mods/${modId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.data.isFavorite) {
          setFavorites(prev => prev.filter(mod => mod.id !== modId));
          toast.success(t('favorites.removed'));
        }
      }
    } catch (error) {
      toast.error(t('favorites.errors.removeError'));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const [search, setSearch] = useState('');
  const [version, setVersion] = useState('all');
  const [order, setOrder] = useState('recent');
  const [contentType, setContentType] = useState('all');

  const availableVersions = useMemo(() => {
    if (loading) return ['all'];
    
    let filteredFavorites = favorites;
    
    if (contentType !== 'all') {
      filteredFavorites = favorites.filter(mod => 
        contentType === 'addons' ? mod.content_type_id === 2 : mod.content_type_id === 1
      );
    }
    
    const versions = new Set(
      filteredFavorites
        .map(mod => mod.minecraft_version)
        .filter(Boolean)
    );
    
    return ['all', ...Array.from(versions).sort().reverse()];
  }, [favorites, contentType, loading]);

  useEffect(() => {
    setVersion('all');
  }, [contentType]);

  const filteredFavorites = favorites
    .filter(mod => {
      const matchesSearch = search
        ? (mod.title || mod.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (mod.short_description || '').toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesVersion = version === 'all' ? true : (mod.minecraft_version === version);
      const matchesType = contentType === 'all' ? true : (
        contentType === 'addons' ? (mod.content_type_id === 2) : (mod.content_type_id === 1)
      );
      return matchesSearch && matchesVersion && matchesType;
    })
    .sort((a, b) => {
      if (order === 'recent') return (new Date(b.created_at || 0)) - (new Date(a.created_at || 0));
      if (order === 'popular') return (b.view_count || 0) - (a.view_count || 0);
      if (order === 'downloads') return (b.download_count || 0) - (a.download_count || 0);
      return 0;
    });

  const totalFavoritesPages = Math.ceil(filteredFavorites.length / favoritesPerPage);
  const paginatedFavorites = filteredFavorites.slice(
    (favoritesPage - 1) * favoritesPerPage,
    favoritesPage * favoritesPerPage
  );

  const handleFavoritesPageChange = (page) => {
    setFavoritesPage(page);
  };

  if (!currentUser) {
    return null;
  }


  if (error) {
    return (
      <div className="min-h-screen pt-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-minecraft text-primary">{t('favorites.errors.loadErrorTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-muted-foreground mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button onClick={fetchFavorites} variant="outline" className="text-sm sm:text-base w-full sm:w-auto">
                    {t('favorites.tryAgain')}
                  </Button>
                  <Button asChild className="text-sm sm:text-base w-full sm:w-auto">
                    <Link to="/mods">{t('favorites.backToMods')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent flex items-center gap-3">
                  <Heart className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  {t('favorites.title')}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
                  {favorites.length === 0 
                    ? t('favorites.subtitle.empty')
                    : favorites.length === 1
                      ? t('favorites.subtitle.count', { count: favorites.length })
                      : t('favorites.subtitle.count_plural', { count: favorites.length })
                  }
                </p>
              </div>
              <Button asChild variant="outline" className="text-primary hover:!text-primary hover:bg-primary/10 hover:border-primary/50 text-sm sm:text-base w-full sm:w-auto">
                <Link to="/mods">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('favorites.backToMods')}
                </Link>
              </Button>
            </div>

            <div className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('favorites.searchPlaceholder')}
                    className="w-full rounded-md bg-muted/30 border border-border/40 px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{t('favorites.filters.type')}:</span>
                  <div className="inline-flex rounded-md border border-border/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setContentType('all')}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${'all'===contentType ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-foreground hover:bg-muted/30'}`}
                    >{t('favorites.filters.all')}</button>
                    <button
                      type="button"
                      onClick={() => setContentType('mods')}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${'mods'===contentType ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-foreground hover:bg-muted/30'}`}
                    >{t('favorites.filters.mods')}</button>
                    <button
                      type="button"
                      onClick={() => setContentType('addons')}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${'addons'===contentType ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-foreground hover:bg-muted/30'}`}
                    >{t('favorites.filters.addons')}</button>
                  </div>
                </div>

                <div>
                  <Select value={version} onValueChange={setVersion}>
                    <SelectTrigger className="w-full bg-muted/30 border border-border/40 text-sm sm:text-base">
                      <SelectValue placeholder={t('favorites.filters.allVersions')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>
                          {contentType === 'all' 
                            ? t('favorites.filters.minecraftVersion') 
                            : contentType === 'addons' 
                              ? t('favorites.filters.addonVersions') 
                              : t('favorites.filters.modVersions')
                          }
                        </SelectLabel>
                        {availableVersions.map(versionOption => (
                          <SelectItem key={versionOption} value={versionOption}>
                            {versionOption === 'all' ? t('favorites.filters.allVersions') : versionOption}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={order} onValueChange={setOrder}>
                    <SelectTrigger className="w-full bg-muted/30 border border-border/40 text-sm sm:text-base">
                      <SelectValue placeholder={t('favorites.filters.sortBy')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t('favorites.filters.sorting')}</SelectLabel>
                        <SelectItem value="recent">{t('favorites.filters.mostRecent')}</SelectItem>
                        <SelectItem value="popular">{t('favorites.filters.mostViewed')}</SelectItem>
                        <SelectItem value="downloads">{t('favorites.filters.mostDownloaded')}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {favorites.length === 0 ? (
              <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
                <CardContent className="text-center py-8 sm:py-16">
                  <Heart className="h-16 w-16 sm:h-24 sm:w-24 text-primary/30 mx-auto mb-4 sm:mb-6" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
                    {t('favorites.empty.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">
                    {t('favorites.empty.description')}
                  </p>
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white text-sm sm:text-base w-full sm:w-auto">
                    <Link to="/mods">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {t('favorites.empty.exploreMods')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                  {paginatedFavorites.map((mod) => (
                    <motion.div key={mod.id} variants={itemVariants}>
                      <ModCard 
                        mod={mod} 
                        variants={itemVariants}
                        onFavoriteToggle={() => handleRemoveFavorite(mod.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                
                {filteredFavorites.length > favoritesPerPage && (
                  <div className="mt-6 sm:mt-8">
                    <PaginationControls
                      currentPage={favoritesPage}
                      totalPages={totalFavoritesPages}
                      onPageChange={handleFavoritesPageChange}
                      className="justify-center"
                    />
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
