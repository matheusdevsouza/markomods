import React, { useState, useContext } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Tag, User, CalendarDays, Gamepad2, ArrowLeft, FileImage as ImageIcon, ChevronLeft, ChevronRight, MessageSquare, Send, Trash2 } from 'lucide-react';
import { AuthContext } from '@/App';
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from '../hooks/useTranslation';

const ModPage = ({ mods, addCommentToMod, deleteComment }) => {
  const { modId } = useParams();
  const mod = mods.find(m => m.id === modId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const { currentUser } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!mod) {
    return <Navigate to="/404" replace />;
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (mod.gallery?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + (mod.gallery?.length || 1)) % (mod.gallery?.length || 1));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast({ title: "Comentário Vazio", description: "Escreva algo antes de enviar.", variant: "destructive" });
      return;
    }
    if (!currentUser) {
      toast({ title: t('modDetail.loginRequired'), description: t('modDetail.loginToComment'), variant: "destructive" });
      navigate('/login', { state: { from: `/mod/${modId}` } });
      return;
    }
    addCommentToMod(modId, commentText);
    setCommentText('');
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 group minecraft-btn">
        <ArrowLeft size={20} className="mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
        Voltar para a lista de mods
      </Link>

      <Card className="minecraft-card overflow-hidden">
        <CardHeader className="bg-card/80 p-6 border-b-2 border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-4xl font-bold gradient-text-minecraft mb-1">{mod.name}</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">Versão para Minecraft: {mod.minecraftVersion}</CardDescription>
            </div>
            <a href={mod.downloadUrl} download>
              <Button size="lg" className="mt-4 md:mt-0 minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">
                <Download size={20} className="mr-2" /> {t('modDetail.downloadNow')}
              </Button>
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-3 flex items-center"><ImageIcon size={24} className="mr-2"/> Galeria</h2>
              {mod.gallery && mod.gallery.length > 0 ? (
                <div className="relative aspect-video bg-secondary/30 rounded-lg overflow-hidden border-2 border-border">
                  <img-replace src={mod.gallery[currentImageIndex]} alt={`Imagem ${currentImageIndex + 1} de ${mod.name}`} className="w-full h-full object-contain" />
                  {mod.gallery.length > 1 && (
                    <>
                      <Button variant="ghost" size="icon" onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white">
                        <ChevronLeft size={24} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white">
                        <ChevronRight size={24} />
                      </Button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {currentImageIndex + 1} / {mod.gallery.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">Nenhuma imagem na galeria.</p>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-3">{t('modDetail.description')}</h2>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{mod.description}</p>
            </div>
          </motion.div>

          <motion.div 
            className="space-y-4 p-4 bg-card/70 rounded-lg border border-border"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">Detalhes do Mod</h3>
            <div className="flex items-center text-foreground/90">
              <User size={18} className="mr-3 text-primary" />
              <span>{t('modDetail.author')}: <span className="font-medium">{mod.author}</span></span>
            </div>
            <div className="flex items-center text-foreground/90">
              <CalendarDays size={18} className="mr-3 text-primary" />
              <span>Publicado: <span className="font-medium">{new Date(mod.uploadDate).toLocaleDateString()}</span></span>
            </div>
            <div className="flex items-center text-foreground/90">
              <Gamepad2 size={18} className="mr-3 text-primary" />
              <span>Versão Minecraft: <span className="font-medium">{mod.minecraftVersion}</span></span>
            </div>
            <div className="mt-3">
              <h4 className="text-md font-semibold text-primary mb-2 flex items-center"><Tag size={18} className="mr-2 text-primary" /> Tags</h4>
              <div className="flex flex-wrap gap-2">
                {mod.tags.map(tag => (
                  <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </CardContent>

        <CardContent className="p-6 border-t-2 border-border">
          <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center"><MessageSquare size={24} className="mr-2"/> {t('modDetail.comments')} ({mod.comments?.length || 0})</h2>
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-6 space-y-3">
              <Textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva seu comentário..."
                className="bg-input border-border text-foreground focus:border-primary min-h-[80px]"
              />
              <Button type="submit" className="minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send size={16} className="mr-2"/> Enviar Comentário
              </Button>
            </form>
          ) : (
            <p className="text-muted-foreground mb-6">
              <Link to="/login" state={{ from: `/mod/${modId}` }} className="text-primary hover:underline">Faça login</Link> para deixar um comentário.
            </p>
          )}
          
          <div className="space-y-4">
            {mod.comments && mod.comments.length > 0 ? (
              mod.comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(comment => (
                <div key={comment.id} className="p-3 bg-card/50 rounded-md border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-foreground">{comment.user}</p>
                    {currentUser?.role === 'admin' && (
                       <Button variant="ghost" size="icon" onClick={() => deleteComment(modId, comment.id)} className="bg-red-500 hover:bg-red-600 text-white h-8 w-8">
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{new Date(comment.timestamp).toLocaleString()}</p>
                  <p className="text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">Nenhum comentário ainda. Seja o primeiro!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModPage;