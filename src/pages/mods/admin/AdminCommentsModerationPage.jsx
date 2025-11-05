import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContextMods';
import { useTranslation } from '../../../hooks/useTranslation';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Ban, 
  AlertTriangle, 
  User, 
  CalendarDays,
  ExternalLink,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  TrendingUp
} from 'lucide-react';

const AdminCommentsModerationPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingComments, setPendingComments] = useState([]);
  const [rejectedComments, setRejectedComments] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (currentUser?.role && ['admin', 'super_admin', 'moderator'].includes(currentUser.role)) {
      fetchComments();
    }
  }, [currentUser, activeTab]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (activeTab === 'pending') {
        const response = await fetch('/api/comments/admin/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPendingComments(data.data || []);
        }
      } else if (activeTab === 'rejected') {
        const response = await fetch('/api/comments/admin/rejected', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRejectedComments(data.data || []);
        }
      } else if (activeTab === 'recent') {
        const response = await fetch('/api/comments/admin/recent', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRecentComments(data.data || []);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast({ 
        title: 'Erro ao carregar comentários', 
        description: 'Tente novamente.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/comments/admin/${commentId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ 
          title: 'Comentário aprovado!', 
          description: 'O comentário foi publicado com sucesso.' 
        });
        
        setPendingComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao aprovar comentário');
      }
    } catch (error) {
      toast({ 
        title: 'Erro ao aprovar comentário', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectComment = async () => {
    if (!selectedComment || !rejectReason.trim()) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/comments/admin/${selectedComment.id}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason.trim() })
      });

      if (response.ok) {
        toast({ 
          title: 'Comentário rejeitado!', 
          description: 'O comentário foi rejeitado e não será publicado.' 
        });
        
        const rejectedComment = {
          ...selectedComment,
          rejection_reason: rejectReason.trim(),
          rejected_at: new Date().toISOString(),
          status: 'rejected'
        };
        
        setRejectedComments(prev => [rejectedComment, ...prev]);
        setPendingComments(prev => prev.filter(c => c.id !== selectedComment.id));
        
        setRejectModalOpen(false);
        setSelectedComment(null);
        setRejectReason('');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao rejeitar comentário');
      }
    } catch (error) {
      toast({ 
        title: 'Erro ao rejeitar comentário', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedComment || !banReason.trim()) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/user/${selectedComment.user_id}/ban`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          is_banned: true,
          ban_reason: banReason.trim()
        })
      });

      if (response.ok) {
        toast({ 
          title: 'Usuário banido!', 
          description: 'O usuário foi banido da plataforma e será deslogado automaticamente.' 
        });
        
        setPendingComments(prev => prev.filter(c => c.user_id !== selectedComment.user_id));
        setRejectedComments(prev => prev.filter(c => c.user_id !== selectedComment.user_id));
        
        setBanModalOpen(false);
        setSelectedComment(null);
        setBanReason('');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao banir usuário');
      }
    } catch (error) {
      toast({ 
        title: 'Erro ao banir usuário', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (comment) => {
    setSelectedComment(comment);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const openBanModal = (comment) => {
    setSelectedComment(comment);
    setBanReason('');
    setBanModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!currentUser?.role || !['admin', 'super_admin', 'moderator'].includes(currentUser.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="minecraft-card">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            {t('modDetail.comments')}
          </CardTitle>
          <p className="text-lg md:text-xl text-muted-foreground">
            Gerencie comentários pendentes, aprovados e rejeitados. Mantenha a qualidade da comunidade.
          </p>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="pending" className="flex flex-col items-center justify-center gap-1 py-2 px-1 sm:py-3 sm:px-2 text-xs sm:text-sm h-auto min-h-[60px] sm:min-h-[auto]">
              <Clock className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
              <div className="flex flex-col items-center">
                <span className="font-medium leading-tight">{pendingComments.length}</span>
                <span className="hidden sm:inline">Pendentes</span>
                <span className="sm:hidden text-xs">Pend.</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex flex-col items-center justify-center gap-1 py-2 px-1 sm:py-3 sm:px-2 text-xs sm:text-sm h-auto min-h-[60px] sm:min-h-[auto]">
              <TrendingUp className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
              <div className="flex flex-col items-center">
                <span className="font-medium leading-tight">{recentComments.length}</span>
                <span className="hidden sm:inline">Recentes</span>
                <span className="sm:hidden text-xs">Rec.</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex flex-col items-center justify-center gap-1 py-2 px-1 sm:py-3 sm:px-2 text-xs sm:text-sm h-auto min-h-[60px] sm:min-h-[auto]">
              <XCircle className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
              <div className="flex flex-col items-center">
                <span className="font-medium leading-tight">{rejectedComments.length}</span>
                <span className="hidden sm:inline">Rejeitados</span>
                <span className="sm:hidden text-xs">Rejeit.</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">Carregando comentários...</p>
              </div>
            ) : pendingComments.length === 0 ? (
              <Card className="minecraft-card">
                <CardContent className="p-6 sm:p-8 text-center">
                  <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Nenhum comentário pendente!</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Todos os comentários foram moderados. A comunidade está em dia! 🎉
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="minecraft-card border-yellow-500/30 bg-yellow-500/5">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                            <AvatarImage src={comment.avatar_url || "/default-avatar.png"} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm sm:text-base font-medium">
                              {getInitials(comment.display_name || comment.username)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                                <span className="font-medium text-sm sm:text-base text-foreground break-words overflow-wrap-anywhere">
                                  {comment.display_name || comment.username}
                                </span>
                                
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-xs">
                                    <Clock size={10} className="mr-1" />
                                    Pendente
                                  </Badge>
                                  
                                  {comment.rating && (
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <div
                                          key={i}
                                          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                                            i < comment.rating ? 'bg-yellow-400' : 'bg-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <Button
                                onClick={() => openBanModal(comment)}
                                disabled={processing}
                                variant="outline"
                                size="sm"
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600 transition-all duration-200 text-xs sm:text-sm"
                              >
                                <Ban size={12} className="mr-1" />
                                Banir
                              </Button>
                            </div>
                            
                            <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                              <p className="text-sm sm:text-base text-foreground leading-relaxed break-words overflow-wrap-anywhere">
                                {comment.content}
                              </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                                <span className="break-words overflow-wrap-anywhere">Mod: {comment.mod_title}</span>
                                <div className="hidden sm:block w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/mods/${comment.mod_slug}`, '_blank')}
                                  className="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors w-fit"
                                >
                                  <ExternalLink size={12} className="mr-1" />
                                  Ver mod
                                </Button>
                                <div className="hidden sm:block w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                                <div className="flex items-center gap-1">
                                  <CalendarDays size={12} />
                                  {formatDate(comment.created_at)}
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                <Button
                                  onClick={() => handleApproveComment(comment.id)}
                                  disabled={processing}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 text-sm"
                                >
                                  <CheckCircle size={16} className="mr-2" />
                                  Aprovar
                                </Button>
                                
                                <Button
                                  onClick={() => openRejectModal(comment)}
                                  disabled={processing}
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105 text-sm"
                                >
                                  <XCircle size={16} className="mr-2" />
                                  Rejeitar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Carregando comentários...</p>
              </div>
            ) : recentComments.length === 0 ? (
              <Card className="minecraft-card">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum comentário recente!</h3>
                  <p className="text-muted-foreground">
                    Não há comentários aprovados recentemente.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="minecraft-card border-green-500/30 bg-green-500/5">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <AvatarImage src={comment.avatar_url || "/default-avatar.png"} />
                            <AvatarFallback className="bg-primary/10 text-primary text-base font-medium">
                              {getInitials(comment.display_name || comment.username)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3 min-w-0">
                            <div className="flex items-center justify-between min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-medium text-foreground break-words overflow-wrap-anywhere">
                                  {comment.display_name || comment.username}
                                </span>
                                
                                <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30">
                                  <CheckCircle size={12} className="mr-1" />
                                  Aprovado
                                </Badge>
                                
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
                              
                              <Button
                                onClick={() => openBanModal(comment)}
                                disabled={processing}
                                variant="outline"
                                size="sm"
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600 transition-all duration-200"
                              >
                                <Ban size={14} className="mr-1" />
                                Banir
                              </Button>
                            </div>
                            
                            <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                              <p className="text-foreground leading-relaxed break-words overflow-wrap-anywhere">
                                {comment.content}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between min-w-0">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                <span className="break-words overflow-wrap-anywhere">Mod: {comment.mod_title}</span>
                                <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/mods/${comment.mod_slug}`, '_blank')}
                                  className="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                  <ExternalLink size={12} className="mr-1" />
                                  Ver mod
                                </Button>
                                <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                                <div className="flex items-center gap-1">
                                  <CalendarDays size={12} />
                                  {formatDate(comment.created_at)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 flex-wrap">
                                <Button
                                  onClick={() => openRejectModal(comment)}
                                  disabled={processing}
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105"
                                >
                                  <XCircle size={18} className="mr-2" />
                                  Rejeitar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Carregando comentários...</p>
              </div>
            ) : rejectedComments.length === 0 ? (
              <Card className="minecraft-card">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum comentário rejeitado!</h3>
                  <p className="text-muted-foreground">
                    Todos os comentários foram aprovados ou ainda não foram rejeitados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="minecraft-card border-red-500/30 bg-red-500/5">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <AvatarImage src={comment.avatar_url || "/default-avatar.png"} />
                            <AvatarFallback className="bg-primary/10 text-primary text-base font-medium">
                              {getInitials(comment.display_name || comment.username)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3 min-w-0">
                            <div className="flex items-center justify-between min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-medium text-foreground break-words overflow-wrap-anywhere">
                                  {comment.display_name || comment.username}
                                </span>
                                
                                <Badge variant="destructive" className="bg-red-500/20 text-red-600 border-red-500/30">
                                  <XCircle size={12} className="mr-1" />
                                  Rejeitado
                                </Badge>
                                
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
                              
                              <Button
                                onClick={() => openBanModal(comment)}
                                disabled={processing}
                                variant="outline"
                                size="sm"
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600 transition-all duration-200"
                              >
                                <Ban size={14} className="mr-1" />
                                Banir
                              </Button>
                            </div>
                            
                            <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                              <p className="text-foreground leading-relaxed break-words overflow-wrap-anywhere">
                                {comment.content}
                              </p>
                            </div>
                            
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 flex-wrap">
                                <XCircle size={16} />
                                <span className="font-medium text-sm">Motivo da rejeição:</span>
                              </div>
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1 ml-6 break-words overflow-wrap-anywhere">
                                {comment.rejection_reason}
                              </p>
                              <div className="text-xs text-red-500/70 mt-2 ml-6">
                                <span className="break-words overflow-wrap-anywhere">Rejeitado por: {comment.rejected_by_username || comment.rejected_by_display_name || 'Administrador'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between min-w-0">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                <span className="break-words overflow-wrap-anywhere">Mod: {comment.mod_title}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/mods/${comment.mod_slug}`, '_blank')}
                                  className="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                  <ExternalLink size={12} className="mr-1" />
                                  Ver mod
                                </Button>
                                <div className="flex items-center gap-1">
                                  <CalendarDays size={12} />
                                  {formatDate(comment.rejected_at)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 flex-wrap">
                                <Button
                                  onClick={() => handleApproveComment(comment.id)}
                                  disabled={processing}
                                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105"
                                >
                                  <CheckCircle size={18} className="mr-2" />
                                  Aprovar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <XCircle className="h-5 w-5 text-red-500" />
              Rejeitar Comentário
            </DialogTitle>
            <DialogDescription>
              Forneça um motivo para a rejeição deste comentário. O usuário será notificado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg max-w-full overflow-hidden">
              <p className="text-sm text-foreground break-all overflow-wrap-anywhere word-break-break-all hyphens-auto">
                <strong>Comentário:</strong> {selectedComment?.content}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da rejeição *</label>
              <Textarea
                placeholder="Ex: Conteúdo inadequado, spam, linguagem ofensiva..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRejectModalOpen(false)}
                disabled={processing}
                className="transition-all duration-200 hover:scale-105"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRejectComment}
                disabled={!rejectReason.trim() || processing}
                className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
              >
                {processing ? 'Rejeitando...' : 'Rejeitar Comentário'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Ban className="h-5 w-5 text-red-500" />
              Banir Usuário
            </DialogTitle>
            <DialogDescription>
              <span className="text-red-600 font-medium">ATENÇÃO:</span> Esta ação é irreversível e o usuário será deslogado imediatamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-full overflow-hidden">
              <p className="text-sm text-foreground break-all overflow-wrap-anywhere word-break-break-all hyphens-auto">
                <strong>Usuário:</strong> {selectedComment?.display_name || selectedComment?.username}
              </p>
              <p className="text-sm text-foreground break-all overflow-wrap-anywhere word-break-break-all hyphens-auto">
                <strong>Comentário:</strong> {selectedComment?.content}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo do banimento *</label>
              <Textarea
                placeholder="Ex: Comportamento inadequado, violação das regras, spam..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-600 flex-wrap">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">Consequências do banimento:</span>
              </div>
              <ul className="text-sm text-red-600 mt-2 ml-6 space-y-1">
                <li>• Usuário será deslogado automaticamente</li>
                <li>• Não poderá fazer login novamente</li>
                <li>• Todos os comentários serão removidos</li>
                <li>• Para voltar, precisará entrar em contato</li>
              </ul>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setBanModalOpen(false)}
                disabled={processing}
                className="transition-all duration-200 hover:scale-105"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleBanUser}
                disabled={!banReason.trim() || processing}
                className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
              >
                {processing ? 'Banindo...' : 'Banir Usuário'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommentsModerationPage;
