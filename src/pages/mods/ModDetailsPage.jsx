
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useLocation } from 'react-router-dom';
import { processHtmlComplete } from '../../utils/htmlProcessor';
import { buildVideoUrl } from '@/utils/urls';
import VideoPlayer from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Heart, Star, Share2, Eye, EyeOff, User, CalendarDays, Gamepad2, Tag, ArrowLeft, ShieldAlert } from 'lucide-react';
import ShareButtons from '@/components/mods/ShareButtons';
import CommentSection from '@/components/mods/CommentSection';
import { useMods } from '@/contexts/ModsContext';
import { useToast } from '@/components/ui/use-toast';


const ModDetailsPage = () => {
  const { modId } = useParams();
  const [mod, setMod] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingMods, setLoadingMods] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const { toast, incrementModCounters } = useMods();
  const location = useLocation();
  const modUrl = `${window.location.origin}/mods/${modId}`;

  useEffect(() => {
    fetchModDetails();
    fetchModComments(modId);
  }, [modId]);

  const fetchModDetails = async () => {
    setLoadingMods(true);
    try {
      // Buscar dados reais do mod da API
      const response = await fetch(`/api/mods/mod/${modId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Mod não encontrado');
        } else {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      setMod(data.data);
      
      // Buscar comentários do mod
      await fetchModComments(modId);
      
    } catch (error) {
      toast({ title: "Erro ao carregar mod", description: error.message, variant: "destructive" });
      setMod(null);
    } finally {
      setLoadingMods(false);
    }
  };

  const fetchModComments = async (modId) => {
    setLoadingComments(true);
    try {
      const resp = await fetch(`/api/comments/mod/${modId}?limit=100`);
      if (resp.ok) {
        const data = await resp.json();
        setComments(data.data || []);
      } else {
        setComments([]);
      }
    } catch (error) {
      toast({ title: "Erro ao carregar comentários", description: error.message, variant: "destructive" });
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDownload = async () => {
    if (!mod) return;
    
    // Simular download
    toast({ title: t('modDetail.downloadNow'), description: t('modDetail.downloadNotAvailable') });
    incrementModCounters(mod.id, 'download');
  };

  const handleView = () => {
    if (!mod) return;
    incrementModCounters(mod.id, 'view');
  };

  if (loadingMods || !mod) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando mod...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
      onLoad={handleView}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <Button variant="ghost" asChild className="mb-6 minecraft-btn">
          <Link to={location.state?.from || '/search'}>
            <ArrowLeft size={20} className="mr-2" />
            Voltar
        </Link>
      </Button>

        {/* Header do Mod */}
        <Card className="minecraft-card mb-8">
          <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-4xl font-minecraft text-primary mb-2">{mod.name}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mb-4">
                  {mod.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mb-4">
                  {mod.tags && JSON.parse(mod.tags).map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button onClick={handleDownload} className="minecraft-btn bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white glow-on-hover">
                  <Download size={20} className="mr-2" />
                  {t('modDetail.downloadNow')}
                </Button>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download size={16} />
                    {mod.total_downloads || 0} downloads
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={16} />
                    {mod.total_views || 0} visualizações
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informações Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição Longa */}
            <Card className="minecraft-card">
              <CardHeader>
                <CardTitle className="text-xl font-minecraft text-primary">{t('modDetail.description')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-invert max-w-none"
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6'
                  }}
                >
                  {mod.long_description_markdown ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: processHtmlComplete(mod.long_description_markdown)
                    }} />
                  ) : (
                    <p className="text-muted-foreground">{mod.description}</p>
                  )}
                </div>
                <style jsx>{`
                  .prose br {
                    display: block !important;
                    margin: 0.5rem 0 !important;
                    line-height: 1.5rem !important;
                    height: 1.5rem !important;
                  }
                `}</style>
              </CardContent>
            </Card>


            {/* Galeria de Imagens */}
            {mod.gallery_urls && JSON.parse(mod.gallery_urls).length > 0 && (
              <Card className="minecraft-card">
                <CardHeader>
                  <CardTitle className="text-xl font-minecraft text-primary">Galeria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {JSON.parse(mod.gallery_urls).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${mod.name} - Imagem ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(url, '_blank')}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vídeo do Mod (arquivo) */}
            {mod.video_url && (
              <Card className="minecraft-card">
                <CardHeader>
                  <CardTitle className="text-xl font-minecraft text-primary">Vídeo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    {(() => {
                      const raw = mod.video_url || '';
                      const videoSrc = buildVideoUrl(raw);
                      const ext = (raw.split('.').pop() || '').toLowerCase();
                      const type = ext === 'mp4' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : ext === 'ogg' ? 'video/ogg' : undefined;
                      return <VideoPlayer src={videoSrc} type={type} />;
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações do Mod */}
            <Card className="minecraft-card">
              <CardHeader>
                <CardTitle className="text-lg font-minecraft text-primary">{t('modDetail.information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Versão:</span>
                  <span className="font-medium">{mod.minecraft_version}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('modDetail.author')}:</span>
                  <span className="font-medium">{mod.author_username}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Publicado:</span>
                  <span className="font-medium">
                    {new Date(mod.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                {mod.updated_at && mod.updated_at !== mod.created_at && (
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Atualizado:</span>
                    <span className="font-medium">
                      {new Date(mod.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="minecraft-card">
              <CardHeader>
                <CardTitle className="text-lg font-minecraft text-primary">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('modDetail.downloads')}</span>
                  <span className="font-medium text-primary">{mod.total_downloads || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visualizações</span>
                  <span className="font-medium text-primary">{mod.total_views || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('modDetail.comments')}</span>
                  <span className="font-medium text-primary">{mod.comment_count || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de Compartilhamento */}
        <Card className="minecraft-card mb-8">
          <CardContent className="p-6">
            <ShareButtons modName={mod.name} modUrl={modUrl} />
          </CardContent>
        </Card>

        {/* Seção de Comentários */}
        <Card className="minecraft-card">
          <CardContent className="p-6">
           <CommentSection modId={mod.id} initialComments={comments} onCommentPosted={() => fetchModComments(mod.id)} />
        </CardContent>
      </Card>
      </div>
    </motion.div>
  );
};

export default ModDetailsPage;
