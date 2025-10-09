import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextMods';
import { useThemeMods } from '../../contexts/ThemeContextMods';
import { useTranslation } from '../../hooks/useTranslation';
import { buildThumbnailUrl, buildAvatarUrl } from '../../utils/urls';
import { buildVideoUrl } from '../../utils/urls';
import VideoPlayer from '../../components/VideoPlayer';
import { processHtmlComplete } from '../../utils/htmlProcessor';
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [commentCooldown, setCommentCooldown] = useState(0);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const viewRegisteredRef = useRef(false);
  useEffect(() => {
    if (slug) {
      fetchModBySlug(slug);
    }
  }, [slug, currentUser]);
  useEffect(() => {
    if (mod && !loading) {
      const sessionKey = `mod_viewed_${mod.id}`;
      const alreadyViewed = sessionStorage.getItem(sessionKey);
      if (!alreadyViewed && !viewRegisteredRef.current) {
        viewRegisteredRef.current = true;
        sessionStorage.setItem(sessionKey, 'true');
        registerView(mod.id);
      }
    }
  }, [mod, loading]);
  useEffect(() => {
    if (mod && !loading) {
      fetchComments();
    }
  }, [mod, loading]);
  useEffect(() => {
    if (mod && !loading && isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [mod, loading, isAuthenticated]);
  useEffect(() => {
    if (!loading && mod) {
      const timer = setTimeout(() => setPageLoaded(true), 100);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [loading, mod]);
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
      toast.error(`${t(__STRING_PLACEHOLDER_43__)} ${platform === __STRING_PLACEHOLDER_44__ ? __STRING_PLACEHOLDER_45__ : __STRING_PLACEHOLDER_46__}`);
      return;
    }
    navigate(`/mods/${mod.slug}/download`);
  };
  const registerView = async (modId) => {
    try {
      const response = await fetch(`/api/mods/${mod.id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
    }
  };
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
    }
  };
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
        if (errorData.cooldown) {
          toast.error(errorData.message, {
            duration: 8000,
            icon: '⏰'
          });
          let cooldownSeconds = 0;
          const daysMatch = errorData.message.match(/(\d+)\s*dia\(s\)/);
          if (daysMatch) {
            cooldownSeconds = parseInt(daysMatch[1]) * 24 * 60 * 60;
          } else {
            const hoursMatch = errorData.message.match(/(\d+)\s*hora\(s\)/);
            if (hoursMatch) {
              cooldownSeconds = parseInt(hoursMatch[1]) * 60 * 60;
            } else {
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
    let comment = comments.find(c => c.id === commentId);
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
        const isReply = commentToDelete.is_reply || commentToDelete.parent_id;
        if (isReply) {
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
  const formatCooldownTime = (seconds) => {
    if (seconds >= 86400) {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      if (days > 0) {
        return `${days}d ${hours}h`;
      }
      return `${hours}h`;
    } else if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    }
  };
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
        await fetchComments();
        if (data.data && data.data.action === 'added') {
          toast.success(`Voto ${voteType === __STRING_PLACEHOLDER_131__ ? __STRING_PLACEHOLDER_132__ : __STRING_PLACEHOLDER_133__} registrado!`);
        } else if (data.data && data.data.action === 'removed') {
          toast.success('Voto removido!');
        } else if (data.data && data.data.action === 'changed') {
          toast.success(`Voto alterado para ${voteType === __STRING_PLACEHOLDER_137__ ? __STRING_PLACEHOLDER_138__ : __STRING_PLACEHOLDER_139__}!`);
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
  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    if (window.location.origin.includes('localhost:5173')) {
      return `${import.meta.env.VITE_API_URL?.replace(__STRING_PLACEHOLDER_145__, __STRING_PLACEHOLDER_146__) || __STRING_PLACEHOLDER_147__}${avatarUrl}`;
    }
    return `${window.location.origin}${avatarUrl}`;
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-background fixed inset-0 overflow-y-auto pt-32">
        <div className="flex w-full h-full">
          <div className="flex-1 px-4">
            <div className={`max-w-4xl mx-auto space-y-6 rounded-xl p-6 ${getCardClasses()}`}>
              {}
              <div className="space-y-4 animate-pulse">
                <Skeleton className="h-8 w-48 bg-gradient-to-r from-gray-700 to-gray-600" />
                <Skeleton className="h-12 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-gray-700 to-gray-600" />
              </div>
              {}
              <Skeleton className="h-80 w-full rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse" />
              {}
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
              {}
              <div className="space-y-4 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm animate-pulse">
                <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-gray-700 to-gray-600" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-16 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-16 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-16 w-full bg-gradient-to-r from-gray-700 to-gray-600" />
                </div>
              </div>
              {}
              <div className="space-y-4 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm animate-pulse">
                <Skeleton className="h-6 w-1/2 bg-gradient-to-r from-gray-700 to-gray-600" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-6 w-20 bg-gradient-to-r from-gray-700 to-gray-600" />
                  <Skeleton className="h-6 w-14 bg-gradient-to-r from-gray-700 to-gray-600" />
                </div>
              </div>
              {}
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
  if (error || !mod) {
    return (
      <div className="min-h-screen bg-background fixed inset-0 overflow-y-auto pt-32">
        <div className="flex w-full h-full items-center justify-center">
          <div className="text-center space-y-8 max-w-4xl">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
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
      <GoogleAdsenseMeta />
      <div className="w-full px-4 py-6">
        <AdSpace
          page="mod-detail"
          position="top-banner"
          fallbackText="Nenhum anúncio configurado"
        />
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 py-4 sm:py-6">
        <div className={`transition-all duration-700 ease-out ${
          pageLoaded ? __STRING_PLACEHOLDER_150__ : __STRING_PLACEHOLDER_151__
        }`}>
          <Link to={mod?.content_type_id === 2 ? "/addons" : "/mods"} className={`inline-flex items-center text-sm hover:text-primary transition-colors ${getSubtextClasses()}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {mod?.content_type_id === 2
              ? t('modDetail.backToAddons')
              : t('modDetail.backToMods')
            }
          </Link>
        </div>
        <div className={`rounded-xl p-4 sm:p-6 md:p-8 transition-all duration-1000 ease-out relative ${getCardClasses()} ${
          pageLoaded ? __STRING_PLACEHOLDER_154__ : __STRING_PLACEHOLDER_155__
        }`}>
          <div className="flex flex-col items-center text-center space-y-4 sm:hidden">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl overflow-hidden shadow-2xl ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-300 hover:scale-105">
                <img
                  src={buildThumbnailUrl(mod.thumbnail_url)}
                  alt={mod.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
            </div>
            <div className="space-y-2">
              <h1 className={`text-3xl font-bold ${getTextClasses()} break-words leading-tight`}>
                {mod.title}
              </h1>
            </div>
            {recommendedDownload && (
              <div className="pt-2">
                <Button
                  onClick={() => handleDownload(recommendedDownload, 'desktop')}
                  className="bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white px-8 py-4 text-lg h-auto transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 rounded-xl font-semibold"
                >
                  <Download className="h-6 w-6 mr-3" />
                  {t('modDetail.download')}
                </Button>
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center justify-between space-x-6">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden shadow-2xl ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-300 hover:scale-105">
                  <img
                    src={buildThumbnailUrl(mod.thumbnail_url)}
                    alt={mod.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
              </div>
              <div>
                <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold ${getTextClasses()} break-words leading-tight`}>
                  {mod.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={handleFavorite}
                disabled={favoriteLoading}
                className={`p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm ${
                  isFavorite
                    ? __STRING_PLACEHOLDER_158__
                    : __STRING_PLACEHOLDER_159__
                }`}
              >
                {favoriteLoading ? (
                  <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                ) : (
                  <Heart
                    className={`h-5 w-5 md:h-6 md:w-6 ${isFavorite ? __STRING_PLACEHOLDER_160__ : __STRING_PLACEHOLDER_161__}`}
                  />
                )}
              </button>
              {recommendedDownload && (
                <Button
                  onClick={() => handleDownload(recommendedDownload, 'desktop')}
                  className="bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white px-4 md:px-6 py-2 md:py-3 text-sm md:text-base h-auto transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 rounded-lg font-semibold"
                >
                  <Download className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                  {t('modDetail.download')}
                </Button>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4 z-10 sm:hidden">
            <button
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm ${
                isFavorite
                  ? __STRING_PLACEHOLDER_164__
                  : __STRING_PLACEHOLDER_165__
              }`}
            >
              {favoriteLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Heart
                  className={`h-6 w-6 ${isFavorite ? __STRING_PLACEHOLDER_166__ : __STRING_PLACEHOLDER_167__}`}
                />
              )}
            </button>
          </div>
        </div>
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-200 ${getCardClasses()} ${
          pageLoaded ? __STRING_PLACEHOLDER_168__ : __STRING_PLACEHOLDER_169__
        }`}>
          <div className="space-y-4">
            <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              {t('modDetail.description')}
            </h2>
            <div
              className={`prose max-w-none leading-relaxed ${theme === __STRING_PLACEHOLDER_171__ ? __STRING_PLACEHOLDER_172__ : __STRING_PLACEHOLDER_173__} ${getSubtextClasses()}`}
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
        {}
        {mod.video_url && (
          <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-250 ${getCardClasses()} ${
            pageLoaded ? __STRING_PLACEHOLDER_177__ : __STRING_PLACEHOLDER_178__
          }`}>
            <div className="space-y-4">
              <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
                <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
                Vídeo
              </h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                {(() => {
                  const raw = mod.video_url || '';
                  const src = buildVideoUrl(raw);
                  const ext = (raw.split('.').pop() || '').toLowerCase();
                  const type = ext === 'mp4' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : ext === 'ogg' ? 'video/ogg' : undefined;
                  return <VideoPlayer src={src} type={type} />;
                })()}
              </div>
            </div>
          </div>
        )}
        {}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-300 ${getCardClasses()} ${
          pageLoaded ? __STRING_PLACEHOLDER_188__ : __STRING_PLACEHOLDER_189__
        }`}>
          <div className="space-y-6">
            <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              {t('modDetail.information')}
            </h2>
            {}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold flex items-center ${getTextClasses()}`}>
                <Package className="h-5 w-5 mr-2 text-primary" />
                {t('modDetail.technicalInfo')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3">
                <div className={`flex flex-col sm:flex-row sm:justify-between p-3 sm:p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${getInfoCardClasses()}`}>
                  <span className={`text-sm sm:text-base ${getSubtextClasses()} mb-1 sm:mb-0`}>{t('modDetail.version')}</span>
                  <span className={`font-semibold text-sm sm:text-base ${getTextClasses()}`}>v{mod.version}</span>
                </div>
                <div className={`flex flex-col sm:flex-row sm:justify-between p-3 sm:p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${getInfoCardClasses()}`}>
                  <span className={`text-sm sm:text-base ${getSubtextClasses()} mb-1 sm:mb-0`}>{t('modDetail.minecraftVersion')}</span>
                  <span className={`font-semibold text-sm sm:text-base ${getTextClasses()}`}>{mod.minecraft_version}</span>
                </div>
                <div className={`flex flex-col sm:flex-row sm:justify-between p-3 sm:p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${getInfoCardClasses()}`}>
                  <span className={`text-sm sm:text-base ${getSubtextClasses()} mb-1 sm:mb-0`}>{t('modDetail.modLoader')}</span>
                  <span className={`font-semibold text-sm sm:text-base ${getTextClasses()}`}>{mod.mod_loader}</span>
                </div>
                <div className={`flex flex-col sm:flex-row sm:justify-between p-3 sm:p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${getInfoCardClasses()}`}>
                  <span className={`text-sm sm:text-base ${getSubtextClasses()} mb-1 sm:mb-0`}>{t('modDetail.fileSize')}</span>
                  <span className={`font-semibold text-sm sm:text-base ${getTextClasses()}`}>{mod.file_size ? `${(mod.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</span>
                </div>
              </div>
            </div>
            {}
            {mod.tags && Array.isArray(mod.tags) && mod.tags.length > 0 && (
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold flex items-center ${getTextClasses()}`}>
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  {t('modDetail.categories')}
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {mod.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-all duration-300 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold flex items-center ${getTextClasses()}`}>
                <User className="h-5 w-5 mr-2 text-primary" />
                {t('modDetail.author')}
              </h3>
              <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
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
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" style={{ display: 'none' }} />
                    </>
                  ) : (
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-sm sm:text-base ${getTextClasses()} truncate`}>{mod.author_display_name || mod.author_name || t('modDetail.unknown')}</p>
                  <p className={`text-xs sm:text-sm ${getSubtextClasses()}`}>
                    {mod.content_type === 'addons'
                      ? t('modDetail.addonCreator')
                      : t('modDetail.modCreator')
                    }
                  </p>
                </div>
              </div>
            </div>
            {}
            <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 py-3 pt-4 ${theme === __STRING_PLACEHOLDER_207__ ? __STRING_PLACEHOLDER_208__ : __STRING_PLACEHOLDER_209__}`}>
              <div className={`flex items-center space-x-2 ${getSubtextClasses()}`}>
                <Download className="h-4 w-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">{mod.download_count || 0}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getSubtextClasses()}`}>
                <Eye className="h-4 w-4 text-blue-400" />
                <span className="text-xs sm:text-sm font-medium">{mod.view_count || 0}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getSubtextClasses()}`}>
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-xs sm:text-sm font-medium">{mod.like_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-400 ${getCardClasses()} ${
          pageLoaded ? __STRING_PLACEHOLDER_210__ : __STRING_PLACEHOLDER_211__
        }`}>
          <div className="space-y-4 sm:space-y-6">
            <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              {t('modDetail.download')}
            </h2>
            {}
            <div className="text-center">
              <div className="flex justify-center mb-3 sm:mb-4">
                <Download className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 sm:mb-3 ${getTextClasses()}`}>
                {t('modDetail.directDownload')}
              </h3>
              <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${getSubtextClasses()} max-w-2xl mx-auto`}>
                {mod.content_type_id === 2
                  ? t('modDetail.addonDownloadDescription')
                  : t('modDetail.modDownloadDescription')
                }
              </p>
              {recommendedDownload ? (
                <Button
                  onClick={() => handleDownload(recommendedDownload, 'desktop')}
                  className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg h-auto transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 w-full sm:w-auto max-w-xs sm:max-w-none"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('modDetail.downloadNow')}
                </Button>
              ) : (
                <div className="text-red-400 text-sm sm:text-base">
                  {t('modDetail.downloadNotAvailable')}
                </div>
              )}
            </div>
            {}
            <div className={`pt-4 sm:pt-6 ${theme === __STRING_PLACEHOLDER_219__ ? __STRING_PLACEHOLDER_220__ : __STRING_PLACEHOLDER_221__}`}>
              <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${getTextClasses()}`}>{t('modDetail.installationInstructions')}</h4>
              <div className={`rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 text-xs sm:text-sm ${theme === __STRING_PLACEHOLDER_223__ ? __STRING_PLACEHOLDER_224__ : __STRING_PLACEHOLDER_225__}`}>
                <p className={`${getSubtextClasses()} leading-relaxed`}>
                  <strong>1.</strong> {mod.content_type_id === 2
                    ? t('modDetail.addonStep1')
                    : t('modDetail.modStep1')
                  }
                </p>
                <p className={`${getSubtextClasses()} leading-relaxed`}>
                  <strong>2.</strong> {mod.content_type_id === 2
                    ? t('modDetail.addonStep2')
                    : t('modDetail.modStep2')
                  }
                </p>
                <p className={`${getSubtextClasses()} leading-relaxed`}>
                  <strong>3.</strong> {mod.content_type_id === 2
                    ? t('modDetail.addonStep3')
                    : t('modDetail.modStep3', { loader: mod.mod_loader })
                  }
                </p>
                <p className={`${getSubtextClasses()} leading-relaxed`}>
                  <strong>4.</strong> {t('modDetail.step4')}
                </p>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-1000 ease-out delay-500 ${getCardClasses()} ${
          pageLoaded ? __STRING_PLACEHOLDER_233__ : __STRING_PLACEHOLDER_234__
        }`}>
          <div className="space-y-6">
            <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${getTextClasses()}`}>
              <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              {t('modDetail.comments')}
            </h2>
            {}
            {isAuthenticated ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <Textarea
                    id="commentText"
                    placeholder={t('modDetail.shareOpinion')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className={`w-full border rounded-xl p-3 sm:p-4 pr-14 sm:pr-16 md:pr-20 resize-none transition-all duration-300 hover:border-gray-600 text-sm sm:text-base ${getInputClasses()}`}
                    rows={3}
                  />
                  {}
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmittingComment || commentCooldown > 0}
                    className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                    title={commentCooldown > 0 ? `Aguarde ${formatCooldownTime(commentCooldown)} antes de comentar novamente` : "Enviar comentário"}
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : commentCooldown > 0 ? (
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                  {}
                  <div className="absolute bottom-2 left-3 text-xs text-gray-500">
                    {newComment.length}/500
                  </div>
                  {}
                  {commentCooldown > 0 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-xs text-red-400">
                      ⏰ {formatCooldownTime(commentCooldown)}
                    </div>
                  )}
                </div>
                {}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
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
              <div className="text-center py-6 sm:py-8 bg-gradient-to-r from-gray-900/40 to-gray-800/40 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className={`text-base sm:text-lg font-semibold mb-2 ${getTextClasses()}`}>{t('modDetail.loginToComment')}</h3>
                <p className={`mb-4 text-xs sm:text-sm ${getSubtextClasses()}`}>{t('modDetail.loginToShareOpinion')}</p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 hover:scale-105 transition-all duration-300 text-sm sm:text-base px-4 py-2"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('modDetail.login')}
                </Button>
              </div>
            )}
            {}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
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
                  <div key={comment.id} className={`rounded-lg p-3 sm:p-4 relative ${getCommentCardClasses()}`}>
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      {currentUser?.role === 'super_admin' && (
                        <button
                          onClick={() => handleReplyClick(comment)}
                          className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-primary hover:bg-primary/80 text-white rounded transition-colors duration-200"
                          title="Responder comentário"
                        >
                          <Reply className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                      )}
                      {isAuthenticated && (currentUser?.id === comment.user_id || currentUser?.role === 'super_admin') && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                          title="Excluir comentário"
                        >
                          <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0 relative">
                        {comment.avatar_url && (
                          <img
                            src={getAvatarUrl(comment.avatar_url)}
                            alt={`Avatar de ${comment.display_name || comment.username}`}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-700/50 shadow-lg select-none pointer-events-none"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        )}
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg ${
                            comment.avatar_url ? __STRING_PLACEHOLDER_248__ : __STRING_PLACEHOLDER_249__
                          }`}
                        >
                          <span className={`font-semibold text-xs sm:text-sm ${getTextClasses()}`}>
                            {(comment.display_name || comment.username)?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                          <span className={`text-xs sm:text-sm font-semibold ${getTextClasses()}`}>
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
                        <p className={`text-xs sm:text-sm leading-relaxed break-words overflow-wrap-anywhere ${getSubtextClasses()}`}>
                          {comment.content}
                        </p>
                        {}
                        <div className="flex items-center space-x-3 sm:space-x-4 mt-2 sm:mt-3">
                          {}
                          <button
                            onClick={() => handleVoteComment(comment.id, 'upvote')}
                            className={`group flex items-center space-x-1 text-xs transition-colors duration-200 ${
                              comment.user_vote === __STRING_PLACEHOLDER_259__
                                ? __STRING_PLACEHOLDER_260__
                                : __STRING_PLACEHOLDER_261__
                            }`}
                            title="Votar positivamente"
                          >
                            <i className={`fa-solid fa-caret-up text-sm sm:text-lg transition-colors duration-200 ${
                              comment.user_vote === __STRING_PLACEHOLDER_262__
                                ? __STRING_PLACEHOLDER_263__
                                : __STRING_PLACEHOLDER_264__
                            }`}></i>
                            <span className={`font-medium transition-colors duration-200 ${
                              comment.user_vote === __STRING_PLACEHOLDER_265__
                                ? __STRING_PLACEHOLDER_266__
                                : __STRING_PLACEHOLDER_267__
                            }`}>{comment.like_count || 0}</span>
                          </button>
                          {}
                          <button
                            onClick={() => handleVoteComment(comment.id, 'downvote')}
                            className={`group flex items-center space-x-1 text-xs transition-colors duration-200 ${
                              comment.user_vote === __STRING_PLACEHOLDER_269__
                                ? __STRING_PLACEHOLDER_270__
                                : __STRING_PLACEHOLDER_271__
                            }`}
                            title="Votar negativamente"
                          >
                            <i className={`fa-solid fa-caret-down text-sm sm:text-lg transition-colors duration-200 ${
                              comment.user_vote === __STRING_PLACEHOLDER_272__
                                ? __STRING_PLACEHOLDER_273__
                                : __STRING_PLACEHOLDER_274__
                            }`}></i>
                            <span className={`font-medium transition-colors duration-200 ${
                              comment.user_vote === __STRING_PLACEHOLDER_275__
                                ? __STRING_PLACEHOLDER_276__
                                :  __STRING_PLACEHOLDER_277__
                            }`}>{comment.dislike_count || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    {}
                    {replyingToComment?.id === comment.id && (
                      <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border border-primary/30 ${
                        theme === __STRING_PLACEHOLDER_278__
                          ? __STRING_PLACEHOLDER_279__
                          : __STRING_PLACEHOLDER_280__
                      }`}>
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 flex-shrink-0">
                            <Reply className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-primary mb-2 sm:mb-3">
                              Respondendo a <span className="font-medium">{comment.display_name || comment.username}</span>
                            </p>
                            <form onSubmit={handleReplySubmit} className="space-y-2 sm:space-y-3">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Digite sua resposta oficial aqui..."
                                className={`w-full h-16 sm:h-20 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-xs sm:text-sm ${getInputClasses()}`}
                                required
                                disabled={isSubmittingReply}
                              />
                              <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={cancelReply}
                                  className={`px-3 py-2 text-xs sm:text-sm transition-colors ${
                                    theme === __STRING_PLACEHOLDER_281__
                                      ? __STRING_PLACEHOLDER_282__
                                      : __STRING_PLACEHOLDER_283__
                                  }`}
                                  disabled={isSubmittingReply}
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-2 text-xs sm:text-sm font-medium bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={isSubmittingReply || !replyContent.trim()}
                                >
                                  {isSubmittingReply ? (
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                                  )}
                                  <span>{isSubmittingReply ? 'Enviando...' : 'Enviar'}</span>
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                    {}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="ml-4 sm:ml-6 md:ml-8 p-2 sm:p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary rounded-r-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <div className="flex-shrink-0 relative">
                                  {reply.avatar_url && (
                                    <img
                                      src={getAvatarUrl(reply.avatar_url)}
                                      alt={`Avatar de ${reply.display_name || reply.username}`}
                                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-primary/30 shadow-sm select-none pointer-events-none"
                                      draggable="false"
                                      onContextMenu={(e) => e.preventDefault()}
                                      onDragStart={(e) => e.preventDefault()}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        const fallback = e.target.nextElementSibling;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                  )}
                                  <div
                                    className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-sm ${
                                      reply.avatar_url ? __STRING_PLACEHOLDER_288__ : __STRING_PLACEHOLDER_289__
                                    }`}
                                  >
                                    <span className={`font-semibold text-xs ${getTextClasses()}`}>
                                      {(reply.display_name || reply.username)?.charAt(0).toUpperCase() || 'A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                  <span className="text-xs sm:text-sm font-medium text-primary truncate">
                                    {reply.display_name || reply.username}
                                  </span>
                                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                </div>
                              </div>
                              {isAuthenticated && (currentUser?.id === reply.user_id || currentUser?.role === 'super_admin') && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors flex-shrink-0"
                                  title="Excluir resposta"
                                >
                                  <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                              )}
                            </div>
                            <div className={`text-xs sm:text-sm leading-relaxed ${getSubtextClasses()}`}>
                              {reply.content}
                            </div>
                            <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
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
                                <Reply className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
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
                <div className="text-center py-6 sm:py-8">
                  <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
                  <p className={`text-base sm:text-lg ${getSubtextClasses()}`}>Nenhum comentário ainda</p>
                  <p className={`text-xs sm:text-sm ${getSubtextClasses()}`}>Seja o primeiro a comentar sobre este mod!</p>
                </div>
              )}
            </div>
          </div>
        </div>
            </div>
      {showDeleteModal && commentToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl ${
            theme === __STRING_PLACEHOLDER_299__
              ? __STRING_PLACEHOLDER_300__
              : __STRING_PLACEHOLDER_301__
          }`}>
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
                  theme === __STRING_PLACEHOLDER_302__
                    ? __STRING_PLACEHOLDER_303__
                    : __STRING_PLACEHOLDER_304__
                }`}
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <div className={`rounded-lg p-5 ${
                theme === __STRING_PLACEHOLDER_305__
                  ? __STRING_PLACEHOLDER_306__
                  : __STRING_PLACEHOLDER_307__
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
                  theme === __STRING_PLACEHOLDER_316__
                    ? __STRING_PLACEHOLDER_317__
                    : __STRING_PLACEHOLDER_318__
                }`}>
                  <p className={`leading-relaxed break-words overflow-wrap-anywhere ${getSubtextClasses()}`}>
                    "{commentToDelete.content}"
                  </p>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={cancelDeleteComment}
                  className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                    theme === __STRING_PLACEHOLDER_319__
                      ? __STRING_PLACEHOLDER_320__
                      : __STRING_PLACEHOLDER_321__
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
      {false && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-primary/30 rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl shadow-primary/20">
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
            {}
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
            {}
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