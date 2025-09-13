import { v4 as uuidv4 } from 'uuid';
import CommentsModel from '../models/CommentsModel.js';
import { LogService } from '../services/LogService.js';
import { logError } from '../config/logger.js';
import { sanitizeText, isMalicious } from '../utils/sanitizer.js';
import { recordFailedLogin, recordRateLimitViolation } from '../services/SecurityService.js';

export const createComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { modId, content, rating } = req.body || {};

    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });
    if (!modId) return res.status(400).json({ success: false, message: 'modId é obrigatório' });
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comentário vazio' });
    }

    // Sanitizar e validar conteúdo
    const sanitizedContent = sanitizeText(content.trim());
    
    if (!sanitizedContent) {
      return res.status(400).json({ success: false, message: 'Comentário contém apenas caracteres inválidos' });
    }

    // Verificar se contém conteúdo malicioso
    if (isMalicious(content)) {
      // Registrar tentativa maliciosa
      recordRateLimitViolation(req.ip, 'malicious_comment', req.get('User-Agent'));
      
      await LogService.logSecurity(
        userId,
        'Tentativa de comentário malicioso',
        `Conteúdo malicioso detectado: ${content.substring(0, 100)}`,
        req.ip,
        req.get('User-Agent')
      );
      
      return res.status(400).json({ 
        success: false, 
        message: 'Comentário contém conteúdo não permitido' 
      });
    }

    // Verificar se usuário está banido
    if (req.user && req.user.is_banned) {
      return res.status(403).json({ 
        success: false, 
        message: 'Sua conta foi banida da plataforma. Você não pode postar comentários.',
        banned: true
      });
    }

    // Verificar se usuário está em timeout
    const timeout = await CommentsModel.isUserInTimeout(userId);
    if (timeout) {
      const remainingMinutes = Math.ceil(timeout.remaining_seconds / 60);
      return res.status(403).json({ 
        success: false, 
        message: `Você está temporariamente bloqueado de comentar. Motivo: ${timeout.reason}. Tempo restante: ${remainingMinutes} minutos.`,
        timeout: {
          reason: timeout.reason,
          severity: timeout.severity,
          remainingSeconds: timeout.remaining_seconds
        }
      });
    }

    // Anti-spam: limitar envios muito frequentes
    const recent = await CommentsModel.countRecentByUser(userId, 20);
    if (recent >= 3) {
      await LogService.logSecurity(userId, 'Spam de comentários bloqueado', 'Usuário enviou comentários em alta frequência');
      return res.status(429).json({ success: false, message: 'Você está comentando muito rápido. Tente novamente em instantes.' });
    }

    // Verificar palavras proibidas no banco de dados
    const forbiddenWords = await CommentsModel.containsForbiddenWords(content);
    if (forbiddenWords && forbiddenWords.length > 0) {
      const highestSeverity = forbiddenWords.reduce((highest, current) => {
        const severityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
        return severityOrder[current.severity] > severityOrder[highest.severity] ? current.severity : highest;
      }, 'low');

      // Aplicar timeout baseado na severidade
      let timeoutDuration = 30; // minutos padrão
      if (highestSeverity === 'high') timeoutDuration = 120; // 2 horas
      else if (highestSeverity === 'medium') timeoutDuration = 60; // 1 hora

      const reason = `Comentário bloqueado - Palavras proibidas: ${forbiddenWords.map(fw => fw.word).join(', ')}`;
      
      await CommentsModel.applyUserTimeout(userId, reason, highestSeverity, timeoutDuration);
      
      await LogService.logSecurity(
        userId, 
        'Comentário bloqueado (palavras proibidas)', 
        `Conteúdo reprovado pelo filtro de linguagem. Severidade: ${highestSeverity}. Timeout: ${timeoutDuration} minutos.`,
        req.ip, 
        req.headers['user-agent']
      );

      return res.status(400).json({ 
        success: false, 
        message: `Seu comentário contém palavras não permitidas. Você foi temporariamente bloqueado de comentar por ${timeoutDuration} minutos.`,
        timeout: {
          reason,
          severity: highestSeverity,
          durationMinutes: timeoutDuration
        }
      });
    }

    const id = uuidv4();
    const comment = await CommentsModel.create({ id, modId, userId, content: sanitizedContent, rating });

    await LogService.logComments(userId, 'Novo comentário', `Comentou no mod ${modId}`, req.ip, req.headers['user-agent'], id, modId);

    // Buscar o comentário criado com dados do usuário
    const createdComment = await CommentsModel.findById(id);
    
    
    // Verificar se o comentário está pendente
    if (!createdComment.is_approved) {
      return res.json({ 
        success: true, 
        message: 'Comentário enviado com sucesso! Ele está pendente de aprovação e será analisado por um administrador antes de ser publicado.',
        data: createdComment,
        isPending: true
      });
    }
    
    return res.json({ success: true, data: createdComment });
  } catch (error) {
    console.error('Erro ao criar comentário', error);
    
    // Verificar se é erro de cooldown
    if (error.message.includes('Aguarde') && error.message.includes('minuto(s)')) {
      return res.status(429).json({ 
        success: false, 
        message: error.message,
        cooldown: true
      });
    }
    
    return res.status(500).json({ success: false, message: 'Erro ao criar comentário' });
  }
};

// Listar comentários por mod (incluindo pendentes do usuário logado)
export const listCommentsByMod = async (req, res) => {
  try {
    const { modId } = req.params;
    const { limit = 100, includeReplies = false } = req.query;
    const userId = req.user?.id;

    let comments;
    if (includeReplies === 'true') {
      // Buscar comentários principais e suas respostas
      comments = await CommentsModel.findByModIdWithReplies(modId, userId);
    } else {
      comments = await CommentsModel.findByModId(modId, userId, true);
    }
    
    res.json({
      success: true,
      data: comments,
      total: comments.length
    });
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar comentários' });
  }
};

// Buscar comentários pendentes para moderação (admin apenas)
export const getPendingComments = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Verificar se é admin
    if (!['admin', 'super_admin', 'moderator'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    const comments = await CommentsModel.findPendingForModeration(parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: comments,
      total: comments.length
    });
  } catch (error) {
    console.error('Erro ao buscar comentários pendentes:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar comentários pendentes' });
  }
};

// Buscar comentários rejeitados (admin apenas)
export const getRejectedComments = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Verificar se é admin
    if (!['admin', 'super_admin', 'moderator'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    const comments = await CommentsModel.findRejectedComments(parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: comments,
      total: comments.length
    });
  } catch (error) {
    console.error('Erro ao buscar comentários rejeitados:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar comentários rejeitados' });
  }
};

// Buscar comentários recentes aprovados (admin apenas)
export const getRecentComments = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Verificar se é admin
    if (!['admin', 'super_admin', 'moderator'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    const comments = await CommentsModel.findRecentApprovedComments(parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: comments,
      total: comments.length
    });
  } catch (error) {
    console.error('Erro ao buscar comentários recentes:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar comentários recentes' });
  }
};

// Aprovar comentário (admin apenas)
export const approveComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const moderatorId = req.user?.id;
    
    // Verificar se é admin
    if (!['admin', 'super_admin', 'moderator'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    await CommentsModel.approveComment(commentId, moderatorId);
    
    await LogService.logModeration(
      moderatorId,
      'Comentário aprovado',
      `Comentário ${commentId} aprovado`,
      req.ip,
      req.headers['user-agent'],
      commentId,
      'comment'
    );

    res.json({
      success: true,
      message: 'Comentário aprovado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao aprovar comentário:', error);
    res.status(500).json({ success: false, message: 'Erro ao aprovar comentário' });
  }
};

// Rejeitar comentário (admin apenas)
export const rejectComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;
    const moderatorId = req.user?.id;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Motivo da rejeição é obrigatório' });
    }
    
    // Verificar se é admin
    if (!['admin', 'super_admin', 'moderator'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    await CommentsModel.rejectComment(commentId, moderatorId, reason.trim());
    
    await LogService.logModeration(
      moderatorId,
      'Comentário rejeitado',
      `Comentário ${commentId} rejeitado. Motivo: ${reason}`,
      req.ip,
      req.headers['user-agent'],
      commentId,
      'comment',
      reason
    );

    res.json({
      success: true,
      message: 'Comentário rejeitado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao rejeitar comentário:', error);
    res.status(500).json({ success: false, message: 'Erro ao rejeitar comentário' });
  }
};

// Deletar comentário (autor ou admin)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    await CommentsModel.deleteComment(commentId, userId, userRole);
    
    await LogService.logComments(
      userId, 
      'Comentário deletado', 
      `Deletou comentário ${commentId}`, 
      req.ip, 
      req.headers['user-agent']
    );

    res.json({
      success: true,
      message: 'Comentário deletado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    
    if (error.message.includes('Sem permissão')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    
    res.status(500).json({ success: false, message: 'Erro ao deletar comentário' });
  }
};

// Criar resposta de comentário (apenas super admins)
export const createReply = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { parentId, content, modId } = req.body || {};

    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });
    if (!parentId) return res.status(400).json({ success: false, message: 'parentId é obrigatório' });
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Resposta vazia' });
    }
    if (!modId) return res.status(400).json({ success: false, message: 'modId é obrigatório' });

    // Buscar o comentário pai para obter o user_id
    const parentComment = await CommentsModel.findById(parentId);
    if (!parentComment) {
      return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
    }

    const replyData = {
      modId,
      userId,
      parentId,
      content: content.trim(),
      replyToUserId: parentComment.user_id
    };

    const reply = await CommentsModel.createReply(replyData);
    
    // Buscar dados completos da resposta
    const fullReply = await CommentsModel.findById(reply.id);
    
    res.status(201).json({
      success: true,
      message: 'Resposta criada com sucesso',
      data: fullReply
    });
  } catch (error) {
    logError('Erro ao criar resposta', error, { userId: req.user?.id, body: req.body });
    res.status(500).json({ success: false, message: 'Erro ao criar resposta' });
  }
};

// Buscar respostas de um comentário
export const getReplies = async (req, res) => {
  try {
    const { parentId } = req.params;

    if (!parentId) {
      return res.status(400).json({ success: false, message: 'parentId é obrigatório' });
    }

    const replies = await CommentsModel.findRepliesByParentId(parentId);
    
    res.json({
      success: true,
      data: replies
    });
  } catch (error) {
    logError('Erro ao buscar respostas', error, { parentId: req.params.parentId });
    res.status(500).json({ success: false, message: 'Erro ao buscar respostas' });
  }
};

// Votar em comentário
export const voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { voteType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    if (!commentId) {
      return res.status(400).json({ success: false, message: 'commentId é obrigatório' });
    }

    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ success: false, message: 'voteType deve ser "upvote" ou "downvote"' });
    }

    const result = await CommentsModel.vote(commentId, userId, voteType);
    
    
    res.json({
      success: true,
      message: 'Voto registrado com sucesso',
      data: result
    });
  } catch (error) {
    logError('Erro ao votar no comentário', error, { commentId: req.params.commentId, userId: req.user?.id });
    res.status(500).json({ success: false, message: 'Erro ao registrar voto' });
  }
};

// Buscar comentários do usuário com paginação e filtros
export const getUserComments = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, search = '', date_filter = 'all' } = req.query;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir filtros de data
    let dateCondition = '';
    const now = new Date();
    
    switch (date_filter) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateCondition = `AND c.created_at >= '${today.toISOString()}'`;
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateCondition = `AND c.created_at >= '${weekAgo.toISOString()}'`;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateCondition = `AND c.created_at >= '${monthAgo.toISOString()}'`;
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateCondition = `AND c.created_at >= '${yearAgo.toISOString()}'`;
        break;
    }

    // Buscar comentários com informações do mod
    const comments = await CommentsModel.getUserComments({
      userId,
      offset: parseInt(offset),
      limit: parseInt(limit),
      search: search.trim(),
      dateCondition
    });

    // Buscar total de comentários para paginação
    const total = await CommentsModel.getUserCommentsCount({
      userId,
      search: search.trim(),
      dateCondition
    });

    res.json({
      success: true,
      data: {
        comments,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logError('Erro ao buscar comentários do usuário', error, { userId: req.user?.id });
    res.status(500).json({ success: false, message: 'Erro ao buscar comentários' });
  }
};

// Contar comentários do usuário
export const getUserCommentsCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    const total = await CommentsModel.getUserCommentsCount({ userId });

    res.json({
      success: true,
      data: { total }
    });
  } catch (error) {
    logError('Erro ao contar comentários do usuário', error, { userId: req.user?.id });
    res.status(500).json({ success: false, message: 'Erro ao contar comentários' });
  }
};


