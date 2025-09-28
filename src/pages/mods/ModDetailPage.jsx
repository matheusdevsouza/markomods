import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextMods';
import { useThemeMods } from '../../contexts/ThemeContextMods';
import { useTranslation } from '../../hooks/useTranslation';
import { buildThumbnailUrl, buildAvatarUrl } from '../../utils/urls';
import { processHtmlComplete } from '../../utils/htmlProcessor';
import YouTubePlayer from '../../components/YouTubePlayer';

import { 
  Download, 
  Calendar, 
  User, 
  Eye, 
  ArrowLeft,
  Tag,
  Package,
  MessageSquare,
  LogIn,
  Send,
  Loader2,
  Trash2,
  Clock,
  Heart,
  X,
  AlertTriangle,
  Reply,
  Shield
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import AdSpace from '../../components/ads/AdSpace';
import GoogleAdsenseMeta from '../../components/ads/GoogleAdsenseMeta';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const ModDetailPage = () => {
  const { slug } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const { theme } = useThemeMods();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Funções auxiliares para classes condicionais baseadas no tema
  const getCardClasses = () => {
    return theme === 'light' 
      ? 'bg-white/90 border-gray-200/50 shadow-lg' 
      : 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm';
  };

  const getTextClasses = () => {
    return theme === 'light' 
      ? 'text-gray-900' 
      : 'text-white';
  };

  const getSubtextClasses = () => {
    return theme === 'light' 
      ? 'text-gray-600' 
      : 'text-gray-300';
  };

  const getInfoCardClasses = () => {
    return theme === 'light' 
      ? 'bg-gray-50/80 hover:bg-gray-100/80' 
      : 'bg-gray-900/30 hover:bg-gray-900/50';
  };

  const getCommentCardClasses = () => {
    return theme === 'light' 
      ? 'bg-gray-50/80 border-gray-200/50' 
      : 'bg-gray-900/50 border-gray-700/50';
  };

  const getInputClasses = () => {
    return theme === 'light' 
      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-primary/20' 
      : 'bg-gray-900/30 border-gray-700/50 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20';
  };

  
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imageError, setImageError] = useState(false);
  
  // Estado para favoritos
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Estados para comentários
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [commentCooldown, setCommentCooldown] = useState(0);
  
  // Estados para sistema de respostas
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Estados para controlar animações
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchModBySlug(slug);
    }
  }, [slug, currentUser]);

  // Registrar visualização quando o mod for carregado
  useEffect(() => {
    if (mod && !loading) {
      registerView(mod.id);
    }
  }, [mod, loading]);

  // Carregar comentários quando o mod for carregado
  useEffect(() => {
    if (mod && !loading) {
      fetchComments();
    }
  }, [mod, loading]);

  // Verificar status de favorito quando o mod for carregado
  useEffect(() => {
    if (mod && !loading && isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [mod, loading, isAuthenticated]);

  // Controla animações de entrada da página
  useEffect(() => {
    if (!loading && mod) {
      const timer = setTimeout(() => setPageLoaded(true), 100);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [loading, mod]);

  // Controla o cooldown de comentários
  useEffect(() => {
    if (commentCooldown > 0) {
      const timer = setInterval(() => {
        setCommentCooldown(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [commentCooldown]);

  const fetchModBySlug = async (slug) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const apiUrl = `/api/mods/public/${slug}`;

      const response = await fetch(apiUrl, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setMod(data.data);
      } else {
        // Tentar obter mais detalhes do erro
        try {
          const errorData = await response.json();
          setError(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        } catch (parseError) {
          setError(`Erro ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      setError('Erro ao carregar mod');
    } finally {
      setLoading(false);
    }
  };



  const handleDownload = async (url, platform) => {
    if (!url) {
      toast.error(`${t('modDetail.downloadNotAvailable')} ${platform === 'mobile' ? 'mobile' : 'PC'}`);
      return;
    }
    
    // Redirecionar para a página de download
    navigate(`/mods/${mod.slug}/download`);
  };





  // Registrar visualização do mod
  const registerView = async (modId) => {
    try {
      const response = await fetch(`/api/mods/mod/${mod.id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
      }
    } catch (error) {
      // Erro silencioso para visualização
    }
  };

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
        setIsFavorite(data.data.isFavorite);
      }
    } catch (error) {
      // Erro silencioso para verificação de favorito
    }
  };

  // Função para favoritar/desfavoritar mod
  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(t('mods.loginRequired'));
      return;
    }

    setFavoriteLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error(t('mods.loginRequired'));
        return;
      }

      const response = await fetch(`/api/mods/${mod.id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setIsFavorite(result.data.isFavorite);
        setMod(prev => ({
          ...prev,
          like_count: result.data.like_count
        }));
        toast.success(result.data.isFavorite ? t('mods.addedToFavorites') : t('mods.removedFromFavorites'));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || t('mods.favoriteError'));
      }
    } catch (error) {
      toast.error(t('mods.favoriteError'));
    } finally {
      setFavoriteLoading(false);
    }
  };



  const getLoaderIcon = (loader) => {
    switch (loader?.toLowerCase()) {
      case 'forge':
        return <Package className="h-4 w-4 text-primary" />;
      case 'neoforge':
        return <Package className="h-4 w-4 text-primary" />;
      case 'fabric':
        return <Package className="h-4 w-4 text-primary" />;
      default:
        return <Package className="h-4 w-4 text-primary" />;
    }
  };

  const getLoaderColor = (loader) => {
    switch (loader?.toLowerCase()) {
      case 'forge':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'neoforge':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'fabric':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const getMinecraftVersionColor = (version) => {
    if (version?.includes('1.20')) return 'bg-green-500/20 text-green-600 border-green-500/30';
    if (version?.includes('1.19')) return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    if (version?.includes('1.18')) return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
    return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  };

  // Funções para gerenciar comentários
  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const token = localStorage.getItem('authToken');
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/comments/mod/${mod.id}?includeReplies=true`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.data || []);
      } else {
        setComments([]);
      }
    } catch (error) {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment.trim(),
          modId: mod.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.data, ...prev]);
        setNewComment('');
        toast.success('Comentário enviado com sucesso!');
      } else {
        const errorData = await response.json();
        
        // Verificar se é erro de cooldown
        if (errorData.cooldown) {
          toast.error(errorData.message, { 
            duration: 8000,
            icon: '⏰'
          });
          
          // Extrair tempo restante da mensagem (suporte para diferentes formatos)
          let cooldownSeconds = 0;
          
          // Tentar extrair dias
          const daysMatch = errorData.message.match(/(\d+)\s*dia\(s\)/);
          if (daysMatch) {
            cooldownSeconds = parseInt(daysMatch[1]) * 24 * 60 * 60;
          } else {
            // Tentar extrair horas
            const hoursMatch = errorData.message.match(/(\d+)\s*hora\(s\)/);
            if (hoursMatch) {
              cooldownSeconds = parseInt(hoursMatch[1]) * 60 * 60;
            } else {
              // Tentar extrair minutos
              const minutesMatch = errorData.message.match(/(\d+)\s*minuto\(s\)/);
              if (minutesMatch) {
                cooldownSeconds = parseInt(minutesMatch[1]) * 60;
              }
            }
          }
          
          if (cooldownSeconds > 0) {
            setCommentCooldown(cooldownSeconds);
          }
        } else {
          toast.error(errorData.message || 'Erro ao enviar comentário');
        }
      }
    } catch (error) {
      toast.error('Erro ao enviar comentário');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Faça login para curtir comentários');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                user_liked: data.data.user_liked,
                likes_count: data.data.likes_count 
              }
            : comment
        ));
      }
    } catch (error) {
      toast.error('Erro ao curtir comentário');
    }
  };

  const handleDeleteComment = (commentId) => {
    // Procurar primeiro nos comentários principais
    let comment = comments.find(c => c.id === commentId);
    
    // Se não encontrou, procurar nas respostas
    if (!comment) {
      for (const mainComment of comments) {
        if (mainComment.replies) {
          comment = mainComment.replies.find(r => r.id === commentId);
          if (comment) break;
        }
      }
    }
    
    if (comment) {
      setCommentToDelete(comment);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch(`/api/comments/${commentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Verificar se é uma resposta ou comentário principal
        const isReply = commentToDelete.is_reply || commentToDelete.parent_id;
        
        if (isReply) {
          // Remover resposta da lista de respostas do comentário pai
          setComments(prev => prev.map(comment => {
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== commentToDelete.id)
              };
            }
            return comment;
          }));
          toast.success(t('modDetail.replyDeletedSuccess'));
        } else {
          // Remover comentário principal
          setComments(prev => prev.filter(comment => comment.id !== commentToDelete.id));
          toast.success('Comentário excluído com sucesso!');
        }
        
        setShowDeleteModal(false);
        setCommentToDelete(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao excluir comentário');
      }
    } catch (error) {
      toast.error('Erro ao excluir comentário');
    }
  };

  const cancelDeleteComment = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  // Funções para sistema de respostas
  const handleReplyClick = (comment) => {
    setReplyingToComment(comment);
    setReplyContent('');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyingToComment || !replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/comments/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          parentId: replyingToComment.id,
          content: replyContent.trim(),
          modId: mod.id
        })
      });

      if (response.ok) {
        toast.success(t('modDetail.replySentSuccess'));
        setReplyingToComment(null);
        setReplyContent('');
        // Recarregar comentários para mostrar a nova resposta
        fetchComments();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar resposta');
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao enviar resposta');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const cancelReply = () => {
    setReplyingToComment(null);
    setReplyContent('');
  };

  // Função para formatar o tempo de cooldown de forma legível
  const formatCooldownTime = (seconds) => {
    if (seconds >= 86400) { // 1 dia ou mais
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      if (days > 0) {
        return `${days}d ${hours}h`;
      }
      return `${hours}h`;
    } else if (seconds >= 3600) { // 1 hora ou mais
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    } else { // Menos de 1 hora
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    }
  };

  // Votar em comentário
  const handleVoteComment = async (commentId, voteType) => {
    if (!isAuthenticated) {
      toast.error('Faça login para votar em comentários');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Recarregar comentários para obter dados atualizados
        await fetchComments();

        // Mostrar mensagem baseada na ação
        if (data.data && data.data.action === 'added') {
          toast.success(`Voto ${voteType === 'upvote' ? 'positivo' : 'negativo'} registrado!`);
        } else if (data.data && data.data.action === 'removed') {
          toast.success('Voto removido!');
        } else if (data.data && data.data.action === 'changed') {
          toast.success(`Voto alterado para ${voteType === 'upvote' ? 'positivo' : 'negativo'}!`);
        } else {
          toast.success('Voto registrado!');
        }
      } else {
        toast.error('Erro ao registrar voto');
      }
    } catch (error) {
      toast.error('Erro ao registrar voto');
    }
  };

  // Função para construir URL completa do avatar
  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    
    // Para desenvolvimento local, usar a porta do backend
    if (window.location.origin.includes('localhost:5173')) {
      return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${avatarUrl}`;
    }
    
    return `${window.location.origin}${avatarUrl}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background fixed inset-0 overflow-y-auto pt-32">
        <div className="flex w-full h-full">
          <div className="flex-1 px-4">
            <div className={`max-w-4xl mx-auto space-y-6 rounded-xl p-6 ${getCardClasses()}`}>
              {/* Header skeleton */}
              <div className="space-y-4 animate-pulse">
                <Skeleton className="h-8 w-48 bg-gradient-to-r from-gray-700 to-gray-600" />
                <Skeleton className="h-12 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-gray-700 to-gray-600" />
              </div>
              
              {/* Image skeleton */}
              <Skeleton className="h-80 w-full rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse" />
              
              {/* Tabs skeleton */}
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Skeleton className="h-10 w-24 bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-10 w-24 bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-10 w-24 bg-gradient-to-r from-gray-700 to-gray-600" />
                </div>
                <Skeleton className="h-32 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6 ml-8">
              {/* Statistics skeleton */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm animate-pulse">
                <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-gray-700 to-gray-600" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-16 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-16 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-16 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                </div>
              </div>
              
              {/* Categories skeleton */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm animate-pulse">
                <Skeleton className="h-6 w-1/2 bg-gradient-to-r from-gray-700 to-gray-600" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-6 w-20 bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-6 w-14 bg-gradient-to-r from-gray-700 to-gray-600" />
                </div>
              </div>
              
              {/* Technical info skeleton */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm animate-pulse">
                <Skeleton className="h-6 w-2/3 bg-gradient-to-r from-gray-700 to-gray-600" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-4 w-4/5 bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-gray-700 to-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !mod) {
    return (
      <div className="min-h-screen bg-background fixed inset-0 overflow-y-auto pt-32">
        <div className="flex w-full h-full items-center justify-center">
          {/* Error Content */}
          <div className="text-center space-y-8 max-w-4xl">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Text */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-primary">
                {error || 'Mod não encontrado'}
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {error ? 
                  `Erro ao carregar o mod: ${error}` : 
                  'O mod que você está procurando não existe ou foi removido do nosso catálogo.'
                }
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/mods">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg h-auto shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Explorar Mods
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 hover:text-primary px-8 py-3 text-lg h-auto transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20">
                  <span className="text-primary hover:text-primary transition-colors duration-300">Ir para Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recommendedDownload = mod.download_url_pc || mod.download_url_mobile;

  return (
    <div className="min-h-screen">
      {/* Meta tags do Google AdSense */}
      <GoogleAdsenseMeta />
      
      {/* Container de Anúncios - Largura total */}
      <div className="w-full px-4 py-6">
        <AdSpace 
          page="mod-detail" 
          position="top-banner"
          fallbackText="Nenhum anúncio configurado"
        />
      </div>
      
      {/* Layout em coluna única - Com limitação */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 py-4 sm:py-6">
        {/* Botão Voltar - Fora do container */}
        <div className={`transition-all duration-700 ease-out ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Link to={mod?.content_type_id === 2 ? "/addons" : "/mods"} className={`inline-flex items-center text-sm hover:text-primary transition-colors ${getSubtextClasses()}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {mod?.content_type_id === 2 
              ? t('modDetail.backToAddons') 
              : t('modDetail.backToMods')
            }
          </Link>
        </div>

        {/* Seção do Título com Botão de Download */}
        <div className={`rounded-xl p-3 sm:p-4 transition-all duration-1000 ease-out ${getCardClasses()} ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Novo Layout: Ícone + Título + Coração + Download */}
          <div className="flex items-center space-x-4">
            {/* Ícone do Mod */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden">
                <img
                  src={buildThumbnailUrl(mod.thumbnail_url)}
                  alt={mod.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => setImageError(true)}
                />
              </div>
            </div>

            {/* Título à Esquerda */}
            <div className="flex-1 text-left">
              <h1 className={`text-2xl lg:text-3xl font-bold ${getTextClasses()}`}>{mod.title}</h1>
            </div>

            {/* Ícone de Favoritar */}
            <div className="flex-shrink-0">
              <button
                onClick={handleFavorite}
                disabled={favoriteLoading}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  isFavorite 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                {favoriteLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Heart 
                    className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} 
                  />
                )}
              </button>
            </div>

            {/* Botão de Download */}
            <div className="flex-shrink-0">
              {recommendedDownload && (
                <Button 
                  onClick={() => handleDownload(recommendedDownload, 'desktop')}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base h-auto transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                >
                  <Download className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  {t('modDetail.download')}
                </Button>
              )}
            </div>
          </div>
          
        </div>

        {/* Seção de Descrição (desc) */}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-200 ${getCardClasses()} ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-4">
            <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              {t('modDetail.description')}
            </h2>
            <div 
              className={`prose max-w-none leading-relaxed ${theme === 'light' ? 'prose-gray' : 'prose-invert'} ${getSubtextClasses()}`}
              style={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}
              dangerouslySetInnerHTML={{ 
                __html: processHtmlComplete(mod.full_description || mod.description || t('mods.noDescription'))
              }}
            />
            <style jsx>{`
              .prose br {
                display: block !important;
                margin: 0.5rem 0 !important;
                line-height: 1.5rem !important;
                height: 1.5rem !important;
              }
            `}</style>
          </div>
        </div>

        {/* Player de Vídeo */}
        {mod.video_url && (
          <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-250 ${getCardClasses()} ${
            pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="space-y-4">
              <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
                <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
                Vídeo do Mod
              </h2>
              <YouTubePlayer 
                videoUrl={mod.video_url} 
                title={`${mod.title} - Vídeo Demonstrativo`}
              />
            </div>
          </div>
        )}

        {/* Seção de Informações (infos) */}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-300 ${getCardClasses()} ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-6">
            <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              {t('modDetail.information')}
            </h2>

            {/* Informações Técnicas */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold flex items-center ${getTextClasses()}`}>
                <Package className="h-5 w-5 mr-2 text-primary" />
                {t('modDetail.technicalInfo')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`flex justify-between p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 ${getInfoCardClasses()}`}>
                  <span className={getSubtextClasses()}>{t('modDetail.version')}</span>
                  <span className={`font-semibold ${getTextClasses()}`}>v{mod.version}</span>
                </div>
                <div className={`flex justify-between p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 ${getInfoCardClasses()}`}>
                  <span className={getSubtextClasses()}>{t('modDetail.minecraftVersion')}</span>
                  <span className={`font-semibold ${getTextClasses()}`}>{mod.minecraft_version}</span>
                </div>
                <div className={`flex justify-between p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 ${getInfoCardClasses()}`}>
                  <span className={getSubtextClasses()}>{t('modDetail.modLoader')}</span>
                  <span className={`font-semibold ${getTextClasses()}`}>{mod.mod_loader}</span>
                </div>
                <div className={`flex justify-between p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 ${getInfoCardClasses()}`}>
                  <span className={getSubtextClasses()}>{t('modDetail.fileSize')}</span>
                  <span className={`font-semibold ${getTextClasses()}`}>{mod.file_size ? `${(mod.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Tags/Categorias */}
            {mod.tags && Array.isArray(mod.tags) && mod.tags.length > 0 && (
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold flex items-center ${getTextClasses()}`}>
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  {t('modDetail.categories')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mod.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-all duration-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Autor */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold flex items-center ${getTextClasses()}`}>
                <User className="h-5 w-5 mr-2 text-primary" />
                {t('modDetail.author')}
              </h3>
              <div className="flex items-center space-x-4 p-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                  {mod.author_avatar_url && mod.author_avatar_url.trim() !== '' ? (
                    <>
                      <img 
                        src={buildAvatarUrl(mod.author_avatar_url)} 
                        alt={mod.author_display_name || mod.author_name}
                        className="w-full h-full object-cover rounded-full select-none pointer-events-none"
                        draggable="false"
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <User className="h-6 w-6 text-primary" style={{ display: 'none' }} />
                    </>
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${getTextClasses()}`}>{mod.author_display_name || mod.author_name || t('modDetail.unknown')}</p>
                  <p className={`text-sm ${getSubtextClasses()}`}>
                    {mod.content_type === 'addons' 
                      ? t('modDetail.addonCreator') 
                      : t('modDetail.modCreator')
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Estatísticas - Versão Compacta (por último) */}
            <div className={`flex items-center justify-start space-x-6 py-2 pt-4 ${theme === 'light' ? 'border-t border-gray-200/50' : 'border-t border-gray-700/50'}`}>
              <div className={`flex items-center space-x-2 ${getSubtextClasses()}`}>
                <Download className="h-4 w-4 text-primary" />
                <span className="text-sm">{mod.download_count || 0}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getSubtextClasses()}`}>
                <Eye className="h-4 w-4 text-blue-400" />
                <span className="text-sm">{mod.view_count || 0}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getSubtextClasses()}`}>
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm">{mod.like_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Download */}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-400 ${getCardClasses()} ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-6">
            <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              {t('modDetail.download')}
            </h2>
            
            {/* Download direto */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Download className="h-12 w-12 text-primary" />
              </div>
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${getTextClasses()}`}>
                {t('modDetail.directDownload')}
              </h3>
              <p className={`mb-4 text-sm sm:text-base ${getSubtextClasses()}`}>
                {mod.content_type_id === 2 
                  ? t('modDetail.addonDownloadDescription')
                  : t('modDetail.modDownloadDescription')
                }
              </p>
              
              {recommendedDownload ? (
                <Button 
                  onClick={() => handleDownload(recommendedDownload, 'desktop')}
                  className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 text-base sm:text-lg h-auto transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 w-full sm:w-auto"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {t('modDetail.downloadNow')}
                </Button>
              ) : (
                <div className="text-red-400 text-sm sm:text-base">
                  {t('modDetail.downloadNotAvailable')}
                </div>
              )}
            </div>

            {/* Instruções de instalação */}
            <div className={`pt-6 ${theme === 'light' ? 'border-t border-gray-200' : 'border-t border-gray-700'}`}>
              <h4 className={`text-base sm:text-lg font-semibold mb-4 ${getTextClasses()}`}>{t('modDetail.installationInstructions')}</h4>
              <div className={`rounded-lg p-3 sm:p-4 space-y-3 text-xs sm:text-sm ${theme === 'light' ? 'bg-gray-50/80' : 'bg-gray-900/50'}`}>
                <p className={getSubtextClasses()}>
                  <strong>1.</strong> {mod.content_type_id === 2 
                    ? t('modDetail.addonStep1') 
                    : t('modDetail.modStep1')
                  }
                </p>
                <p className={getSubtextClasses()}>
                  <strong>2.</strong> {mod.content_type_id === 2 
                    ? t('modDetail.addonStep2') 
                    : t('modDetail.modStep2')
                  }
                </p>
                <p className={getSubtextClasses()}>
                  <strong>3.</strong> {mod.content_type_id === 2 
                    ? t('modDetail.addonStep3') 
                    : t('modDetail.modStep3', { loader: mod.mod_loader })
                  }
                </p>
                <p className={getSubtextClasses()}>
                  <strong>4.</strong> {t('modDetail.step4')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Comentários (comments) */}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-500 ${getCardClasses()} ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-6">
            <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              {t('modDetail.comments')}
            </h2>

            {/* Input de Comentário */}
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="relative">
                  <Textarea
                    id="commentText"
                    placeholder={t('modDetail.shareOpinion')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className={`w-full border rounded-xl p-3 sm:p-4 pr-16 sm:pr-20 resize-none transition-all duration-300 hover:border-gray-600 text-sm sm:text-base ${getInputClasses()}`}
                    rows={3}
                  />
                  
                  {/* Botão de enviar integrado */}
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmittingComment || commentCooldown > 0}
                    className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 p-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                    title={commentCooldown > 0 ? `Aguarde ${formatCooldownTime(commentCooldown)} antes de comentar novamente` : "Enviar comentário"}
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : commentCooldown > 0 ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                  
                  {/* Indicador de caracteres */}
                  <div className="absolute bottom-2 left-3 text-xs text-gray-500">
                    {newComment.length}/500
                  </div>
                  
                  {/* Indicador de cooldown */}
                  {commentCooldown > 0 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-xs text-red-400">
                      ⏰ {formatCooldownTime(commentCooldown)}
                    </div>
                  )}
                </div>
                
                {/* Dicas de uso */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{t('modDetail.beRespectful')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">💬</span>
                    <span>{t('modDetail.shareExperience')}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Mensagem para usuários não logados */
              <div className="text-center py-8 bg-gradient-to-r from-gray-900/40 to-gray-800/40 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${getTextClasses()}`}>{t('modDetail.loginToComment')}</h3>
                <p className={`mb-4 text-sm ${getSubtextClasses()}`}>{t('modDetail.loginToShareOpinion')}</p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 hover:scale-105 transition-all duration-300"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('modDetail.login')}
                </Button>
              </div>
            )}

            {/* Lista de comentários */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-medium">
                  {comments?.length || 0} {t('modDetail.commentsCount')}
                </span>
              </div>

              {loadingComments ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-900/50 rounded-lg p-4 animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className={`rounded-lg p-4 relative ${getCommentCardClasses()}`}>
                    {/* Botões de ação no canto superior direito */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      {/* Botão de resposta (apenas super admins) */}
                      {currentUser?.role === 'super_admin' && (
                        <button
                          onClick={() => handleReplyClick(comment)}
                          className="flex items-center justify-center w-6 h-6 bg-primary hover:bg-primary/80 text-white rounded transition-colors duration-200"
                          title="Responder comentário"
                        >
                          <Reply className="h-3 w-3" />
                        </button>
                      )}
                      
                      {/* Botão de excluir */}
                      {isAuthenticated && (currentUser?.id === comment.user_id || currentUser?.role === 'super_admin') && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                          title="Excluir comentário"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 relative">
                        {/* Avatar com imagem */}
                        {comment.avatar_url && (
                          <img
                            src={getAvatarUrl(comment.avatar_url)}
                            alt={`Avatar de ${comment.display_name || comment.username}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-700/50 shadow-lg select-none pointer-events-none"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                            onError={(e) => {
                              // Se a imagem falhar, esconder e mostrar o fallback
                              e.target.style.display = 'none';
                              const fallback = e.target.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        )}
                        
                        {/* Avatar fallback com inicial */}
                        <div 
                          className={`w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg ${
                            comment.avatar_url ? 'hidden' : 'flex'
                          }`}
                        >
                          <span className={`font-semibold text-sm ${getTextClasses()}`}>
                            {(comment.display_name || comment.username)?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-sm font-semibold ${getTextClasses()}`}>
                            {comment.display_name || comment.username || 'Usuário'}
                          </span>
                          <span className={`text-xs ${getSubtextClasses()}`}>
                            {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed break-words overflow-wrap-anywhere ${getSubtextClasses()}`}>
                          {comment.content}
                        </p>

                        {/* Sistema de votos */}
                        <div className="flex items-center space-x-4 mt-3">
                          {/* Upvote */}
                          <button
                            onClick={() => handleVoteComment(comment.id, 'upvote')}
                            className={`group flex items-center space-x-1 text-xs transition-colors duration-200 ${
                              comment.user_vote === 'upvote' 
                                ? 'text-green-400' 
                                : 'text-gray-400'
                            }`}
                            title="Votar positivamente"
                          >
                            <i className={`fa-solid fa-caret-up text-lg transition-colors duration-200 ${
                              comment.user_vote === 'upvote' 
                                ? 'text-green-400' 
                                : 'text-gray-400 group-hover:text-green-400'
                            }`}></i>
                            <span className={`font-medium transition-colors duration-200 ${
                              comment.user_vote === 'upvote' 
                                ? 'text-green-400' 
                                : 'text-gray-400 group-hover:text-green-400'
                            }`}>{comment.like_count || 0}</span>
                          </button>

                          {/* Downvote */}
                          <button
                            onClick={() => handleVoteComment(comment.id, 'downvote')}
                            className={`group flex items-center space-x-1 text-xs transition-colors duration-200 ${
                              comment.user_vote === 'downvote' 
                                ? 'text-red-400' 
                                : 'text-gray-400'
                            }`}
                            title="Votar negativamente"
                          >
                            <i className={`fa-solid fa-caret-down text-lg transition-colors duration-200 ${
                              comment.user_vote === 'downvote' 
                                ? 'text-red-400' 
                                : ' group-hover:text-red-400'
                            }`}></i>
                            <span className={`font-medium transition-colors duration-200 ${
                              comment.user_vote === 'downvote' 
                                ? 'text-red-400' 
                                :  'group-hover:text-red-400'
                            }`}>{comment.dislike_count || 0}</span>
                          </button>


                        </div>
                      </div>
                    </div>
                    
                    {/* Campo de resposta inline */}
                    {replyingToComment?.id === comment.id && (
                      <div className={`mt-4 p-4 rounded-lg border border-primary/30 ${
                        theme === 'light' 
                          ? 'bg-gray-50/80' 
                          : 'bg-gray-800/50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                            <Reply className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-primary mb-3">
                              Respondendo a <span className="font-medium">{comment.display_name || comment.username}</span>
                            </p>
                            <form onSubmit={handleReplySubmit} className="space-y-3">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Digite sua resposta oficial aqui..."
                                className={`w-full h-20 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${getInputClasses()}`}
                                required
                                disabled={isSubmittingReply}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={cancelReply}
                                  className={`px-4 py-2 text-sm transition-colors ${
                                    theme === 'light' 
                                      ? 'text-gray-600 hover:text-gray-800' 
                                      : 'text-gray-400 hover:text-white'
                                  }`}
                                  disabled={isSubmittingReply}
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={isSubmittingReply || !replyContent.trim()}
                                >
                                  {isSubmittingReply ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}
                                  <span>{isSubmittingReply ? 'Enviando...' : 'Enviar'}</span>
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Exibir respostas do comentário */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="ml-8 p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary rounded-r-lg">

                            {/* Header da resposta */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex-shrink-0 relative">
                                  {/* Avatar com imagem */}
                                  {reply.avatar_url && (
                                    <img
                                      src={getAvatarUrl(reply.avatar_url)}
                                      alt={`Avatar de ${reply.display_name || reply.username}`}
                                      className="w-6 h-6 rounded-full object-cover border border-primary/30 shadow-sm select-none pointer-events-none"
                                      draggable="false"
                                      onContextMenu={(e) => e.preventDefault()}
                                      onDragStart={(e) => e.preventDefault()}
                                      onError={(e) => {
                                        // Se a imagem falhar, esconder e mostrar o fallback
                                        e.target.style.display = 'none';
                                        const fallback = e.target.nextElementSibling;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                  )}
                                  
                                  {/* Avatar fallback com inicial */}
                                  <div 
                                    className={`w-6 h-6 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-sm ${
                                      reply.avatar_url ? 'hidden' : 'flex'
                                    }`}
                                  >
                                    <span className={`font-semibold text-xs ${getTextClasses()}`}>
                                      {(reply.display_name || reply.username)?.charAt(0).toUpperCase() || 'A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-primary">
                                    {reply.display_name || reply.username}
                                  </span>
                                  <Shield className="w-4 h-4 text-primary" />
                                </div>
                              </div>

                              {/* Botão de deletar resposta */}
                              {isAuthenticated && (currentUser?.id === reply.user_id || currentUser?.role === 'super_admin') && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors"
                                  title="Excluir resposta"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Conteúdo da resposta */}
                            <div className={`text-sm leading-relaxed ${getSubtextClasses()}`}>
                              {reply.content}
                            </div>

                            {/* Badge de resposta oficial e horário */}
                            <div className="mt-2 flex justify-between items-center">
                              <span className={`text-xs ${getSubtextClasses()}`}>
                                {new Date(reply.created_at).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                                <Reply className="w-3 h-3 mr-1" />
                                {t('modDetail.officialReply')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className={`text-lg ${getSubtextClasses()}`}>Nenhum comentário ainda</p>
                  <p className={`text-sm ${getSubtextClasses()}`}>Seja o primeiro a comentar sobre este mod!</p>
                </div>
              )}
            </div>
          </div>
        </div>
            </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && commentToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl ${
            theme === 'light' 
              ? 'bg-white border-2 border-red-500/30 shadow-red-500/20' 
              : 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-red-500/30 shadow-red-500/20'
          }`}>
            {/* Header com ícone de alerta */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${getTextClasses()}`}>Exclusão de Comentário</h3>
                  <p className="text-sm text-red-500">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <button
                onClick={cancelDeleteComment}
                className={`transition-colors p-2 rounded-lg ${
                  theme === 'light' 
                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">

              {/* Preview do comentário */}
              <div className={`rounded-lg p-5 ${
                theme === 'light' 
                  ? 'bg-gray-50 border border-gray-200' 
                  : 'bg-gray-800/50 border border-gray-600/50'
              }`}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0 relative">
                    {commentToDelete.avatar_url ? (
                      <img
                        src={getAvatarUrl(commentToDelete.avatar_url)}
                        alt={`Avatar de ${commentToDelete.display_name || commentToDelete.username}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-500"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {(commentToDelete.display_name || commentToDelete.username)?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-lg ${getTextClasses()}`}>
                      {commentToDelete.display_name || commentToDelete.username || 'Usuário'}
                    </p>
                    <p className={`text-sm flex items-center ${getSubtextClasses()}`}>
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(commentToDelete.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className={`rounded-lg p-4 border-l-4 ${
                  theme === 'light' 
                    ? 'bg-gray-100 border-gray-300' 
                    : 'bg-gray-700/30 border-gray-500'
                }`}>
                  <p className={`leading-relaxed break-words overflow-wrap-anywhere ${getSubtextClasses()}`}>
                    "{commentToDelete.content}"
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={cancelDeleteComment}
                  className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                    theme === 'light' 
                      ? 'text-gray-600 hover:text-gray-800 border-2 border-gray-300 hover:bg-gray-100' 
                      : 'text-gray-300 hover:text-white border-2 border-gray-600 hover:bg-gray-700/50'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={confirmDeleteComment}
                  className="flex-1 px-6 py-3 text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transform hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resposta - REMOVIDO */}
      {false && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-primary/30 rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl shadow-primary/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/50">
                  <Reply className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Responder Comentário</h3>
                  <p className="text-sm text-primary">{t('modDetail.officialAdminReply')}</p>
                </div>
              </div>
              <button
                onClick={cancelReply}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Comentário original */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-300">
                    {commentToReply?.display_name || commentToReply?.username}
                  </span>
                  <p className="text-xs text-gray-400">
                    {commentToReply?.created_at && new Date(commentToReply.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-200 italic">
                "{commentToReply?.content}"
              </p>
            </div>

            {/* Formulário de resposta */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const content = formData.get('replyContent');
              if (content?.trim()) {
                handleReplySubmit(content.trim());
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t('modDetail.yourReply')}
                </label>
                <textarea
                  name="replyContent"
                  placeholder="Digite sua resposta oficial aqui..."
                  className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                  disabled={isSubmittingReply}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Esta resposta será marcada como oficial e aparecerá destacada.
                </p>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={cancelReply}
                  className="px-6 py-3 text-sm font-medium text-gray-300 hover:text-white border-2 border-gray-600 rounded-lg hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-2"
                  disabled={isSubmittingReply}
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isSubmittingReply}
                >
                  {isSubmittingReply ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmittingReply ? t('modDetail.sending') : t('modDetail.sendReply')}</span>
                </button>
              </div>
            </form>

            {/* Aviso de permissão */}
            <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <p className="text-xs text-primary">
                  Apenas super administradores podem responder comentários. Sua resposta será marcada como oficial.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModDetailPage;
