import { executeQuery } from '../config/database.js';
import { logInfo, logError } from '../config/logger.js';
import encryptionService from './EncryptionService.js';

export class LogService {

  static async ensureTable() {
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NULL,
          action VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          level VARCHAR(20) NOT NULL DEFAULT 'info',
          details TEXT,
          ip_address VARCHAR(45) NULL,
          user_agent TEXT NULL,
          resource_id VARCHAR(36) NULL,
          resource_type VARCHAR(50) NULL,
          metadata LONGTEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_category (category),
          INDEX idx_level (level),
          INDEX idx_created_at (created_at),
          INDEX idx_resource (resource_id, resource_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await executeQuery(sql, []);
      logInfo('Tabela activity_logs verificada/criada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar/verificar tabela activity_logs:', error);
      logError('Erro ao criar/verificar tabela activity_logs', error);
    }
  }

  static async createLog(logData) {
    try {
      await this.ensureTable();

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
      
      if (!action || !category) {
        console.error('❌ Dados inválidos para criar log:', { action, category });
        return false;
      }
      
      const sql = `
        INSERT INTO activity_logs (
          id, user_id, action, category, level, details, ip_address, user_agent, 
          resource_id, resource_type, metadata, created_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      let metadataStr = null;
      try {
        metadataStr = metadata ? JSON.stringify(metadata) : null;
      } catch (jsonError) {
        console.error('❌ Erro ao serializar metadata:', jsonError);
        metadataStr = JSON.stringify({ error: 'Erro ao serializar metadata' });
      }
      
      const params = [
        userId || null, 
        action, 
        category, 
        level, 
        details || '', 
        ip || null, 
        userAgent || null, 
        resourceId || null, 
        resourceType || null, 
        metadataStr
      ];
      
      await executeQuery(sql, params);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar log de atividade:', error.message);
      console.error('Stack:', error.stack);
      console.error('Dados do log:', JSON.stringify(logData, null, 2));
      return false;
    }
  }

  static createLogAsync(logData) {
    setImmediate(() => {
      this.createLog(logData).catch(err => {
        console.error('❌ Erro assíncrono ao criar log:', err);
      });
    });
  }

  static async getLogs(filters = {}) {
    try {
      await this.ensureTable();
      
      let countSql = `
        SELECT COUNT(*) as total
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
      `;
      
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
      const countParams = [];
      
      const hasRoleFilter = filters.roleFilter && (filters.roleFilter === 'admin' || filters.roleFilter === 'all');
      const categoryFilter = filters.category && filters.category !== 'all' ? filters.category : null;
      
      if (filters.level && filters.level !== 'all') {
        sql += ' AND al.level = ?';
        countSql += ' AND al.level = ?';
        params.push(filters.level);
        countParams.push(filters.level);
      }
      
      if (filters.search) {
        sql += ' AND (al.action LIKE ? OR al.details LIKE ?)';
        countSql += ' AND (al.action LIKE ? OR al.details LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
        countParams.push(searchTerm, searchTerm);
      }
      
      if (filters.userId) {
        sql += ' AND al.user_id = ?';
        countSql += ' AND al.user_id = ?';
        params.push(filters.userId);
        countParams.push(filters.userId);
      }
      
      if (filters.resourceType && filters.resourceType !== 'all') {
        sql += ' AND al.resource_type = ?';
        countSql += ' AND al.resource_type = ?';
        params.push(filters.resourceType);
        countParams.push(filters.resourceType);
      }
      
      if (filters.resourceId) {
        sql += ' AND al.resource_id = ?';
        countSql += ' AND al.resource_id = ?';
        params.push(filters.resourceId);
        countParams.push(filters.resourceId);
      }
      
      if (hasRoleFilter && filters.roleFilter === 'admin') {
        let adminCondition = `(
          al.user_id IS NULL
          OR al.category IN ('admin', 'security', 'system')
          OR (
            al.category IN ('mods', 'comments', 'users')
            AND (
              al.action IN (
                'Mod deletado', 'Mod criado', 'Mod atualizado', 'Status do mod alterado',
                'Comentário rejeitado', 'Comentário aprovado',
                'Lista de usuários visualizada', 'Usuário banido', 'Usuário desbanido'
              )
              OR al.action LIKE '%rejeitado%'
              OR al.action LIKE '%aprovado%'
              OR al.action LIKE '%banido%'
              OR al.action LIKE '%desbanido%'
              OR al.action LIKE '%Status do mod alterado%'
              OR al.details LIKE '%Status de publica%do mod%alterado%'
              OR al.details LIKE '%Status de arquivamento%do mod%alterado%'
              OR al.details LIKE '%Status de destaque%do mod%alterado%'
              OR al.details LIKE '%consultou lista completa de usuários%'
              OR al.details LIKE '%Administrador%'
            )
          )
          OR (
            al.category = 'auth'
            AND (
              al.action LIKE '%Tentativa%'
              OR al.action LIKE '%sem permissão%'
              OR al.action LIKE '%banida%'
              OR al.details LIKE '%rota administrativa%'
              OR al.details LIKE '%rota protegida%'
              OR al.details LIKE '%sem permissão%'
              OR al.details LIKE '%escalação de privilégios%'
            )
          )
          OR al.action LIKE '%Tentativa de%'
          OR al.action LIKE '%Sistema inicializado%'
          OR al.details LIKE '%rota administrativa%'
          OR al.details LIKE '%rota protegida%'
          OR al.details LIKE '%escalação de privilégios%'
        )`;
        
        sql += ` AND ${adminCondition}`;
        countSql += ` AND ${adminCondition}`;
        
        if (categoryFilter) {
          if (categoryFilter === 'mods') {
            sql += ` AND al.category = 'mods'
              AND (
                al.action IN ('Mod deletado', 'Mod criado', 'Mod atualizado', 'Status do mod alterado')
                OR al.action LIKE '%Status do mod alterado%'
                OR al.details LIKE '%Status de publica%do mod%alterado%'
                OR al.details LIKE '%Status de arquivamento%do mod%alterado%'
                OR al.details LIKE '%Status de destaque%do mod%alterado%'
              )`;
            countSql += ` AND al.category = 'mods'
              AND (
                al.action IN ('Mod deletado', 'Mod criado', 'Mod atualizado', 'Status do mod alterado')
                OR al.action LIKE '%Status do mod alterado%'
                OR al.details LIKE '%Status de publica%do mod%alterado%'
                OR al.details LIKE '%Status de arquivamento%do mod%alterado%'
                OR al.details LIKE '%Status de destaque%do mod%alterado%'
              )`;
          } else if (categoryFilter === 'comments') {
            sql += ` AND al.category = 'comments'
              AND (
                al.action IN ('Comentário rejeitado', 'Comentário aprovado')
                OR al.action LIKE '%rejeitado%'
                OR al.action LIKE '%aprovado%'
              )`;
            countSql += ` AND al.category = 'comments'
              AND (
                al.action IN ('Comentário rejeitado', 'Comentário aprovado')
                OR al.action LIKE '%rejeitado%'
                OR al.action LIKE '%aprovado%'
              )`;
          } else if (categoryFilter === 'users') {
            sql += ` AND al.category = 'users'
              AND (
                al.action IN ('Lista de usuários visualizada', 'Usuário banido', 'Usuário desbanido')
                OR al.action LIKE '%banido%'
                OR al.action LIKE '%desbanido%'
                OR al.details LIKE '%consultou lista completa de usuários%'
                OR al.details LIKE '%Administrador%'
              )`;
            countSql += ` AND al.category = 'users'
              AND (
                al.action IN ('Lista de usuários visualizada', 'Usuário banido', 'Usuário desbanido')
                OR al.action LIKE '%banido%'
                OR al.action LIKE '%desbanido%'
                OR al.details LIKE '%consultou lista completa de usuários%'
                OR al.details LIKE '%Administrador%'
              )`;
          } else if (categoryFilter === 'auth') {
            sql += ` AND al.category = 'auth'
              AND (
                al.action LIKE '%Tentativa%'
                OR al.action LIKE '%sem permissão%'
                OR al.action LIKE '%banida%'
                OR al.details LIKE '%rota administrativa%'
                OR al.details LIKE '%rota protegida%'
                OR al.details LIKE '%sem permissão%'
                OR al.details LIKE '%escalação de privilégios%'
              )`;
            countSql += ` AND al.category = 'auth'
              AND (
                al.action LIKE '%Tentativa%'
                OR al.action LIKE '%sem permissão%'
                OR al.action LIKE '%banida%'
                OR al.details LIKE '%rota administrativa%'
                OR al.details LIKE '%rota protegida%'
                OR al.details LIKE '%sem permissão%'
                OR al.details LIKE '%escalação de privilégios%'
              )`;
          } else if (['admin', 'security', 'system'].includes(categoryFilter)) {
            sql += ` AND al.category = ?`;
            countSql += ` AND al.category = ?`;
            params.push(categoryFilter);
            countParams.push(categoryFilter);
          } else {
            sql += ` AND al.category = ?`;
            countSql += ` AND al.category = ?`;
            params.push(categoryFilter);
            countParams.push(categoryFilter);
          }
        } else {
          sql += ` AND al.category NOT IN ('favorites', 'downloads')
            AND al.action NOT IN (
              'Mod favoritado', 'Mod desfavoritado', 'Mod baixado',
              'Novo comentário criado', 'Comentário deletado',
              'Login realizado', 'Logout realizado', 'Conta criada',
              'Email verificado', 'Perfil atualizado', 'Senha alterada',
              'Nome de usuário alterado', 'Nome de exibição alterado',
              'Email alterado', 'Avatar atualizado'
            )`;
          countSql += ` AND al.category NOT IN ('favorites', 'downloads')
            AND al.action NOT IN (
              'Mod favoritado', 'Mod desfavoritado', 'Mod baixado',
              'Novo comentário criado', 'Comentário deletado',
              'Login realizado', 'Logout realizado', 'Conta criada',
              'Email verificado', 'Perfil atualizado', 'Senha alterada',
              'Nome de usuário alterado', 'Nome de exibição alterado',
              'Email alterado', 'Avatar atualizado'
            )`;
        }
      } else if (hasRoleFilter && filters.roleFilter === 'all') {
        let userCondition = `al.user_id IS NOT NULL
          AND (
            (al.category = 'favorites' AND al.action IN ('Mod favoritado', 'Mod desfavoritado'))
            OR (al.category = 'downloads' AND al.action LIKE '%baixado%')
            OR (al.category = 'comments' AND al.action IN ('Novo comentário criado', 'Comentário deletado'))
            OR (al.category = 'auth' AND al.action IN ('Login realizado', 'Logout realizado', 'Conta criada', 'Email verificado'))
            OR (al.category = 'users' AND al.action IN ('Perfil atualizado', 'Senha alterada', 'Nome de usuário alterado', 'Nome de exibição alterado', 'Email alterado', 'Avatar atualizado'))
          )
          AND al.category NOT IN ('admin', 'security', 'system')
          AND al.action NOT LIKE '%rejeitado%'
          AND al.action NOT LIKE '%aprovado%'
          AND al.action NOT LIKE '%banido%'
          AND al.action NOT LIKE '%desbanido%'
          AND al.action NOT LIKE '%Tentativa%'
          AND al.action NOT LIKE '%Sistema%'
          AND al.action NOT IN (
            'Mod deletado', 'Mod criado', 'Mod atualizado', 'Status do mod alterado',
            'Lista de usuários visualizada', 'Comentário rejeitado', 'Comentário aprovado',
            'Usuário banido', 'Usuário desbanido', 'Solicitação de exclusão de conta',
            'Conta excluída permanentemente', 'Acesso a rota protegida', 'Sistema inicializado'
          )
          AND al.details NOT LIKE '%Administrador%'
          AND al.details NOT LIKE '%rota administrativa%'
          AND al.details NOT LIKE '%rota protegida%'
          AND al.details NOT LIKE '%sem permissão%'
          AND al.details NOT LIKE '%consultou lista completa de usuários%'
          AND al.details NOT LIKE '%Status de%'`;
        
        sql += ` AND ${userCondition}`;
        countSql += ` AND ${userCondition}`;
        
        if (categoryFilter) {
          if (categoryFilter === 'favorites') {
            sql += ` AND al.category = 'favorites' AND al.action IN ('Mod favoritado', 'Mod desfavoritado')`;
            countSql += ` AND al.category = 'favorites' AND al.action IN ('Mod favoritado', 'Mod desfavoritado')`;
          } else if (categoryFilter === 'downloads') {
            sql += ` AND al.category = 'downloads' AND al.action LIKE '%baixado%'`;
            countSql += ` AND al.category = 'downloads' AND al.action LIKE '%baixado%'`;
          } else if (categoryFilter === 'comments') {
            sql += ` AND al.category = 'comments' AND al.action IN ('Novo comentário criado', 'Comentário deletado')`;
            countSql += ` AND al.category = 'comments' AND al.action IN ('Novo comentário criado', 'Comentário deletado')`;
          } else if (categoryFilter === 'auth') {
            sql += ` AND al.category = 'auth' AND al.action IN ('Login realizado', 'Logout realizado', 'Conta criada', 'Email verificado')`;
            countSql += ` AND al.category = 'auth' AND al.action IN ('Login realizado', 'Logout realizado', 'Conta criada', 'Email verificado')`;
          } else if (categoryFilter === 'users') {
            sql += ` AND al.category = 'users' AND al.action IN ('Perfil atualizado', 'Senha alterada', 'Nome de usuário alterado', 'Nome de exibição alterado', 'Email alterado', 'Avatar atualizado')`;
            countSql += ` AND al.category = 'users' AND al.action IN ('Perfil atualizado', 'Senha alterada', 'Nome de usuário alterado', 'Nome de exibição alterado', 'Email alterado', 'Avatar atualizado')`;
          } else {
            sql += ` AND 1=0`;
            countSql += ` AND 1=0`;
          }
        }
      } else if (categoryFilter) {
        sql += ' AND al.category = ?';
        countSql += ' AND al.category = ?';
        params.push(categoryFilter);
        countParams.push(categoryFilter);
      }
      
      if (filters.dateFrom) {
        sql += ' AND al.created_at >= ?';
        countSql += ' AND al.created_at >= ?';
        params.push(filters.dateFrom);
        countParams.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        sql += ' AND al.created_at <= ?';
        countSql += ' AND al.created_at <= ?';
        params.push(filters.dateTo);
        countParams.push(filters.dateTo);
      }
      
      sql += ' ORDER BY al.created_at DESC';
      
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 25;
      const offset = (page - 1) * limit;
      
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
      
      let logs = [];
      let countResult = [];
      
      try {
        [logs, countResult] = await Promise.all([
          executeQuery(sql, params),
          executeQuery(countSql, countParams)
        ]);
      } catch (queryError) {
        console.error('❌ Erro na query SQL:', queryError);
        console.error('❌ SQL:', sql);
        console.error('❌ Params:', params);
        console.error('❌ CountSQL:', countSql);
        console.error('❌ CountParams:', countParams);
        
        logs = [];
        countResult = [{ total: 0 }];
      }
      
      const total = countResult && countResult[0] ? parseInt(countResult[0].total) : 0;
      const totalPages = Math.ceil(total / limit);
      
      const formattedLogs = (logs || []).map(log => {
        let metadata = null;
        if (log.metadata) {
          try {
            metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
          } catch (parseError) {
            console.error('❌ Erro ao parsear metadata do log:', parseError);
            metadata = { error: 'Erro ao parsear metadata' };
          }
        }
        
        let decryptedUsername = log.username;
        let decryptedDisplayName = log.display_name;
        
        if (log.username) {
          try {
            if (encryptionService.isEncrypted(log.username)) {
              decryptedUsername = encryptionService.decrypt(log.username);
            }
          } catch (error) {
            console.error('❌ Erro ao descriptografar username no log:', error);
          }
        }
        
        if (log.display_name) {
          try {
            if (encryptionService.isEncrypted(log.display_name)) {
              decryptedDisplayName = encryptionService.decrypt(log.display_name);
            }
          } catch (error) {
            console.error('❌ Erro ao descriptografar display_name no log:', error);
          }
        }
        
        let createdAt = log.created_at;
        if (createdAt) {
          if (createdAt instanceof Date) {
            createdAt = createdAt.toISOString();
          } else if (typeof createdAt === 'string') {
            let dateStr = createdAt.trim();
            if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
              dateStr = dateStr.replace(' ', 'T') + 'Z';
            } else if (dateStr.includes('T') && !dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-', 11)) {
              dateStr = dateStr + 'Z';
            }
            try {
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                createdAt = date.toISOString();
              } else {
                console.warn('⚠️ Data inválida do log (não é um número válido):', createdAt);
              }
            } catch (e) {
              console.warn('⚠️ Erro ao processar data do log:', createdAt, e);
            }
          }
        }
        
        return {
          id: log.id,
          action: log.action,
          category: log.category,
          level: log.level,
          details: log.details,
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          created_at: createdAt,
          resource_id: log.resource_id,
          resource_type: log.resource_type,
          metadata: metadata,
          username: decryptedUsername,
          display_name: decryptedDisplayName,
          role: log.role,
          avatar_url: log.avatar_url
        };
      });
      
      return {
        logs: formattedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: totalPages
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar logs:', error);
      console.error('❌ Stack trace:', error.stack);
      console.error('❌ Filtros:', JSON.stringify(filters, null, 2));
      console.error('❌ Error message:', error.message);
      throw error;
    }
  }

  static async logAuth(userId, action, details, ip, userAgent, level = 'info') {
    return this.createLog({
      userId,
      action,
      category: 'auth',
      level,
      details,
      ip,
      userAgent: userAgent
    });
  }

  static async logFailedLogin(ip, userAgent, email, reason, metadata = null) {
    return this.createLog({
      userId: null,
      action: `Login falhado: ${reason}`,
      category: 'auth',
      level: 'warning',
      details: `Tentativa de login falhada para ${email}. Motivo: ${reason}`,
      ip,
      userAgent: userAgent,
      metadata
    });
  }

  static async logPasswordReset(userId, action, details, ip, userAgent) {
    return this.createLog({
      userId,
      action,
      category: 'auth',
      level: 'info',
      details,
      ip,
      userAgent: userAgent
    });
  }

  static async logEmailVerification(userId, action, details, ip, userAgent) {
    return this.createLog({
      userId,
      action,
      category: 'auth',
      level: 'info',
      details,
      ip,
      userAgent: userAgent
    });
  }

  static async logMods(userId, action, details, ip, userAgent, resourceId = null, metadata = null) {
    try {
      return await this.createLog({
        userId,
        action,
        category: 'mods',
        level: 'info',
        details,
        ip,
        userAgent: userAgent,
        resourceId: resourceId,
        resourceType: 'mod',
        metadata
      });
    } catch (error) {
      console.error('❌ Erro ao criar log de mod:', error);
      return false;
    }
  }

  static async logDelete(userId, action, details, ip, userAgent, resourceId = null, resourceType = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'warning',
      details,
      ip,
      userAgent: userAgent,
      resourceId: resourceId,
      resourceType: resourceType,
      metadata
    });
  }

  static async logUsers(userId, action, details, ip, userAgent, targetUserId = null, metadata = null) {
    try {
      return await this.createLog({
        userId,
        action,
        category: 'users',
        level: 'info',
        details,
        ip,
        userAgent: userAgent,
        resourceId: targetUserId,
        resourceType: 'user',
        metadata
      });
    } catch (error) {
      console.error('❌ Erro ao criar log de usuário:', error);
      return false;
    }
  }

  static async logComments(userId, action, details, ip, userAgent, commentId = null, modId = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'comments',
      level: 'info',
      details,
      ip,
      userAgent: userAgent,
      resourceId: commentId,
      resourceType: 'comment',
      metadata: { ...metadata, modId }
    });
  }

  static async logModeration(userId, action, details, ip, userAgent, resourceId = null, resourceType = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'info',
      details,
      ip,
      userAgent: userAgent,
      resourceId: resourceId,
      resourceType: resourceType,
      metadata
    });
  }

  static async logFavorites(userId, action, details, ip, userAgent, modId = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'favorites',
      level: 'info',
      details,
      ip,
      userAgent: userAgent,
      resourceId: modId,
      resourceType: 'mod',
      metadata
    });
  }

  static async logDownloads(userId, action, details, ip, userAgent, modId = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'downloads',
      level: 'info',
      details,
      ip,
      userAgent: userAgent,
      resourceId: modId,
      resourceType: 'mod',
      metadata
    });
  }

  static async logAdmin(userId, action, details, ip, userAgent, targetId = null, targetType = null, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'warning',
      details,
      ip,
      userAgent: userAgent,
      resourceId: targetId,
      resourceType: targetType,
      metadata
    });
  }

  static async logSecurity(userId, action, details, ip, userAgent, level = 'warning', metadata = null) {
    try {
      return await this.createLog({
        userId,
        action,
        category: 'security',
        level,
        details,
        ip,
        userAgent: userAgent,
        metadata
      });
    } catch (error) {
      console.error('❌ Erro ao criar log de segurança:', error);
      return false;
    }
  }

  static async logSystem(action, details, level = 'info', metadata = null) {
    try {
      return await this.createLog({
        userId: null,
        action,
        category: 'system',
        level,
        details,
        ip: null,
        userAgent: null,
        metadata
      });
    } catch (error) {
      console.error('❌ Erro ao criar log de sistema:', error);
      return false;
    }
  }

  static async logBan(userId, action, details, ip, userAgent, bannedUserId, reason, duration = null) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'warning',
      details,
      ip,
      userAgent: userAgent,
      resourceId: bannedUserId,
      resourceType: 'user',
      metadata: { reason, duration, action: 'ban' }
    });
  }

  static async logUnban(userId, action, details, ip, userAgent, unbannedUserId) {
    return this.createLog({
      userId,
      action,
      category: 'admin',
      level: 'success',
      details,
      ip,
      userAgent: userAgent,
      resourceId: unbannedUserId,
      resourceType: 'user',
      metadata: { action: 'unban' }
    });
  }

  static async logModView(userId, action, details, ip, userAgent, modId, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'mods',
      level: 'info',
      details,
      ip,
      userAgent: userAgent,
      resourceId: modId,
      resourceType: 'mod',
      metadata: { ...metadata, action: 'view' }
    });
  }

  static async logRating(userId, action, details, ip, userAgent, modId, rating, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'mods',
      level: 'info',
      details,
      ip,
      userAgent: userAgent,
      resourceId: modId,
      resourceType: 'mod',
      metadata: { ...metadata, rating, action: 'rate' }
    });
  }

  static async logProfileChange(userId, action, details, ip, userAgent, changes, metadata = null) {
    return this.createLog({
      userId,
      action,
      category: 'users',
      level: 'info',
      details,
      ip,
      userAgent: userAgent,
      resourceId: userId,
      resourceType: 'user',
      metadata: { ...metadata, changes }
    });
  }

  static async logUnauthorizedAccess(ip, userAgent, path, method, reason, metadata = null) {
    return this.createLog({
      userId: null,
      action: 'Tentativa de acesso não autorizado',
      category: 'security',
      level: 'warning',
      details: `Tentativa de acesso não autorizado: ${method} ${path}. Motivo: ${reason}`,
      ip,
      userAgent: userAgent,
      metadata
    });
  }
}
