import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, Tags, Heart } from 'lucide-react';
import { buildThumbnailUrl } from '@/utils/urls';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
const ModCard = ({ mod, variants, compact = false, imageSize = 'default', showStats = true }) => {
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = useState(false);
  const [viewCount, setViewCount] = useState(mod.view_count || 0);
  const [downloadCount, setDownloadCount] = useState(mod.download_count || 0);
  const [favoriteCount, setFavoriteCount] = useState(mod.like_count || 0);
  useEffect(() => {
    checkFavoriteStatus();
  }, [mod.id]);
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
    }
  };
  const handleViewDetailsClick = () => {
  };
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Faça login para favoritar mods');
        return;
      }
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
        if (data.data.isFavorite) {
          setFavoriteCount(prev => prev + 1);
          toast.success('Mod adicionado aos favoritos!');
        } else {
          setFavoriteCount(prev => Math.max(prev - 1, 0));
          toast.success('Mod removido dos favoritos!');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Erro ao favoritar mod');
      }
    } catch (error) {
      toast.error('Erro ao favoritar mod');
    }
  };
  const handleDownloadClick = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`/api/mods/${mod.id}/download`, {
        method: 'POST',
        headers
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.download_count !== undefined) {
          setDownloadCount(data.data.download_count);
        } else {
          setDownloadCount(prev => prev + 1);
        }
        toast.success('Download registrado!');
        try {
          const historyKey = 'userDownloadHistory';
          const raw = localStorage.getItem(historyKey);
          const list = raw ? JSON.parse(raw) : [];
          const entry = {
            modId: mod.id,
            id: mod.id,
            name: mod.title || mod.name,
            title: mod.title || mod.name,
            thumbnail_url: mod.thumbnail_url,
            minecraft_version: mod.minecraft_version,
            short_description: mod.short_description,
            saved_at: new Date().toISOString()
          };
          const dedup = [entry, ...list.filter(i => i.modId !== mod.id)].slice(0, 20);
          localStorage.setItem(historyKey, JSON.stringify(dedup));
          localStorage.setItem('downloadsUpdated', String(Date.now()));
          const totalKey = 'userDownloadTotalLocal';
          const prev = parseInt(localStorage.getItem(totalKey) || '0', 10);
          localStorage.setItem(totalKey, String(prev + 1));
        } catch {}
        const url = mod.download_url_pc || mod.download_url || mod.download_url_mobile;
        if (url) {
          window.open(url, '_blank');
        }
      }
    } catch (error) {
    }
  };
  if (compact) {
    return (
      <motion.div variants={variants} className="h-full max-w-sm mx-auto">
        <Card className="minecraft-card h-full flex flex-col overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 hover:scale-[1.02] group bg-card/50 backdrop-blur-sm border-border/50">
          {}
          <Link to={`/mods/${mod.slug}`} onClick={handleViewDetailsClick} className="block relative">
            <div className="relative overflow-hidden mod-image-container aspect-[4/3] w-full bg-gradient-to-br from-gray-800 to-gray-900">
              <img
                src={buildThumbnailUrl(mod.thumbnail_url) || '/placeholder-images/default-thumb.jpg'}
                alt={`Thumbnail de ${mod.title || mod.name}`}
                className="mod-image w-full h-full object-contain"
                style={{ objectPosition: 'center' }}
              />
              <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-minecraft-ten border border-border/30 shadow-lg">
                {mod.minecraft_version}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background/80 border border-border/30"
                onClick={handleFavoriteClick}
              >
                <Heart
                  size={16}
                  className={isFavorited ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-500'}
                />
              </Button>
            </div>
          </Link>
          {}
          <div className="flex-1 flex flex-col justify-between p-4">
            <div>
              {}
              <div className="flex items-start justify-between gap-3 mb-1">
                {}
                <div className="flex-1 min-w-0">
                  <Link to={`/mods/${mod.slug}`} onClick={handleViewDetailsClick}>
                    <CardTitle className="text-lg font-minecraft text-primary group-hover:text-primary/80 transition-colors duration-300 leading-tight line-clamp-1">
                      {mod.title || mod.name}
                    </CardTitle>
                  </Link>
                </div>
                {}
                {showStats && (
                  <div className="flex items-center space-x-2 flex-shrink-0 bg-muted/20 rounded-lg px-2 py-1 border border-border/30">
                    <Eye size={14} className="text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">{viewCount}</span>
                  </div>
                )}
              </div>
              {}
              <div className="flex flex-wrap gap-1 mb-2 w-full">
                {(mod.category ? [mod.category] : []).slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-secondary/80 text-secondary-foreground px-2 py-1 text-xs rounded-md font-minecraft-ten border border-secondary/30 hover:bg-secondary/60 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {}
              <CardDescription className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-3">
                {mod.short_description || t('mods.noDescription')}
              </CardDescription>
            </div>
            {}
            <div className="space-y-3">
              {}
              {showStats && (
                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground bg-muted/20 rounded-lg py-2 px-3 border border-border/30">
                  <div className="flex flex-col items-center space-y-0.5">
                    <span className="flex items-center space-x-2">
                      <Download size={14} className="text-primary" />
                      <span className="font-medium">{downloadCount}</span>
                    </span>
                    <span className="text-xs opacity-70">{t('mods.downloads')}</span>
                  </div>
                  <div className="flex flex-col items-center space-y-0.5">
                    <span className="flex items-center space-x-2">
                      <Heart size={14} className="text-primary" />
                      <span className="font-medium">{favoriteCount}</span>
                    </span>
                    <span className="text-xs opacity-70">{t('mods.favorites')}</span>
                  </div>
                </div>
              )}
              {}
              <Button asChild className="w-full minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 h-10 shadow-lg shadow-primary/25">
                <Link to={`/mods/${mod.slug}`} onClick={handleViewDetailsClick}>
                  <Eye size={16} className="mr-2" />
                  <span className="text-sm font-medium">{t('mods.viewDetails')}</span>
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
  return (
    <motion.div variants={variants} className="h-full max-w-sm mx-auto">
      <Card className="minecraft-card h-full flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 hover:scale-[1.02] group bg-card/50 backdrop-blur-sm border-border/50">
        <Link to={`/mods/${mod.slug}`} onClick={handleViewDetailsClick} className="block">
          <div className="relative overflow-hidden mod-image-container aspect-[4/3] w-full bg-gradient-to-br from-gray-800 to-gray-900">
            <img
              src={buildThumbnailUrl(mod.thumbnail_url) || '/placeholder-images/default-thumb.jpg'}
              alt={`Thumbnail de ${mod.title || mod.name}`}
              className="mod-image w-full h-full object-contain"
              style={{ objectPosition: 'center' }}
            />
            {}
            <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-minecraft-ten border border-border/30 shadow-lg z-10">
              {mod.minecraft_version || 'N/A'}
            </div>
            {}
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm p-1.5 rounded-md border border-border/30 shadow-lg hover:bg-background/70 transition-colors duration-200 z-10"
            >
              <Heart
                size={14}
                className={`transition-colors duration-200 ${isFavorited ? __STRING_PLACEHOLDER_46__ : __STRING_PLACEHOLDER_47__}`}
              />
            </button>
            {}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
        <CardHeader className="pb-3 pt-4">
          {}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex-1 min-w-0">
              <Link to={`/mods/${mod.slug}`} onClick={handleViewDetailsClick}>
                <CardTitle className="text-xl font-minecraft text-primary line-clamp-2 group-hover:text-primary/80 transition-colors duration-300">{mod.title || mod.name}</CardTitle>
              </Link>
            </div>
            {}
            {showStats && (
              <div className="flex items-center space-x-2 flex-shrink-0 bg-muted/20 rounded-lg px-2 py-1 border border-border/30">
                <Eye size={14} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">{viewCount}</span>
              </div>
            )}
          </div>
          {}
          {mod.tags && Array.isArray(mod.tags) && mod.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 w-full">
              {mod.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-secondary/80 text-secondary-foreground px-2 py-1 text-xs rounded-md font-minecraft-ten border border-secondary/30 hover:bg-secondary/60 transition-colors duration-200 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {}
          <CardDescription className="text-muted-foreground line-clamp-2 h-10 text-sm leading-relaxed w-full">
            {mod.short_description || t('mods.noDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between pt-2">
          {}
          <div className="flex-grow"></div>
          {}
          {showStats && (
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground mb-4 bg-muted/20 rounded-lg py-1 px-3 border border-border/30">
              <div className="flex flex-col items-center space-y-0.5">
                <span className="flex items-center space-x-2">
                  <Download size={14} className="text-primary" />
                  <span className="font-medium">{downloadCount}</span>
                </span>
                <span className="text-xs opacity-70">{t('mods.downloads')}</span>
              </div>
              <div className="flex flex-col items-center space-y-0.5">
                <span className="flex items-center space-x-2">
                  <Heart size={14} className="text-primary" />
                  <span className="font-medium">{favoriteCount}</span>
                </span>
                <span className="text-xs opacity-70">{t('mods.favorites')}</span>
              </div>
            </div>
          )}
          {}
          <div className="flex-shrink-0">
            <Button asChild className="w-full minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 h-10 shadow-lg shadow-primary/25">
              <Link to={`/mods/${mod.slug}`} onClick={handleViewDetailsClick}>
                <Eye size={16} className="mr-2" />
                <span className="text-sm font-medium">{t('mods.viewDetails')}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default ModCard;