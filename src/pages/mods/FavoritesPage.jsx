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
        setError('Token de autenticação não encontrado');
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
        setError(errorData.message || 'Erro ao carregar favoritos');
      }
    } catch (error) {
      setError('Erro ao carregar favoritos');
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
          toast.success('Mod removido dos favoritos!');
        }
      }
    } catch (error) {
      toast.error('Erro ao remover favorito');
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

  if (loading) {
    return (
      <div className="min-h-screen pt-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-6 w-40 sm:h-8 sm:w-48 bg-gradient-to-r from-gray-700 to-gray-600" />
                <Skeleton className="h-4 w-64 sm:h-6 sm:w-96 bg-gradient-to-r from-gray-700 to-gray-600" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-64 sm:h-80 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-minecraft text-primary">Erro ao Carregar Favoritos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-muted-foreground mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button onClick={fetchFavorites} variant="outline" className="text-sm sm:text-base w-full sm:w-auto">
                    Tentar Novamente
                  </Button>
                  <Button asChild className="text-sm sm:text-base w-full sm:w-auto">
                    <Link to="/mods">Voltar para Mods</Link>
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-minecraft text-primary mb-2">
                  <Heart className="inline-block h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-red-500 mr-2 align-[-2px]" />
                  Meus Favoritos
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {favorites.length === 0 
                    ? 'Você ainda não tem mods favoritados'
                    : `Você tem ${favorites.length} mod${favorites.length === 1 ? '' : 's'} favoritado${favorites.length === 1 ? '' : 's'}`
                  }
                </p>
              </div>
              <Button asChild variant="outline" className="text-primary hover:!text-primary hover:bg-primary/10 hover:border-primary/50 text-sm sm:text-base w-full sm:w-auto">
                <Link to="/mods">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Mods
                </Link>
              </Button>
            </div>

            <div className="bg-card/40 border border-border/40 rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome ou descrição"
                    className="w-full rounded-md bg-muted/30 border border-border/40 px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Tipo:</span>
                  <div className="inline-flex rounded-md border border-border/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setContentType('all')}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${'all'===contentType ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-foreground hover:bg-muted/30'}`}
                    >Todos</button>
                    <button
                      type="button"
                      onClick={() => setContentType('mods')}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${'mods'===contentType ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-foreground hover:bg-muted/30'}`}
                    >Mods</button>
                    <button
                      type="button"
                      onClick={() => setContentType('addons')}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${'addons'===contentType ? 'bg-primary text-primary-foreground' : 'bg-muted/20 text-foreground hover:bg-muted/30'}`}
                    >Addons</button>
                  </div>
                </div>

                <div>
                  <Select value={version} onValueChange={setVersion}>
                    <SelectTrigger className="w-full bg-muted/30 border border-border/40 text-sm sm:text-base">
                      <SelectValue placeholder="Todas as versões" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>
                          {contentType === 'all' 
                            ? 'Versão do Minecraft' 
                            : contentType === 'addons' 
                              ? 'Versões de Addons' 
                              : 'Versões de Mods'
                          }
                        </SelectLabel>
                        {availableVersions.map(versionOption => (
                          <SelectItem key={versionOption} value={versionOption}>
                            {versionOption === 'all' ? 'Todas as versões' : versionOption}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={order} onValueChange={setOrder}>
                    <SelectTrigger className="w-full bg-muted/30 border border-border/40 text-sm sm:text-base">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Ordenação</SelectLabel>
                        <SelectItem value="recent">Mais recentes</SelectItem>
                        <SelectItem value="popular">Mais vistos</SelectItem>
                        <SelectItem value="downloads">Mais baixados</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {favorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center py-8 sm:py-16"
              >
                <Heart className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground/30 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">
                  Nenhum Favorito Ainda
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">
                  Você ainda não favoritou nenhum mod. Explore nossa coleção e adicione seus mods favoritos!
                </p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-sm sm:text-base w-full sm:w-auto">
                  <Link to="/mods">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Explorar Mods
                  </Link>
                </Button>
              </motion.div>
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
