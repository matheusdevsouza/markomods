import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Heart, Calendar, User, Tag } from 'lucide-react';
import { buildThumbnailUrl } from '@/utils/urls';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

const ModListItem = ({ mod, variants }) => {
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = useState(false);
  const [viewCount, setViewCount] = useState(mod.view_count || 0);
  const [downloadCount, setDownloadCount] = useState(mod.download_count || 0);
  const [favoriteCount, setFavoriteCount] = useState(mod.like_count || 0);

  // Verificar status de favorito ao carregar
  useEffect(() => {
    checkFavoriteStatus();
  }, [mod.id]);

  // Verificar se o mod é favorito para o usuário atual
  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/mods/${mod.id}/favorite`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.data.isFavorite);
      }
    } catch (error) {
      // Erro silencioso para verificação de favorito
    }
  };

  const handleViewDetailsClick = () => {
    // Registrar visualização ao clicar no item
    registerView();
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error(t('mods.loginRequired'));
      return;
    }

    try {
      const response = await fetch(`/api/mods/${mod.id}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.data.isFavorite);
        setFavoriteCount(data.data.newFavoriteCount);
        
        if (data.data.isFavorite) {
          toast.success(t('mods.addedToFavorites'));
        } else {
          toast.success(t('mods.removedFromFavorites'));
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || t('mods.favoriteError'));
      }
    } catch (error) {
      toast.error(t('mods.favoriteError'));
    }
  };

  const registerView = async () => {
    try {
      await fetch(`/api/mods/${mod.id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setViewCount(prev => prev + 1);
    } catch (error) {
      // Erro silencioso para visualização
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <motion.div variants={variants} className="h-full">
      <Card className="minecraft-card h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 group bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-0">
          <div className="flex h-full">
            {/* Thumbnail - Lado esquerdo */}
            <div className="flex-shrink-0 w-40 sm:w-48 h-full relative">
              <Link to={`/mods/${mod.slug}`} onClick={handleViewDetailsClick} className="block h-full">
                <img 
                  src={buildThumbnailUrl(mod.thumbnail_url) || '/placeholder-images/default-thumb.jpg'} 
                  alt={`Thumbnail de ${mod.title || mod.name}`} 
                  className="w-full h-full object-cover" 
                  style={{ objectPosition: 'center' }}
                />
                {/* Versão do Minecraft */}
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-minecraft-ten border border-border/30 shadow-lg">
                  {mod.minecraft_version}
                </div>
                {/* Botão de favorito */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 p-0 bg-background/90 backdrop-blur-sm hover:bg-background/80 border border-border/30"
                  onClick={handleFavoriteClick}
                >
                  <Heart 
                    size={12} 
                    className={isFavorited ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-500'} 
                  />
                </Button>
              </Link>
            </div>

            {/* Conteúdo - Lado direito */}
            <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
              {/* Header com título e visualizações */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <Link to={`/mods/${mod.slug}`} onClick={handleViewDetailsClick}>
                    <h3 className="text-lg font-minecraft text-primary group-hover:text-primary/80 transition-colors duration-300 leading-tight line-clamp-1 mb-1">
                      {mod.title || mod.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mod.short_description || t('mods.noDescription')}
                  </p>
                </div>
                
                {/* Visualizações */}
                <div className="flex items-center space-x-1 flex-shrink-0 bg-muted/20 rounded-lg px-2 py-1 border border-border/30">
                  <Eye size={12} className="text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{viewCount}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {(mod.tags && Array.isArray(mod.tags) ? mod.tags : []).slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-secondary/80 text-secondary-foreground border border-secondary/30 hover:bg-secondary/60 transition-colors duration-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Footer com estatísticas e botão */}
              <div className="flex items-center justify-between">
                {/* Estatísticas */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Download size={12} className="text-primary" />
                    <span className="text-xs">{downloadCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart size={12} className="text-primary" />
                    <span className="text-xs">{favoriteCount}</span>
                  </div>
                  {mod.author_name && (
                    <div className="flex items-center space-x-1">
                      <User size={12} className="text-primary" />
                      <span className="text-xs truncate max-w-20">{mod.author_name}</span>
                    </div>
                  )}
                </div>

                {/* Botão Ver Detalhes */}
                <Button 
                  asChild 
                  size="sm"
                  className="minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/25"
                >
                  <Link to={`/mods/${mod.slug}`} onClick={handleViewDetailsClick}>
                    <Eye size={14} className="mr-1" />
                    <span className="hidden sm:inline">{t('mods.viewDetails')}</span>
                    <span className="sm:hidden">Ver</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModListItem;
