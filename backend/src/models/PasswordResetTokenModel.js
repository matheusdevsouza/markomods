import { executeQuery } from '../config/database.js';
import { logError, logInfo } from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class PasswordResetTokenModel {

  // criar token de reset com segurança (mais segurança do que ja tem)
  static async create(userId, ipAddress = null, userAgent = null) {
    try {
      const existingToken = await this.findActiveTokenByUserId(userId);
      if (existingToken) {
        await this.markAsUsed(existingToken.id);
      }

      const id = uuidv4();
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 
      
      const sql = `
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at, ip_address, user_agent, attempts)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `;
      
      await executeQuery(sql, [id, userId, token, expiresAt, ipAddress, userAgent]);
      
      logInfo('Token de reset criado', { userId, tokenId: id, ipAddress });
      
      return {
        id,
        token,
        expiresAt
      };
    } catch (error) {
      logError('Erro ao criar token de reset', error, { userId });
      throw error;
    }
  }

  // buscar token pelo valor
  static async findByToken(token) {
    try {
      const sql = `
        SELECT prt.*, u.email, u.username
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = ? AND prt.used_at IS NULL
      `;
      
      const tokens = await executeQuery(sql, [token]);
      return tokens[0] || null;
    } catch (error) {
      logError('Erro ao buscar token de reset', error, { token });
      throw error;
    }
  }

  // marcar token como usado
  static async markAsUsed(tokenId) {
    try {
      const sql = `UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [tokenId]);
      
      logInfo('Token de reset marcado como usado', { tokenId });
      return true;
    } catch (error) {
      logError('Erro ao marcar token como usado', error, { tokenId });
      throw error;
    }
  }

  // limpar tokens expirados
  static async cleanExpiredTokens() {
    try {
      const sql = `DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP`;
      const result = await executeQuery(sql);
      
      if (result.affectedRows > 0) {
        logInfo('Tokens expirados removidos', { count: result.affectedRows });
      }
      
      return result.affectedRows;
    } catch (error) {
      logError('Erro ao limpar tokens expirados', error);
      throw error;
    }
  }

  // verificar se token é válido
  static async isValidToken(token) {
    try {
      const tokenData = await this.findByToken(token);
      
      if (!tokenData) {
        return false;
      }
      
      if (new Date() > new Date(tokenData.expires_at)) {
        return false;
      }
      
      if (tokenData.used_at) {
        return false;
      }
      
      return true;
    } catch (error) {
      logError('Erro ao verificar validade do token', error, { token });
      return false;
    }
  }

  // remover um token específico
  static async removeToken(tokenId) {
    try {
      const sql = `DELETE FROM password_reset_tokens WHERE id = ?`;
      await executeQuery(sql, [tokenId]);
      
      logInfo('Token de reset removido', { tokenId });
      return true;
    } catch (error) {
      logError('Erro ao remover token', error, { tokenId });
      throw error;
    }
  }

  // remover todos os tokens de um usuário
  static async removeUserTokens(userId) {
    try {
      const sql = `DELETE FROM password_reset_tokens WHERE user_id = ?`;
      await executeQuery(sql, [userId]);
      
      logInfo('Todos os tokens de reset do usuário removidos', { userId });
      return true;
    } catch (error) {
      logError('Erro ao remover tokens do usuário', error, { userId });
      throw error;
    }
  }

  // buscar token ativo por usuário
  static async findActiveTokenByUserId(userId) {
    try {
      const sql = `
        SELECT * FROM password_reset_tokens 
        WHERE user_id = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const tokens = await executeQuery(sql, [userId]);
      return tokens[0] || null;
    } catch (error) {
      logError('Erro ao buscar token ativo por usuário', error, { userId });
      throw error;
    }
  }

  // incrementar tentativas de uso do token
  static async incrementAttempts(tokenId) {
    try {
      const sql = `
        UPDATE password_reset_tokens 
        SET attempts = attempts + 1, last_attempt = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      await executeQuery(sql, [tokenId]);
      
      logInfo('Tentativas de token incrementadas', { tokenId });
      return true;
    } catch (error) {
      logError('Erro ao incrementar tentativas do token', error, { tokenId });
      throw error;
    }
  }

  // verificar se token alcançou as tentativas máximas
  static async hasExceededMaxAttempts(tokenId, maxAttempts = 5) {
    try {
      const sql = `
        SELECT attempts FROM password_reset_tokens 
        WHERE id = ?
      `;
      
      const result = await executeQuery(sql, [tokenId]);
      const attempts = result[0]?.attempts || 0;
      
      return attempts >= maxAttempts;
    } catch (error) {
      logError('Erro ao verificar tentativas máximas', error, { tokenId });
      return false;
    }
  }

  // verificar rate limiting por IP
  static async checkRateLimit(ipAddress, maxRequests = 3, windowMinutes = 15) {
    try {
      const windowStart = new Date(Date.now() - (windowMinutes * 60 * 1000));
      
      const sql = `
        SELECT COUNT(*) as count 
        FROM password_reset_tokens 
        WHERE ip_address = ? AND created_at > ?
      `;
      
      const result = await executeQuery(sql, [ipAddress, windowStart]);
      const count = result[0]?.count || 0;
      
      return count < maxRequests;
    } catch (error) {
      logError('Erro ao verificar rate limit', error, { ipAddress });
      return false;
    }
  }

  // limpar tokens expirados e antigos
  static async cleanExpiredAndOldTokens() {
    try {
      const expiredSql = `DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP`;
      const expiredResult = await executeQuery(expiredSql);
      
      const oldSql = `DELETE FROM password_reset_tokens WHERE created_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY)`;
      const oldResult = await executeQuery(oldSql);
      
      const totalRemoved = (expiredResult.affectedRows || 0) + (oldResult.affectedRows || 0);
      
      if (totalRemoved > 0) {
        logInfo('Tokens antigos e expirados removidos', { count: totalRemoved });
      }
      
      return totalRemoved;
    } catch (error) {
      logError('Erro ao limpar tokens antigos', error);
      throw error;
    }
  }

  // obter estatísticas de tokens
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as used,
          COUNT(CASE WHEN used_at IS NULL AND expires_at > CURRENT_TIMESTAMP THEN 1 END) as active,
          COUNT(CASE WHEN expires_at < CURRENT_TIMESTAMP THEN 1 END) as expired
        FROM password_reset_tokens
      `;
      
      const result = await executeQuery(sql);
      return result[0] || { total: 0, used: 0, active: 0, expired: 0 };
    } catch (error) {
      logError('Erro ao obter estatísticas de tokens', error);
      throw error;
    }
  }
}

