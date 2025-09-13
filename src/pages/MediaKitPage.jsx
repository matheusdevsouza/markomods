
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import AudienceInsights from '@/components/AudienceInsights';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Youtube, Instagram, MessageCircle, Send, CheckCircle, Play, Eye, ExternalLink, CalendarDays, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Section = ({ children, className, id, title }) => (
  <motion.section 
    id={id}
    className={`py-16 md:py-20 px-4 container mx-auto ${className || ''}`}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {title && (
      <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-center gradient-text">
        {title}
      </h2>
    )}
    {children}
  </motion.section>
);

const PlatformIcon = ({ platformName, className }) => {
  const icons = {
    youtube: <Youtube className={className} />,
    tiktok: () => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 0 .17.01.24.02.04.01.08.01.12.02.39.03.77.07 1.14.13.28.05.55.1.81.17.09.02.18.04.27.06.02.01.03.01.05.01.14.04.28.08.41.13a3.49 3.49 0 011.07.57c.24.17.46.37.66.59.21.22.39.46.55.71.17.25.31.52.43.8.07.15.13.3.18.44.05.15.08.3.11.45.03.16.05.32.07.48.01.09.02.18.03.27.01.11.01.22.01.33L24 6.15v5.58c-.01.1-.01.19-.02.29-.01.11-.02.22-.04.33-.03.15-.06.3-.09.44-.04.16-.09.31-.14.46-.06.18-.12.35-.2.52-.08.17-.17.33-.26.49-.18.33-.39.63-.63.91-.24.28-.5.53-.79.75-.29.22-.6.42-.92.59-.24.13-.48.24-.73.34a6.2 6.2 0 01-3.16.52c-.01 0-.02.01-.03.01H16.23v-3.03c.48-.05.95-.12 1.41-.23.45-.1.88-.24 1.3-.41.41-.17.8-.38 1.17-.62.36-.24.7-.52.99-.84.29-.32.55-.68.77-1.07.22-.39.4-.82.53-1.28.03-.09.06-.19.08-.28.02-.1.03-.19.04-.29.01-.1.01-.19.01-.29V7.65c-.01-.41-.06-.81-.15-1.21-.09-.4-.23-.78-.41-1.15-.18-.37-.4-.71-.67-1.02-.27-.31-.58-.59-.91-.82-.33-.23-.69-.43-1.06-.59a3.2 3.2 0 00-1.12-.35c-.1-.02-.19-.03-.29-.04-.1-.01-.19-.01-.29-.01-.33 0-.66 0-1 .01h-.01c-.01 0-.01 0-.02 0a5.42 5.42 0 00-1.9.23c-.58.16-1.13.4-1.62.7-.49.3-.93.66-1.31 1.07-.38.41-.7 .88-1.03 1.33l-.01.01c-1.29 1.85-1.16 4.71.42 6.12 1.16 1.03 2.93.96 4.26-.26l.01-.01c.11-.09.2-.19.3-.3.11-.11.21-.22.31-.34l.01-.01c.02-.02.04-.04.06-.06.06-.07.12-.14.18-.21.02-.02.03-.04.05-.06.13-.16.25-.32.36-.49.11-.17.2-.34.29-.52.09-.18.16-.36.22-.55.06-.19.11-.38.14-.58.03-.2.05-.4.06-.6.01-.21.01-.42.01-.63V5.4c0-.01 0-.02 0-.03l-.01-.01v-.01h-.01V3.2H12.5c-.02.01-.03.01-.05.01l-.01-.01c-.39.06-.78.15-1.15.28-.37.13-.73.29-1.07.48-.34.19-.67.41-.97.66-.3.25-.58.53-.82.84-.24.31-.45.65-.63.99-.18.34-.33.7-.46 1.06-.13.36-.23.74-.31 1.12l-.01.02c0 .01-.01.02-.01.03v.01c0 .01 0 .01 0 .02v.01c-.06.55-.09 1.1-.09 1.66 0 .23.01.45.02.68l.01.01c.01.08.01.16.02.24v.01c.02.12.03.24.05.36l.01.01c.02.1.04.19.06.29.02.1.04.19.07.29.18.69.5 1.34 1.02 2.09l.01.01c.17.25.36.49.55.73.2.24.41.48.63.71.22.23.45.45.69.66.24.21.49.41.74.6.25.19.51.37.78.53.27.16.54.31.82.45.28.14.56.27.84.39.28.12.57.23.86.33.29.1.58.19.87.27l.01.01c1.11.28 2.3.29 3.42-.06V18.4c-1.18.31-2.42.24-3.54-.17a3.65 3.65 0 01-2.08-1.33c-.3-.36-.56-.75-.78-1.18-.22-.43-.39-.89-.51-1.36a4.5 4.5 0 01-.14-1.84c.09-.69.34-1.35.71-1.94.37-.6.86-1.12 1.42-1.52.56-.4 1.18-.71 1.82-.91.64-.2 1.3-.28 1.96-.26.32.01.63.04.94.09l.01.01c.01 0 .01 0 .02 0h.01c.2.03.4.08.59.13.19.05.38.11.57.18.19.07.37.15.55.24.18.09.35.19.52.3.17.11.33.22.49.34.16.12.31.25.46.39.15.14.29.28.42.44.13.16.25.32.37.49.12.17.22.34.32.52.1.18.19.37.27.56.08.19.15.38.21.58.06.2.11.4.15.6.04.2.07.4.09.61v0c.01.1.02.2.02.31.07 1.02-.22 2.04-.86 2.84-.64.8-1.61 1.27-2.66 1.27-.3 0-.59-.04-.88-.12-.29-.08-.57-.19-.84-.33-.27-.14-.52-.3-.76-.48s-.46-.38-.67-.59c-.21-.21-.4-.44-.57-.68-.17-.24-.32-.49-.45-.75-.13-.26-.24-.53-.33-.81-.09-.28-.16-.56-.21-.85-.05-.29-.08-.58-.09-.88-.01-.3-.01-.61.01-.91v-2.29c0-.01.01-.02.01-.03V9.58c0-.2-.01-.4-.03-.6a4.3 4.3 0 00-.09-.59c-.04-.19-.09-.38-.15-.57-.06-.19-.13-.37-.2-.55-.07-.18-.15-.36-.24-.53a3.48 3.48 0 00-1.07-1.48 3.45 3.45 0 00-1.57-.9c-.2-.07-.4-.12-.6-.17-.2-.05-.4-.08-.6-.11-.2-.03-.4-.05-.59-.06h-.01l-.02.01H6.23v12.43c0 .01 0 .02-.01.03 0 .01 0 .01-.01.02v.01c.02.33.06.66.13.98.07.32.17.64.29.95.12.31.27.61.43.9.16.29.34.58.54.85.2.27.42.53.65.78.23.25.48.48.73.7.25.22.52.43.79.62.27.19.55.37.84.54.29.17.58.32.88.46.3.14.61.27.92.38.31.11.62.21.94.29.32.08.64.15.96.2.32.05.64.08.96.09h.02c.32.01.63.01.95-.01.32-.02.63-.05.94-.1.31-.05.62-.11.92-.19.3-.08.59-.18.88-.29.29-.11.57-.24.84-.38.27-.14.54-.3.8-.47.26-.17.51-.35.75-.55.24-.20.47-.42.69-.65.22-.23.42-.47.61-.72.19-.25.37-.51.53-.78.16-.27.3-.55.43-.84a6.3 6.3 0 00.38-2.04c.01-.15.01-.3.01-.45V7.18l-.02-.01Z" /></svg>,
    instagram: <Instagram className={className} />,
  };
  return icons[platformName] || <MessageCircle className={className} />;
};

const MetricCard = ({ label, value, icon: Icon }) => (
  <Card className="bg-card/60 p-4 text-center glass-effect">
    {Icon && <Icon className="w-6 h-6 text-primary mx-auto mb-2" />}
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-xl font-semibold text-primary-foreground">{value || '-'}</p>
  </Card>
);

const YouTubeVideoCard = ({ video }) => (
  <motion.a 
    key={video.id} 
    href={video.video_url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="block group"
    whileHover={{ y: -5, boxShadow: "0px 10px 20px hsla(var(--primary), 0.2)" }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="overflow-hidden glass-effect border-border hover:border-primary/50 transition-all duration-300 ease-in-out h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <img-replace
          src={video.thumbnail_url || "/placeholder-images/default-video-thumb.jpg"}
          alt={`Thumbnail para ${video.title}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 transition-opacity duration-300 group-hover:opacity-80 flex items-center justify-center">
          <Play size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" fill="white"/>
        </div>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg text-card-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">{video.title}</h3>
        <div className="flex items-center text-xs text-muted-foreground mt-auto space-x-3">
          {video.views_text && <span className="flex items-center"><Eye size={12} className="mr-1"/> {video.views_text}</span>}
          {video.publish_date_text && <span className="flex items-center"><CalendarDays size={12} className="mr-1"/> {video.publish_date_text}</span>}
        </div>
      </CardContent>
       <div className="p-4 pt-0">
         <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary glow-on-hover">
           Ver no YouTube <ExternalLink size={14} className="ml-2"/>
         </Button>
      </div>
    </Card>
  </motion.a>
);

const CommentCard = ({ comment }) => (
 <motion.div 
    key={comment.id} 
    className="p-4 rounded-lg glass-effect flex gap-4 items-start"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Avatar className="h-10 w-10 border-2 border-primary/50">
      <AvatarImage src={comment.commenter_avatar_url || `https://avatar.vercel.sh/${comment.commenter_username}.png?size=40`} alt={comment.commenter_username} />
      <AvatarFallback>{comment.commenter_username ? comment.commenter_username.substring(0,2).toUpperCase() : '??'}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <p className="font-semibold text-primary-foreground">{comment.commenter_username || "Usuário Anônimo"}</p>
        {comment.commenter_is_verified && <CheckCircle className="h-4 w-4 text-accent" title="Verificado" />}
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(comment.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
      <p className="text-sm text-card-foreground whitespace-pre-wrap break-words overflow-wrap-anywhere">{comment.content}</p>
    </div>
  </motion.div>
);


const MediaKitPage = () => {
  const { mediaKitPublicData, fetchMediaKitData, targetProfileUsername, loadingData, updateAndSaveMediaKitData } = useData();
  const { session, currentUserProfile } = useAuth();
  const { toast } = useToast();
  const [activePlatform, setActivePlatform] = useState('youtube');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const profileData = mediaKitPublicData?.profile;
  const platformSpecificData = mediaKitPublicData?.platforms?.find(p => p.platform_name === activePlatform);
  const comments = mediaKitPublicData?.comments || [];
  const youtubeVideos = mediaKitPublicData?.youtube_videos || [];
  const commentsRequireApproval = profileData?.comments_require_approval === undefined ? true : profileData.comments_require_approval;
  
  const availablePlatforms = mediaKitPublicData?.platforms?.map(p => p.platform_name) || [];
  useEffect(() => {
    if (availablePlatforms.length > 0 && !availablePlatforms.includes(activePlatform)) {
      setActivePlatform(availablePlatforms[0]);
    }
  }, [availablePlatforms, activePlatform]);


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast({ title: "Comentário vazio", description: "Por favor, escreva algo.", variant: "destructive" });
      return;
    }
    if (!session?.user || !currentUserProfile) {
      toast({ title: "Login Necessário", description: "Você precisa estar logado para comentar.", variant: "destructive" });
      return;
    }
    setSubmittingComment(true);
    try {
      const newComment = {
        id: `comment_${Date.now()}`,
        media_kit_profile_id: profileData.id, 
        user_id: session.user.id, 
        content: commentText,
        created_at: new Date().toISOString(),
        commenter_username: currentUserProfile.username,
        commenter_avatar_url: currentUserProfile.avatar_url,
        commenter_is_verified: currentUserProfile.is_verified,
        is_approved: !commentsRequireApproval, 
      };
      
      const updatedData = {
        ...mediaKitPublicData,
        comments: [newComment, ...mediaKitPublicData.comments]
      };
      updateAndSaveMediaKitData(updatedData);

      setCommentText('');
      if (commentsRequireApproval) {
        toast({ 
          title: "Comentário Enviado!", 
          description: "Seu comentário foi enviado e aguarda aprovação.",
          action: <ShieldAlert className="text-yellow-500" />
        });
      } else {
        toast({ 
          title: "Comentário Publicado!", 
          description: "Obrigado pelo seu feedback.",
          action: <ShieldCheck className="text-purple-500" />
        });
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({ title: "Erro ao comentar", description: "Não foi possível enviar seu comentário.", variant: "destructive" });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loadingData && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-xl text-muted-foreground">Carregando Media Kit...</p>
      </div>
    );
  }
  
  if (!profileData && !loadingData) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <p className="text-xl text-muted-foreground">Perfil não encontrado ou não configurado.</p>
        <p className="text-sm text-muted-foreground mt-2">Verifique o nome de usuário ou configure o perfil no painel de administração.</p>
      </div>
    );
  }

  const displayedComments = commentsRequireApproval 
    ? comments.filter(c => c.is_approved) 
    : comments;

  return (
    <div className="overflow-x-hidden">
      <Header profileUsername={targetProfileUsername} />
      
      <Section id="metrics-selector" title="Métricas da Plataforma">
        {availablePlatforms.length > 0 ? (
          <Tabs value={activePlatform} onValueChange={setActivePlatform} className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {availablePlatforms.map(platformName => {
                let iconColorClass = "";
                if (platformName === 'youtube') iconColorClass = "text-red-500";
                else if (platformName === 'instagram') iconColorClass = "text-pink-500";
                
                return (
                  <TabsTrigger 
                    key={platformName} 
                    value={platformName} 
                    className="capitalize flex items-center gap-2"
                  >
                    <PlatformIcon platformName={platformName} className={`w-5 h-5 ${iconColorClass}`} /> 
                    {platformName.charAt(0).toUpperCase() + platformName.slice(1)}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {availablePlatforms.map(platformName => (
              <TabsContent key={platformName} value={platformName}>
                {platformSpecificData && platformSpecificData.platform_name === platformName ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                      <MetricCard label="Seguidores" value={platformSpecificData.overall_followers} />
                      <MetricCard label="Visualizações (Total)" value={platformSpecificData.overall_views} />
                      <MetricCard label="Média Views/Vídeo" value={platformSpecificData.average_views} />
                      <MetricCard label="Curtidas (Total)" value={platformSpecificData.total_likes} />
                      <MetricCard label="Média Curtidas/Vídeo" value={platformSpecificData.average_likes} />
                      <MetricCard label="Média Comentários/Vídeo" value={platformSpecificData.average_comments} />
                    </div>
                    <AudienceInsights 
                      insights={{
                        gender_stats: platformSpecificData.gender_stats || [],
                        age_range_stats: platformSpecificData.age_range_stats || [],
                        location_stats: platformSpecificData.location_stats || [],
                        main_city_override: platformSpecificData.main_city_override || (platformSpecificData.location_stats && platformSpecificData.location_stats.length > 0 ? platformSpecificData.location_stats[0].city : 'N/A'),
                      }} 
                    />
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-10">
                    Selecione uma plataforma para ver as métricas ou configure os dados no painel admin.
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            Nenhuma plataforma configurada. Adicione dados no painel de administração.
          </p>
        )}
      </Section>

      {youtubeVideos.length > 0 && (
        <Section id="portfolio" title="Portfólio de Vídeos (YouTube)">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {youtubeVideos.map(video => (
              <YouTubeVideoCard key={video.id} video={video} />
            ))}
          </div>
        </Section>
      )}

      <Section id="comments" title="Deixe seu Comentário">
        <div className="max-w-2xl mx-auto">
          {session?.user ? (
            <form onSubmit={handleCommentSubmit} className="space-y-4 mb-8">
              <Textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva seu comentário aqui..."
                className="bg-input/70 border-border focus:border-primary min-h-[100px]"
                rows={4}
              />
              <Button type="submit" disabled={submittingComment} className="w-full glow-on-hover bg-gradient-to-r from-purple-500 to-purple-600">
                <Send size={16} className="mr-2" />
                Enviar Comentário
              </Button>
            </form>
          ) : (
            <p className="text-center text-muted-foreground mb-8">
              Você precisa estar <a href="/login" className="text-primary hover:underline">logado</a> para comentar.
            </p>
          )}

          <div className="space-y-6">
            {displayedComments.length > 0 ? displayedComments.sort((a, b) => (b.commenter_is_verified ? 1 : 0) - (a.commenter_is_verified ? 1 : 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            )) : (
              <p className="text-center text-muted-foreground">
                {commentsRequireApproval && comments.length > 0 && displayedComments.length === 0 
                  ? "Nenhum comentário aprovado para exibição no momento." 
                  : "Ainda não há comentários. Seja o primeiro!"}
              </p>
            )}
          </div>
        </div>
      </Section>

    </div>
  );
};

export default MediaKitPage;