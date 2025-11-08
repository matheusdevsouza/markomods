
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, User, CalendarDays, ThumbsUp, ThumbsDown, AlertTriangle, Clock, XCircle, Trash2, Reply } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContextMods';
import { useTranslation } from '@/hooks/useTranslation';
import CommentReply from './CommentReply';
import ReplyModal from './ReplyModal';
import RoleBadge from './RoleBadge';
import { getAvatarUrl } from '@/utils/avatarUtils';

const CommentSection = ({ modId, initialComments = [], onCommentPosted }) => {
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [userTimeout, setUserTimeout] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [commentToReply, setCommentToReply] = useState(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, currentUser } = useAuth();
  const { t } = useTranslation();
  const isUserBanned = currentUser && currentUser.is_banned;



  useEffect(() => {
    if (isAuthenticated) {
      checkUserTimeout();
    }
  }, [isAuthenticated]);

  const checkUserTimeout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const resp = await fetch('/api/comments/user/timeout', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (resp.ok) {
        const data = await resp.json();
        setUserTimeout(data.data.isBlocked ? data.data : null);
      }
    } catch (error) {
      console.warn('Erro ao verificar timeout:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const resp = await fetch(`/api/comments/mod/${modId}?limit=100&includeReplies=true`, { headers });
      if (resp.ok) {
        const data = await resp.json();
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({ title: "Comentário vazio", description: "Por favor, escreva algo antes de enviar.", variant: "destructive" });
      return;
    }

    if (userTimeout) {
      toast({ 
        title: "Usuário bloqueado", 
        description: `Você está temporariamente bloqueado de comentar. Motivo: ${userTimeout.reason}. Tempo restante: ${userTimeout.remainingMinutes} minutos.`, 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ title: t('modDetail.loginRequired'), description: t('modDetail.loginToComment') });
        return;
      }

      const resp = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modId, content: newComment, rating })
      });

      const data = await resp.json();
      if (!resp.ok) {
        if (data.timeout) {
          setUserTimeout({
            reason: data.timeout.reason,
            severity: data.timeout.severity,
            remainingSeconds: data.timeout.remaining_seconds,
            remainingMinutes: data.timeout.durationMinutes
          });
        }
        throw new Error(data.message || 'Falha ao enviar comentário');
      }

      if (data.data && data.data.isPending) {
        toast({ 
          title: 'Comentário pendente de moderação', 
          description: 'Seu comentário foi enviado e está sendo analisado por um moderador. Ele será aprovado ou rejeitado em breve.',
          variant: "destructive"
        });
        
        setNewComment('');
        setRating(null);
        
        window.dispatchEvent(new CustomEvent('commentsUpdated'));
        return;
      }

      setNewComment('');
      setRating(null);
      await fetchComments();
      if (onCommentPosted) onCommentPosted();
      
      window.dispatchEvent(new CustomEvent('commentsUpdated'));
      toast({ title: 'Comentário enviado!', description: 'Seu comentário foi publicado.' });
    } catch (error) {
      toast({ title: "Erro ao enviar comentário", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    if (!isAuthenticated) {
      toast({ title: 'Você precisa estar logado', description: 'Faça login para excluir comentários.' });
      return;
    }

    if (userTimeout) {
      toast({ 
        title: "Usuário bloqueado", 
        description: `Você está temporariamente bloqueado de comentar. Motivo: ${userTimeout.reason}. Tempo restante: ${userTimeout.remainingMinutes} minutos.`, 
        variant: "destructive" 
      });
      return;
    }

    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setCommentToDelete(comment);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      const resp = await fetch(`/api/comments/${commentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (resp.ok) {
        toast({ title: 'Comentário excluído!', description: 'Seu comentário foi removido.' });
        await fetchComments();
        window.dispatchEvent(new CustomEvent('commentsUpdated'));
        setShowDeleteModal(false);
        setCommentToDelete(null);
      } else {
        const errorData = await resp.json();
        throw new Error(errorData.message || 'Falha ao excluir comentário');
      }
    } catch (error) {
      toast({ title: "Erro ao excluir comentário", description: error.message, variant: "destructive" });
    }
  };

  const cancelDeleteComment = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  const handleReplyClick = (comment) => {
    setCommentToReply(comment);
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (replyContent) => {
    if (!commentToReply) return;

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
          parentId: commentToReply.id,
          content: replyContent,
          modId: modId
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: t('modDetail.replySentSuccess'),
          description: "Sua resposta foi publicada com sucesso.",
          variant: "default"
        });
        
        await fetchComments();
        setShowReplyModal(false);
        setCommentToReply(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar resposta');
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const cancelReply = () => {
    setShowReplyModal(false);
    setCommentToReply(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (username) => {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCommentAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return undefined;
    return getAvatarUrl(avatarUrl);
  };

  if (userTimeout) {
    return (
      <div className="space-y-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-minecraft text-primary flex items-center gap-2">
            <MessageCircle size={24} />
            {t('modDetail.comments')} ({comments.length})
          </CardTitle>
        </CardHeader>

        <Card className="minecraft-card border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-orange-600/5">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={48} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Comentários Temporariamente Bloqueados</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {userTimeout.reason}
              </p>
              <div className="flex items-center justify-center gap-2 text-orange-500">
                <Clock size={16} />
                <span className="font-medium">
                  Tempo restante: {userTimeout.remainingMinutes} minutos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* lista de comentários */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <Card className="minecraft-card">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <MessageCircle size={48} className="opacity-50" />
                  <div>
                    <p className="text-lg font-medium">Nenhum comentário ainda</p>
                    <p className="text-sm">Seja o primeiro a comentar sobre este mod!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`minecraft-card ${comment.is_pending ? 'border-2 border-yellow-500 bg-yellow-500/5' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={getCommentAvatarUrl(comment.avatar_url)} />
                        <AvatarFallback className="bg-primary/10 text-primary text-base font-medium">
                          {getInitials(comment.display_name || comment.username)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">
                              {comment.display_name || comment.username}
                            </span>
                            
                            {/* Badge de role do administrador */}
                            {comment.role && ['admin', 'supervisor', 'moderator'].includes(comment.role) && (
                              <RoleBadge role={comment.role} />
                            )}
                            
                            {/* status do comentário */}
                            {comment.is_pending && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                                <Clock size={12} className="text-yellow-500" />
                                <span className="text-xs text-yellow-600 dark:text-yellow-400">Pendente</span>
                              </div>
                            )}
                            
                            {comment.is_rejected && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                                <XCircle size={12} className="text-red-500" />
                                <span className="text-xs text-red-600 dark:text-red-400">Rejeitado</span>
                              </div>
                            )}
                            
                            {comment.rating && (
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < comment.rating ? 'bg-yellow-400' : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays size={14} />
                            {formatDate(comment.created_at)}
                          </div>
                        </div>
                        
                          {/* conteúdo do comentário */}
                        <p className="text-foreground leading-relaxed break-words overflow-wrap-anywhere">
                          {comment.content}
                        </p>
                        
                        {/* motivo da rejeição */}
                        {comment.rejection_reason && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                              <XCircle size={16} />
                              <span className="font-medium text-sm">Motivo da rejeição:</span>
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1 ml-6 break-words overflow-wrap-anywhere">
                              {comment.rejection_reason}
                            </p>
                          </div>
                        )}
                        
                        {/* ações do comentário */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">

                            {/* botões de voto */}
                            {!comment.is_pending && (
                              <>
                                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                  <ThumbsUp size={14} />
                                  <span>{comment.like_count || 0}</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                  <ThumbsDown size={14} />
                                  <span>{comment.dislike_count || 0}</span>
                                </button>
                              </>
                            )}
                            
                            {/* botão de resposta */}
                            {currentUser?.role === 'admin' && !comment.is_pending && (
                              <button
                                onClick={() => handleReplyClick(comment)}
                                className="flex items-center justify-center w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                title="Responder comentário"
                              >
                                <Reply size={14} />
                              </button>
                            )}
                            

                            


                            {/* botão de exclusão */}
                            {comment.can_delete && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                title="Excluir comentário"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          
                          {/* informações para comentários pendentes */}
                          {comment.is_pending && (
                            <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                              <div className="flex items-center justify-center w-5 h-5 bg-yellow-500 rounded-full">
                                <Clock className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                Comentário sendo analisado - será aprovado ou deletado em breve por um moderador
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* exibir respostas do comentário */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {comment.replies.map((reply) => (
                      <CommentReply
                        key={reply.id}
                        reply={reply}
                        modId={modId}
                        currentUser={currentUser}
                        onDelete={handleDeleteComment}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-minecraft text-primary flex items-center gap-2">
          <MessageCircle size={24} />
          {t('modDetail.comments')} ({comments.length})
        </CardTitle>
      </CardHeader>

      {/* formulário de comentário */}
      <Card className="minecraft-card">
        <CardContent className="p-6">
          {isUserBanned ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Ban className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    Conta Suspensa
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Sua conta foi banida da plataforma. Você não pode postar comentários.
                  </p>
                  <p className="text-sm text-red-300">
                    Motivo: {currentUser.ban_reason || 'Banimento administrativo'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/default-avatar.png" />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials('Usuário Anônimo')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder={t('modDetail.shareOpinion')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="minecraft-input resize-none min-h-[100px]"
                    disabled={isSubmitting}
                  />

                  {/* avaliação opcional */}
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map((star) => (
                      <button type="button" key={star} onClick={() => setRating(rating === star ? null : star)} className={`w-5 h-5 rounded-full ${rating && star <= rating ? 'bg-yellow-400' : 'bg-gray-600/50'} hover:bg-yellow-400 transition-colors`} aria-label={`Avaliar ${star}`}></button>
                    ))}
                    <span className="text-xs text-muted-foreground">Avaliação opcional</span>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white border-2 border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 transform backdrop-blur-sm"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Enviando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send size={16} />
                          Enviar Comentário
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* lista de comentários */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="minecraft-card">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <MessageCircle size={48} className="opacity-50" />
                <div>
                  <p className="text-lg font-medium">Nenhum comentário ainda</p>
                  <p className="text-sm">Seja o primeiro a comentar sobre este mod!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          comments
            .filter(comment => {
              if (!comment.is_pending && !comment.is_rejected) return true;
              if (comment.is_pending && currentUser && comment.user_id === currentUser.id) return true;
              if (comment.is_rejected && currentUser && comment.user_id === currentUser.id) return true;
              
              return false;
            })
            .map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`minecraft-card ${
                comment.is_pending ? 'border-2 border-yellow-500 bg-yellow-500/5' : 
                comment.is_rejected ? 'opacity-60 border-red-500/30 bg-red-500/5' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={getCommentAvatarUrl(comment.avatar_url)} />
                      <AvatarFallback className="bg-primary/10 text-primary text-base font-medium">
                        {getInitials(comment.display_name || comment.username)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {comment.display_name || comment.username}
                          </span>
                          
                          {/* Badge de role do administrador */}
                          {comment.role && ['admin', 'supervisor', 'moderator'].includes(comment.role) && (
                            <RoleBadge role={comment.role} />
                          )}
                          
                          {/* status do comentário */}
                          {comment.is_pending && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                              <Clock size={12} className="text-yellow-500" />
                              <span className="text-xs text-yellow-600 dark:text-yellow-400">Pendente</span>
                            </div>
                          )}
                          
                          {comment.is_rejected && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                              <XCircle size={12} className="text-red-500" />
                              <span className="text-xs text-red-600 dark:text-red-400">Rejeitado</span>
                            </div>
                          )}
                          
                          {comment.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 rounded-full ${
                                    i < comment.rating ? 'bg-yellow-400' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays size={14} />
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                      
                      {/* conteúdo do comentário */}
                      <p className="text-foreground leading-relaxed break-words overflow-wrap-anywhere">
                        {comment.content}
                      </p>
                      
                      {/* motivo da rejeição */}
                      {comment.rejection_reason && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle size={16} />
                            <span className="font-medium text-sm">Motivo da rejeição:</span>
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1 ml-6">
                            {comment.rejection_reason}
                          </p>
                        </div>
                      )}
                      
                      {/* ações do comentário */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">

                          {/* botões de voto */}
                          {!comment.is_pending && !comment.is_rejected && (
                            <>
                              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                <ThumbsUp size={14} />
                                <span>{comment.like_count || 0}</span>
                              </button>
                              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                <ThumbsDown size={14} />
                                <span>{comment.dislike_count || 0}</span>
                              </button>
                            </>
                          )}
                          
                          {/* botão de exclusão */}
                          {comment.can_delete && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                              title="Excluir comentário"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        
                        {/* informações para comentários pendentes */}
                        {comment.is_pending && (
                          <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-center justify-center w-5 h-5 bg-yellow-500 rounded-full">
                              <Clock className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                              Comentário sendo analisado - será aprovado ou deletado em breve por um moderador
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* modal de confirmação de exclusão */}
      {showDeleteModal && commentToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-red-500/30 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl shadow-red-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Exclusão de Comentário</h3>
                  <p className="text-sm text-red-300">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <button
                onClick={cancelDeleteComment}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">

              {/* preview do comentário */}
              <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-600/50">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getCommentAvatarUrl(commentToDelete.avatar_url)} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-lg">
                      {getInitials(commentToDelete.display_name || commentToDelete.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg">
                      {commentToDelete.username || 'Usuário'}
                    </p>
                    <p className="text-sm text-gray-400 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(commentToDelete.created_at)}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-gray-500">
                  <p className="text-gray-200 leading-relaxed break-words overflow-wrap-anywhere">
                    "{commentToDelete.content}"
                  </p>
                </div>
              </div>

              {/* botões de ação */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={cancelDeleteComment}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-300 hover:text-white border-2 border-gray-600 rounded-lg hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center space-x-2"
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

      {/* modal de resposta */}
      <ReplyModal
        isOpen={showReplyModal}
        onClose={cancelReply}
        comment={commentToReply}
        onSubmit={handleReplySubmit}
        isLoading={isSubmittingReply}
      />
    </div>
  );
};

export default CommentSection;
