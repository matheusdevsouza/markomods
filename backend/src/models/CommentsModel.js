import { executeQuery } from '../config/database.js';
import { logError, logInfo } from '../config/logger.js';
import crypto from 'crypto';

export default class CommentsModel {
  static async ensureTables() {
    // Tabela de comentários
    const commentsTable = `
      CREATE TABLE IF NOT EXISTS comments (
        id CHAR(36) PRIMARY KEY,
        mod_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        rating INT,
        is_approved BOOLEAN DEFAULT FALSE,
        rejection_reason TEXT,
        rejected_at TIMESTAMP,
        rejected_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_mod_id (mod_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    // Tabela de palavras proibidas
    const forbiddenWordsTable = `
      CREATE TABLE IF NOT EXISTS forbidden_words (
        id INT AUTO_INCREMENT PRIMARY KEY,
        word VARCHAR(100) NOT NULL UNIQUE,
        severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_word (word),
        INDEX idx_severity (severity)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    // Tabela de timeouts de usuários
    const userTimeoutsTable = `
      CREATE TABLE IF NOT EXISTS user_timeouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
        timeout_until TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_timeout_until (timeout_until),
        INDEX idx_severity (severity)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    // Tabela de votos em comentários
    const commentVotesTable = `
      CREATE TABLE IF NOT EXISTS comment_votes (
        id VARCHAR(36) PRIMARY KEY,
        comment_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        vote_type ENUM('upvote', 'downvote') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_comment_id (comment_id),
        INDEX idx_user_id (user_id),
        INDEX idx_vote_type (vote_type),
        UNIQUE KEY unique_user_comment (user_id, comment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    try {
      await executeQuery(commentsTable, []);
      await executeQuery(forbiddenWordsTable, []);
      await executeQuery(userTimeoutsTable, []);
      await executeQuery(commentVotesTable, []);
      
      // Inserir palavras proibidas padrão se a tabela estiver vazia
      await this.ensureDefaultForbiddenWords();
    } catch (error) {
      logError('Erro ao criar tabelas de comentários', error);
      throw error;
    }
  }

  static async ensureDefaultForbiddenWords() {
    try {
      const countResult = await executeQuery('SELECT COUNT(*) as count FROM forbidden_words', []);
      if (countResult[0]?.count === 0) {
        const defaultWords = [
          { word: 'idiota', severity: 'medium' },
          { word: 'burro', severity: 'medium' },
          { word: 'otario', severity: 'medium' },
          { word: 'otário', severity: 'medium' },
          { word: 'merda', severity: 'high' },
          { word: 'porra', severity: 'high' },
          { word: 'caralho', severity: 'high' },
          { word: 'fdp', severity: 'high' },
          { word: 'vagabundo', severity: 'medium' },
          { word: 'lixo', severity: 'medium' },
          { word: 'imbecil', severity: 'medium' },
          { word: 'imbécil', severity: 'medium' },
          { word: 'estupido', severity: 'medium' },
          { word: 'estúpido', severity: 'medium' }
        ];

        for (const wordData of defaultWords) {
          await executeQuery(
            'INSERT IGNORE INTO forbidden_words (word, severity) VALUES (?, ?)',
            [wordData.word, wordData.severity]
          );
        }
      }
    } catch (error) {
      logError('Erro ao inserir palavras proibidas padrão', error);
    }
  }

  static async create({ id, modId, userId, content, rating = null }) {
    try {
      // Verificar se o sistema de moderação está ativado
      const moderationEnabled = await this.isModerationEnabled();
      
      // Se moderação estiver ativada, comentário fica pendente
      const isApproved = !moderationEnabled;
      
      const sql = `INSERT INTO comments (id, mod_id, user_id, content, rating, is_approved, like_count, dislike_count, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)`;
      await executeQuery(sql, [id, modId, userId, content, rating, isApproved]);
      
      logInfo('Comentário criado', { commentId: id, modId, userId, isApproved });
      return { id, modId, userId, content, rating, isApproved };
    } catch (error) {
      logError('Erro ao criar comentário', error, { modId, userId });
      throw error;
    }
  }

  // Verificar se o sistema de moderação está ativado
  static async isModerationEnabled() {
    try {
      const sql = 'SELECT setting_value FROM system_settings WHERE setting_key = ?';
      const result = await executeQuery(sql, ['moderation_enabled']);
      
      if (result.length === 0) return true; // Padrão: moderação ativada
      return result[0].setting_value === 'true';
    } catch (error) {
      logError('Erro ao verificar status da moderação', error);
      return true; // Em caso de erro, manter moderação ativada
    }
  }

  // Buscar comentários por mod com status de aprovação
  static async findByModId(modId, userId = null, includePending = false) {
    try {
      let sql = `
        SELECT c.id, c.content, c.rating, c.created_at, c.mod_id, c.user_id, c.is_approved, 
               c.like_count, c.dislike_count, c.rejection_reason, c.rejected_at, c.rejected_by,
               u.username, u.display_name, u.avatar_url, u.role, u.is_banned,
               cv.vote_type as user_vote
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN comment_votes cv ON c.id = cv.comment_id AND cv.user_id = ?
        WHERE c.mod_id = ? AND u.is_banned = 0
      `;
      
      const params = [userId, modId];
      
      if (!includePending) {
        sql += ' AND c.is_approved = TRUE';
      } else if (userId) {
        // Incluir comentários pendentes do usuário logado
        sql += ' AND (c.is_approved = TRUE OR c.user_id = ?)';
        params.push(userId);
      } else {
        sql += ' AND c.is_approved = TRUE';
      }
      
      sql += ' ORDER BY c.created_at DESC';
      
      const result = await executeQuery(sql, params);
      
      return result.map(comment => ({
        ...comment,
        is_pending: !comment.is_approved,
        is_rejected: comment.rejection_reason !== null,
        can_delete: userId === comment.user_id || (comment.role && ['admin', 'super_admin'].includes(comment.role))
      }));
    } catch (error) {
      logError('Erro ao buscar comentários por mod', error, { modId, userId });
      throw error;
    }
  }

  // Buscar comentários pendentes para moderação
  static async findPendingForModeration(limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT c.id, c.content, c.rating, c.created_at, c.mod_id, c.user_id, c.rejection_reason, c.rejected_at, c.rejected_by,
               u.username, u.display_name, u.avatar_url, u.role, u.is_banned,
               m.title as mod_title, m.slug as mod_slug,
               c.like_count, c.dislike_count
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN mods m ON c.mod_id = m.id
        WHERE c.is_approved = FALSE AND c.rejection_reason IS NULL
        ORDER BY c.created_at ASC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
      
      const result = await executeQuery(sql, [limit, offset]);
      
      return result.map(comment => ({
        ...comment,
        status: 'pending',
        can_moderate: !comment.is_banned
      }));
    } catch (error) {
      logError('Erro ao buscar comentários pendentes', error);
      throw error;
    }
  }

  // Buscar comentários rejeitados
  static async findRejectedComments(limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT c.id, c.content, c.rating, c.created_at, c.mod_id, c.user_id, c.rejection_reason, c.rejected_at, c.rejected_by,
               u.username, u.display_name, u.avatar_url, u.role,
               m.title as mod_title, m.slug as mod_slug,
               ru.username as rejected_by_username, ru.display_name as rejected_by_display_name
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN mods m ON c.mod_id = m.id
        LEFT JOIN users ru ON c.rejected_by = ru.id
        WHERE c.is_approved = FALSE AND c.rejection_reason IS NOT NULL
        ORDER BY c.rejected_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
      
      const result = await executeQuery(sql, [limit, offset]);
      
      return result.map(comment => ({
        ...comment,
        status: 'rejected'
      }));
    } catch (error) {
      logError('Erro ao buscar comentários rejeitados', error);
      throw error;
    }
  }

  // Aprovar comentário
  static async approveComment(commentId, moderatorId) {
    try {
      const sql = `UPDATE comments SET is_approved = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [commentId]);
      
      // Incrementar contador de comentários no mod
      const comment = await this.findById(commentId);
      if (comment) {
        await executeQuery(
          'UPDATE mods SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = ?',
          [comment.mod_id]
        );
      }
      
      logInfo('Comentário aprovado', { commentId, moderatorId });
      return true;
    } catch (error) {
      logError('Erro ao aprovar comentário', error, { commentId, moderatorId });
      throw error;
    }
  }

  // Rejeitar comentário
  static async rejectComment(commentId, moderatorId, reason) {
    try {
      const sql = `UPDATE comments SET is_approved = FALSE, rejection_reason = ?, rejected_at = CURRENT_TIMESTAMP, rejected_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [reason, moderatorId, commentId]);
      
      logInfo('Comentário rejeitado', { commentId, moderatorId, reason });
      return true;
    } catch (error) {
      logError('Erro ao rejeitar comentário', error, { commentId, moderatorId, reason });
      throw error;
    }
  }

  // Deletar comentário (apenas autor ou admin)
  static async deleteComment(commentId, userId, userRole) {
    try {
      // Verificar se pode deletar
      const comment = await this.findById(commentId);
      if (!comment) {
        throw new Error('Comentário não encontrado');
      }
      
      const canDelete = userId === comment.user_id || ['admin', 'super_admin'].includes(userRole);
      if (!canDelete) {
        throw new Error('Sem permissão para deletar este comentário');
      }
      
      // Deletar votos primeiro
      await executeQuery('DELETE FROM comment_votes WHERE comment_id = ?', [commentId]);
      
      // Deletar comentário
      const sql = 'DELETE FROM comments WHERE id = ?';
      await executeQuery(sql, [commentId]);
      
      // Se o comentário estava aprovado, decrementar contador no mod
      if (comment.is_approved) {
        await executeQuery(
          'UPDATE mods SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0) WHERE id = ?',
          [comment.mod_id]
        );
      }
      
      logInfo('Comentário deletado', { commentId, userId, userRole });
      return true;
    } catch (error) {
      logError('Erro ao deletar comentário', error, { commentId, userId, userRole });
      throw error;
    }
  }

  static async findById(id) {
    await this.ensureTables();
    const sql = `
      SELECT c.id, c.content, c.created_at, c.mod_id, c.user_id, c.is_approved,
             c.like_count, c.dislike_count,
             u.username, u.display_name, u.avatar_url
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = ?
    `;
    const rows = await executeQuery(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async listByMod(modId, limit = 100) {
    await this.ensureTables();
    const sql = `
      SELECT c.id, c.content, c.created_at, c.mod_id, c.user_id, 
             c.like_count, c.dislike_count,
             u.username, u.display_name, u.avatar_url
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.mod_id = ?
      ORDER BY c.created_at DESC
      LIMIT ${Number(limit)}
    `;
    return executeQuery(sql, [modId, parseInt(limit)]);
  }

  static async listByUser(userId, limit = 50) {
    await this.ensureTables();
    const sql = `
      SELECT c.id, c.content, c.created_at, c.mod_id
      FROM comments c
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
      LIMIT ${Number(limit)}
    `;
    return executeQuery(sql, [userId, parseInt(limit)]);
  }

  static async countByUser(userId) {
    await this.ensureTables();
    const sql = `SELECT COUNT(*) AS total FROM comments WHERE user_id = ?`;
    const rows = await executeQuery(sql, [userId]);
    return rows[0]?.total || 0;
  }

  static async countRecentByUser(userId, windowSeconds = 30) {
    await this.ensureTables();
    const sql = `
      SELECT COUNT(*) AS total
      FROM comments
      WHERE user_id = ? AND created_at >= (NOW() - INTERVAL ? SECOND)
    `;
    const rows = await executeQuery(sql, [userId, windowSeconds]);
    return rows[0]?.total || 0;
  }

  // Verificar se usuário está em timeout
  static async isUserInTimeout(userId) {
    await this.ensureTables();
    const sql = `
      SELECT id, reason, severity, timeout_until, 
             TIMESTAMPDIFF(SECOND, NOW(), timeout_until) as remaining_seconds
      FROM user_timeouts 
      WHERE user_id = ? AND timeout_until > NOW()
      ORDER BY timeout_until DESC 
      LIMIT 1
    `;
    const rows = await executeQuery(sql, [userId]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Aplicar timeout ao usuário
  static async applyUserTimeout(userId, reason, severity = 'medium', durationMinutes = 30) {
    await this.ensureTables();
    const sql = `
      INSERT INTO user_timeouts (user_id, reason, severity, timeout_until) 
      VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
    `;
    await executeQuery(sql, [userId, reason, severity, durationMinutes]);
  }

  // Verificar se texto contém palavras proibidas
  static async containsForbiddenWords(text) {
    await this.ensureTables();
    if (!text || typeof text !== 'string') return null;

    const words = text.toLowerCase().split(/\s+/);
    const sql = `
      SELECT word, severity 
      FROM forbidden_words 
      WHERE word IN (${words.map(() => '?').join(',')})
    `;
    
    const forbiddenWords = await executeQuery(sql, words);
    return forbiddenWords.length > 0 ? forbiddenWords : null;
  }

  // Gerenciar palavras proibidas (admin)
  static async addForbiddenWord(word, severity = 'medium') {
    await this.ensureTables();
    const sql = 'INSERT INTO forbidden_words (word, severity) VALUES (?, ?) ON DUPLICATE KEY UPDATE severity = ?';
    await executeQuery(sql, [word.toLowerCase(), severity, severity]);
  }

  static async removeForbiddenWord(word) {
    await this.ensureTables();
    const sql = 'DELETE FROM forbidden_words WHERE word = ?';
    await executeQuery(sql, [word.toLowerCase()]);
  }

  static async listForbiddenWords() {
    await this.ensureTables();
    const sql = 'SELECT * FROM forbidden_words ORDER BY severity DESC, word ASC';
    return executeQuery(sql, []);
  }

  // Limpar timeouts expirados
  static async cleanupExpiredTimeouts() {
    await this.ensureTables();
    const sql = 'DELETE FROM user_timeouts WHERE timeout_until <= NOW()';
    await executeQuery(sql, []);
  }

  // =====================================================
  // SISTEMA DE VOTOS
  // =====================================================

  // Votar em um comentário
  static async vote(commentId, userId, voteType) {
    await this.ensureTables();
    
    try {
      // Verificar se o usuário já votou neste comentário
      const existingVote = await executeQuery(
        'SELECT id, vote_type FROM comment_votes WHERE comment_id = ? AND user_id = ?',
        [commentId, userId]
      );

      if (existingVote.length > 0) {
        const currentVote = existingVote[0];
        
        if (currentVote.vote_type === voteType) {
          // Remover voto se for o mesmo tipo
          await executeQuery(
            'DELETE FROM comment_votes WHERE id = ?',
            [currentVote.id]
          );
          
          // Atualizar contadores
          if (voteType === 'upvote') {
            await executeQuery(
              'UPDATE comments SET like_count = GREATEST(0, like_count - 1) WHERE id = ?',
              [commentId]
            );
          } else {
            await executeQuery(
              'UPDATE comments SET dislike_count = GREATEST(0, dislike_count - 1) WHERE id = ?',
              [commentId]
            );
          }
          
          return { action: 'removed', voteType };
        } else {
          // Mudar tipo de voto
          await executeQuery(
            'UPDATE comment_votes SET vote_type = ? WHERE id = ?',
            [voteType, currentVote.id]
          );
          
          // Atualizar contadores
          if (voteType === 'upvote') {
            await executeQuery(
              'UPDATE comments SET like_count = like_count + 1, dislike_count = GREATEST(0, dislike_count - 1) WHERE id = ?',
              [commentId]
            );
          } else {
            await executeQuery(
              'UPDATE comments SET dislike_count = dislike_count + 1, like_count = GREATEST(0, like_count - 1) WHERE id = ?',
              [commentId]
            );
          }
          
          return { action: 'changed', voteType, previousVote: currentVote.vote_type };
        }
      } else {
        // Novo voto
        const voteId = crypto.randomUUID();
        await executeQuery(
          'INSERT INTO comment_votes (id, comment_id, user_id, vote_type) VALUES (?, ?, ?, ?)',
          [voteId, commentId, userId, voteType]
        );
        
        // Atualizar contadores
        if (voteType === 'upvote') {
          await executeQuery(
            'UPDATE comments SET like_count = like_count + 1 WHERE id = ?',
            [commentId]
          );
        } else {
          await executeQuery(
            'UPDATE comments SET dislike_count = dislike_count + 1 WHERE id = ?',
            [commentId]
          );
        }
        
        return { action: 'added', voteType };
      }
    } catch (error) {
      logError('Erro ao votar no comentário', error, { commentId, userId, voteType });
      throw error;
    }
  }

  // Obter voto do usuário em um comentário
  static async getUserVote(commentId, userId) {
    await this.ensureTables();
    
    try {
      const result = await executeQuery(
        'SELECT vote_type FROM comment_votes WHERE comment_id = ? AND user_id = ?',
        [commentId, userId]
      );
      
      return result.length > 0 ? result[0].vote_type : null;
    } catch (error) {
      logError('Erro ao obter voto do usuário', error, { commentId, userId });
      return null;
    }
  }

  // Atualizar listByMod para incluir informações de voto do usuário atual
  static async listByModWithUserVotes(modId, userId = null, limit = 100) {
    await this.ensureTables();
    
    try {
      let sql = `
        SELECT c.id, c.content, c.created_at, c.mod_id, c.user_id, 
               c.like_count, c.dislike_count,
               u.username, u.display_name, u.avatar_url
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.mod_id = ?
        ORDER BY c.created_at DESC
        LIMIT ${Number(limit)}
      `;
      
      const comments = await executeQuery(sql, [modId, parseInt(limit)]);
      
      // Se o usuário estiver logado, adicionar informações de voto
      if (userId) {
        for (const comment of comments) {
          comment.user_vote = await this.getUserVote(comment.id, userId);
        }
      }
      
      return comments;
    } catch (error) {
      logError('Erro ao listar comentários com votos', error, { modId, userId });
      throw error;
    }
  }

  // Criar resposta de comentário
  static async createReply(commentData) {
    try {
      const { 
        modId, 
        userId, 
        parentId, 
        content, 
        replyToUserId 
      } = commentData;

      const id = crypto.randomUUID();
      
      const sql = `
        INSERT INTO comments (
          id, mod_id, user_id, parent_id, content, 
          is_reply, reply_to_user_id, is_approved, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, TRUE, ?, TRUE, NOW(), NOW())
      `;

      const params = [id, modId, userId, parentId, content, replyToUserId];
      
      await executeQuery(sql, params);
      
      logInfo('Resposta de comentário criada', { 
        replyId: id, 
        parentId, 
        userId, 
        modId 
      });

      return await this.findById(id);
    } catch (error) {
      logError('Erro ao criar resposta de comentário', error, commentData);
      throw error;
    }
  }

  // Buscar respostas de um comentário específico
  static async findRepliesByParentId(parentId) {
    try {
      const sql = `
        SELECT 
          c.*,
          u.username,
          u.display_name,
          u.avatar_url,
          u.role as user_role,
          ru.username as reply_to_username,
          ru.display_name as reply_to_display_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN users ru ON c.reply_to_user_id = ru.id
        WHERE c.parent_id = ? AND c.is_approved = TRUE
        ORDER BY c.created_at ASC
      `;

      const replies = await executeQuery(sql, [parentId]);
      return replies;
    } catch (error) {
      logError('Erro ao buscar respostas de comentário', error, { parentId });
      throw error;
    }
  }

  // Buscar comentários por mod com respostas organizadas hierarquicamente
  static async findByModIdWithReplies(modId, userId = null) {
    try {
      let sql = `
        SELECT 
          c.id, c.content, c.rating, c.created_at, c.mod_id, c.user_id, c.is_approved, 
          c.like_count, c.dislike_count, c.rejection_reason, c.rejected_at, c.rejected_by,
          c.parent_id, c.is_reply, c.reply_to_user_id,
          u.username, u.display_name, u.avatar_url, u.role,
          ru.username as reply_to_username, ru.display_name as reply_to_display_name,
          cv.vote_type as user_vote
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN users ru ON c.reply_to_user_id = ru.id
        LEFT JOIN comment_votes cv ON c.id = cv.comment_id AND cv.user_id = ?
        WHERE c.mod_id = ? AND c.is_approved = TRUE AND u.is_banned = 0
        ORDER BY c.created_at ASC
      `;
      
      const params = [userId, modId];
      const allComments = await executeQuery(sql, params);
      
      // Organizar hierarquicamente
      return this.organizeCommentsHierarchy(allComments);
    } catch (error) {
      logError('Erro ao buscar comentários com respostas', error, { modId, userId });
      throw error;
    }
  }

  // Organizar comentários em hierarquia (comentários principais e suas respostas)
  static organizeCommentsHierarchy(comments) {
    const commentMap = new Map();
    const rootComments = [];

    // Primeiro, mapear todos os comentários
    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    // Depois, organizar hierarquicamente
    comments.forEach(comment => {
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        // É uma resposta
        commentMap.get(comment.parent_id).replies.push(comment);
      } else {
        // É um comentário principal
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  // Buscar comentários recentes aprovados para moderação
  static async findRecentApprovedComments(limit = 50, offset = 0) {
    await this.ensureTables();
    
    try {
      const sql = `
        SELECT 
          c.id, c.content, c.rating, c.created_at, c.mod_id, c.user_id, c.is_approved,
          c.like_count, c.dislike_count, c.rejection_reason, c.rejected_at, c.rejected_by,
          u.username, u.display_name, u.avatar_url, u.role,
          m.title as mod_title, m.slug as mod_slug
        FROM comments c
        JOIN users u ON c.user_id = u.id
        JOIN mods m ON c.mod_id = m.id
        WHERE c.is_approved = TRUE
        ORDER BY c.created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
      
      const comments = await executeQuery(sql, [parseInt(limit), parseInt(offset)]);
      return comments;
    } catch (error) {
      logError('Erro ao buscar comentários recentes aprovados', error, { limit, offset });
      throw error;
    }
  }

  // Buscar comentários do usuário com paginação e filtros
  static async getUserComments({ userId, offset = 0, limit = 10, search = '', dateCondition = '' }) {
    await this.ensureTables();
    
    try {
      let whereClause = 'WHERE c.user_id = ?';
      let params = [userId];
      
      // Adicionar filtro de busca
      if (search && search.trim()) {
        whereClause += ' AND c.content LIKE ?';
        params.push(`%${search.trim()}%`);
      }
      
      // Adicionar filtro de data
      if (dateCondition) {
        whereClause += ` ${dateCondition}`;
      }
      
      const sql = `
        SELECT 
          c.id, c.content, c.rating, c.created_at, c.mod_id, c.user_id, c.is_approved,
          c.like_count, c.dislike_count, c.rejection_reason, c.rejected_at, c.rejected_by,
          m.title as mod_title, m.slug as mod_slug, m.thumbnail_url as mod_thumbnail
        FROM comments c
        LEFT JOIN mods m ON c.mod_id = m.id
        ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
      
      // Parâmetros LIMIT e OFFSET já foram aplicados na query
      const comments = await executeQuery(sql, params);
      return comments;
    } catch (error) {
      logError('Erro ao buscar comentários do usuário', error, { userId, offset, limit, search });
      throw error;
    }
  }

  // Contar comentários do usuário
  static async getUserCommentsCount({ userId, search = '', dateCondition = '' }) {
    await this.ensureTables();
    
    try {
      let whereClause = 'WHERE c.user_id = ?';
      let params = [userId];
      
      // Adicionar filtro de busca
      if (search && search.trim()) {
        whereClause += ' AND c.content LIKE ?';
        params.push(`%${search.trim()}%`);
      }
      
      // Adicionar filtro de data
      if (dateCondition) {
        whereClause += ` ${dateCondition}`;
      }
      
      const sql = `SELECT COUNT(*) as total FROM comments c ${whereClause}`;
      const result = await executeQuery(sql, params);
      return result[0]?.total || 0;
    } catch (error) {
      logError('Erro ao contar comentários do usuário', error, { userId, search });
      throw error;
    }
  }
}


