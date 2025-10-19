import { executeQuery } from '../config/database.js';
import { logInfo, logError } from '../config/logger.js';

export class LogService {

  // criar a log de atividade
  static async createLog(logData) {
    try {
      const { 
        userId, 
        action, 
        category, 
        level = 'info', 
        details, 
        ip, 
        userAgent, 
        resourceId, 
        resourceType, 
        metadata 
      } = logData;
      
      const sql = `
        INSERT INTO activity_logs (
          id, user_id, action, category, level, details, ip_address, user_agent, 
          resource_id, resource_type, metadata, created_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const params = [
        userId, 
        action, 
        category, 
        level, 
        details, 
        ip, 
        userAgent, 
        resourceId, 
        resourceType, 
        metadata ? JSON.stringify(metadata) : null
      ];
      
      await executeQuery(sql, params);
      
      logInfo('Log de atividade criado', { action, category, userId });
      return true;
    } catch (error) {
      logError('Erro ao criar log de atividade', error, logData);
      return false;
    }
  }

  // buscar logs   
  static async getLogs(filters = {}) {
    try {
      let sql = `
        SELECT 
          al.id, al.action, al.category, al.level, al.details, 
          al.ip_address, al.user_agent, al.created_at,
          al.resource_id, al.resource_type, al.metadata,
          u.username, u.display_name, u.role, u.avatar_url
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // filtros
      if (filters.category && filters.category !== 'all') {
        sql += ' AND al.category = ?';
        params.push(filters.category);
      }
      
      if (filters.level && filters.level !== 'all') {
        sql += ' AND al.level = ?';
        params.push(filters.level);
      }
      
      if (filters.search) {
        sql += ' AND (al.action LIKE ? OR al.details LIKE ? OR u.username LIKE ? OR u.display_name LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      if (filters.userId) {
        sql += ' AND al.user_id = ?';
        params.push(filters.userId);
      }
      
      if (filters.resourceType) {
        sql += ' AND al.resource_type = ?';
        params.push(filters.resourceType);
      }
      
      if (filters.dateFrom) {
        sql += ' AND al.created_at >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        sql += ' AND al.created_at <= ?';
        params.push(filters.dateTo);
      }
      
      // ordenacao 
      sql += ' ORDER BY al.created_at DESC';
      
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }
      
      const logs = await executeQuery(sql, params);
      return logs;
    } catch (error) {
      logError('Erro ao buscar logs', error, filters);
      throw error;
    }
  }

  // log de autenticacao
  static async logAuth(userId, action, details, ip, userAgent, level = 'info') {
    return this.createLog({
      userId,
      action,
      category: 'auth',
      level,
      details,
      ip,
      userAgent
    });
  }

  // log de mods
  static async logMods(userId, action, details, ip, userAgent, resourceId = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'mods',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId,
      resourceType: 'mod',
      metadata
    });
  }

  // log de usuarios
  static async logUsers(userId, action, details, ip, userAgent, targetUserId = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'users',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId: targetUserId,
      resourceType: 'user',
      metadata
    });
  }

  // log de comentarios
  static async logComments(userId, action, details, ip, userAgent, commentId = null, modId = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'comments',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId: commentId,
      resourceType: 'comment',
      metadata: { ...metadata, modId }
    });
  }

  // log de favoritos
  static async logFavorites(userId, action, details, ip, userAgent, modId = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'favorites',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId: modId,
      resourceType: 'mod',
      metadata
    });
  }

  // log de downloads
  static async logDownloads(userId, action, details, ip, userAgent, modId = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'downloads',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId: modId,
      resourceType: 'mod',
      metadata
    });
  }

  // logs  administrativas
  static async logAdmin(userId, action, details, ip, userAgent, targetId = null, targetType = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'warning',
      details,
      ip,
      userAgent,
      resourceId: targetId,
      resourceType: targetType,
      metadata
    });
  }

  // log de seguranca
  static async logSecurity(userId, action, details, ip, userAgent, level = 'warning', metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'security',
      level,
      details,
      ip,
      userAgent,
      metadata
    });
  }

  // log de sistema
  static async logSystem(action, details, level = 'info', metadata = null) {
    return this.createLog({
      userId: null,
      action,
      category: 'system',
      level,
      details,
      ip: null,
      userAgent: null,
      metadata
    });
  }

  // log de banimento de usuarios
  static async logBan(userId, action, details, ip, userAgent, bannedUserId, reason, duration = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'warning',
      details,
      ip,
      userAgent,
      resourceId: bannedUserId,
      resourceType: 'user',
      metadata: { reason, duration, action: 'ban' }
    });
  }

  // log de desbanimento de usuarios
  static async logUnban(userId, action, details, ip, userAgent, unbannedUserId) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'success',
      details,
      ip,
      userAgent,
      resourceId: unbannedUserId,
      resourceType: 'user',
      metadata: { action: 'unban' }
    });
  }

  // log de visualizacoes de mods
  static async logModView(userId, action, details, ip, userAgent, modId, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'mods',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId: modId,
      resourceType: 'mod',
      metadata: { ...metadata, action: 'view' }
    });
  }

  // log de avaliacoes
  static async logRating(userId, action, details, ip, userAgent, modId, rating, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'mods',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId: modId,
      resourceType: 'mod',
      metadata: { ...metadata, rating, action: 'rate' }
    });
  }

  // log de compartilhamentos
  static async logShare(userId, action, details, ip, userAgent, modId, platform, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'mods',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId: modId,
      resourceType: 'mod',
      metadata: { ...metadata, platform, action: 'share' }
    });
  }

  // log de uploads de arquivos
  static async logUpload(userId, action, details, ip, userAgent, fileType, fileSize, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'mods',
      level: 'info',
      details,
      ip,
      userAgent,
      metadata: { ...metadata, fileType, fileSize, action: 'upload' }
    });
  }

  // log de exclusoes
  static async logDelete(userId, action, details, ip, userAgent, resourceId, resourceType, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'warning',
      details,
      ip,
      userAgent,
      resourceId,
      resourceType,
      metadata: { ...metadata, action: 'delete' }
    });
  }

  // log de modificacoes
  static async logModify(userId, action, details, ip, userAgent, resourceId, resourceType, changes, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId,
      resourceType,
      metadata: { ...metadata, changes, action: 'modify' }
    });
  }

  // log de criacao de recursos
  static async logCreate(userId, action, details, ip, userAgent, resourceId, resourceType, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'success',
      details,
      ip,
      userAgent,
      resourceId,
      resourceType,
      metadata: { ...metadata, action: 'create' }
    });
  }

  // log de erros do sistema
  static async logSystemError(action, details, error, metadata = null) {
    return this.createLog({
      userId: null,
      action,
      category: 'system',
      level: 'error',
      details: `${details} - Erro: ${error.message || error}`,
      ip: null,
      userAgent: null,
      metadata: { ...metadata, error: error.stack || error.toString() }
    });
  }

  // log de tentativas de acesso nao autorizado
  static async logUnauthorizedAccess(ip, userAgent, action, details, metadata = null) {
    return this.createLog({
      userId: null,
      action,
      category: 'security',
      level: 'warning',
      details,
      ip,
      userAgent,
      metadata: { ...metadata, type: 'unauthorized_access' }
    });
  }

    // log de tentativas de login falhadas
  static async logFailedLogin(ip, userAgent, username, reason, metadata = null) {
    return this.createLog({
      userId: null,
      action: 'Tentativa de login falhada',
      category: 'security',
      level: 'warning',
      details: `Tentativa de login falhada para usuário: ${username}. Motivo: ${reason}`,
      ip,
      userAgent,
      metadata: { ...metadata, username, reason, type: 'failed_login' }
    });
  }

  // log de alteracoes de perfil
  static async logProfileChange(userId, action, details, ip, userAgent, changes, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'users',
      level: 'info',
      details,
      ip,
      userAgent,
      resourceId: userId,
      resourceType: 'user',
      metadata: { ...metadata, changes, action: 'profile_change' }
    });
  }

  // log de alteracoes de senha
  static async logPasswordChange(userId, action, details, ip, userAgent, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'security',
      level: 'info',
      details,
      ip,
      userAgent,
      metadata: { ...metadata, action: 'password_change' }
    });
  }

  // log de redefinicao de senha
  static async logPasswordReset(userId, action, details, ip, userAgent, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'security',
      level: 'info',
      details,
      ip,
      userAgent,
      metadata: { ...metadata, action: 'password_reset' }
    });
  }

  // log de verificacao de email
  static async logEmailVerification(userId, action, details, ip, userAgent, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'auth',
      level: 'info',
      details,
      ip,
      userAgent,
      metadata: { ...metadata, action: 'email_verification' }
    });
  }

  // log de sessoes
  static async logSession(userId, action, details, ip, userAgent, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'auth',
      level: 'info',
      details,
      ip,
      userAgent,
      metadata: { ...metadata, action: 'session' }
    });
  }

  // log de atividades de moderação
  static async logModeration(userId, action, details, ip, userAgent, targetId, targetType, reason, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'warning',
      details,
      ip,
      userAgent,
      resourceId: targetId,
      resourceType: targetType,
      metadata: { ...metadata, reason, action: 'moderation' }
    });
  }

  // log de atividades de busca
  static async logSearch(userId, action, details, ip, userAgent, query, results, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'system',
      level: 'info',
      details,
      ip,
      userAgent,
      metadata: { ...metadata, query, results, action: 'search' }
    });
  }

  // log de atividades de API
  static async logApi(userId, action, details, ip, userAgent, endpoint, method, statusCode, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'system',
      level: statusCode >= 400 ? 'warning' : 'info',
      details,
      ip,
      userAgent,
      metadata: { ...metadata, endpoint, method, statusCode, action: 'api_call' }
    });
  }
}






