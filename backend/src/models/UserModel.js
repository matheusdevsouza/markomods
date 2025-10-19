import { executeQuery, executeTransaction, getConnection } from '../config/database.js';
import { logError, logInfo } from '../config/logger.js';
import bcrypt from 'bcryptjs';

export class UserModel {

  // buscar o usuário por ID
  static async findById(id) {
    try {
      const sql = `
        SELECT id, username, email, password_hash, display_name, avatar_url,
               role, is_verified, is_banned, created_at, updated_at, last_login
        FROM users 
        WHERE id = ?
      `;
      
      const [user] = await executeQuery(sql, [id]);
      
      if (!user) {
        return null;
      }
      
      return user;
    } catch (error) {
      logError('Erro ao buscar usuário por ID', error, { userId: id });
      throw error;
    }
  }

  // buscar o usuário por email
  static async findByEmail(email) {
    try {
      const sql = `
        SELECT id, username, email, password_hash, display_name, avatar_url,
               role, is_verified, is_banned, created_at, updated_at, last_login
        FROM users 
        WHERE email = ?
      `;
      
      const [user] = await executeQuery(sql, [email]);
      
      if (!user) {
        return null;
      }
      
      return user;
    } catch (error) {
      logError('Erro ao buscar usuário por email', error, { email });
      throw error;
    }
  }

  // buscar o usuário por username
  static async findByUsername(username) {
    try {
      const sql = `
        SELECT id, username, email, display_name, avatar_url,
               role, is_verified, is_banned, created_at, updated_at, last_login
        FROM users 
        WHERE username = ?
      `;
      
      const [user] = await executeQuery(sql, [username]);
      
      if (!user) {
        return null;
      }
      
      return user;
    } catch (error) {
      logError('Erro ao buscar usuário por username', error, { username });
      throw error;
    }
  }

  // criar novo usuário
  static async create(userData) {
    try {
      const { id, username, email, password, display_name } = userData;
      
      const passwordHash = await bcrypt.hash(password, 12);
      
      const sql = `
        INSERT INTO users (
          id, username, email, password_hash, display_name,
          role, is_verified, is_banned, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      const params = [
        id, username, email, passwordHash, 
        display_name || null,
        'member', false, false
      ];
      
      await executeQuery(sql, params);
      
      const user = await this.findById(id);
      
      logInfo('Usuário criado com sucesso', { userId: id, username, email });
      
      return user;
    } catch (error) {
      logError('Erro ao criar usuário', error, { userData });
      throw error;
    }
  }

  // atualizar usuário
  static async update(id, updateData) {
    try {
      const allowedFields = [
        'username', 'email', 'display_name', 'avatar_url', 
        'is_banned', 'ban_reason', 'banned_at', 'banned_by'
      ];
      const updates = [];
      const params = [];

      for (const [field, value] of Object.entries(updateData)) {
        if (allowedFields.includes(field) && value !== undefined) {
          updates.push(`${field} = ?`);
          params.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('Nenhum campo válido para atualização');
      }

      params.push(id);
      const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      await executeQuery(sql, params);
      
      logInfo('Usuário atualizado com sucesso', { userId: id, updates: Object.keys(updateData) });
      
      return await this.findById(id);
    } catch (error) {
      logError('Erro ao atualizar usuário', error, { userId: id, updateData });
      throw error;
    }
  }

  // atualizar senha
  static async updatePassword(id, newPassword) {
    try {
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);
      
      const sql = `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [password_hash, id]);
      
      logInfo('Senha do usuário atualizada', { userId: id });
      return true;
    } catch (error) {
      logError('Erro ao atualizar senha', error, { userId: id });
      throw error;
    }
  }

  // verificar senha
  static async verifyPassword(password, password_hash) {
    try {
      return await bcrypt.compare(password, password_hash);
    } catch (error) {
      logError('Erro ao verificar senha', error);
      return false;
    }
  }

  // atualizar último login
  static async updateLastLogin(id) {
    try {
      const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [id]);
      
      logInfo('Último login atualizado', { userId: id });
    } catch (error) {
      logError('Erro ao atualizar último login', error, { userId: id });
      throw error;
    }
  }

  // atualizar cargo (apenas admin)
  static async updateRole(id, newRole) {
    try {
      const allowedRoles = ['member', 'moderator', 'admin', 'super_admin'];
      if (!allowedRoles.includes(newRole)) {
        throw new Error('Role inválida');
      }

      const sql = `UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [newRole, id]);
      
      logInfo('Role do usuário atualizada', { userId: id, newRole });
      return true;
    } catch (error) {
      logError('Erro ao atualizar role', error, { userId: id, newRole });
      throw error;
    }
  }

  // banir/desbanir usuário
  static async updateBanStatus(id, isBanned, banReason = null) {
    try {
      const sql = `UPDATE users SET is_banned = ?, ban_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [isBanned, banReason, id]);
      
      const action = isBanned ? 'banido' : 'desbanido';
      logInfo(`Usuário ${action}`, { userId: id, isBanned, banReason });
      return true;
    } catch (error) {
      logError('Erro ao atualizar status de ban', error, { userId: id, isBanned });
      throw error;
    }
  }

  // buscar todos os usuários (filtro)
  static async findAll(filters = {}) {
    try {
      let sql = `
        SELECT id, username, email, display_name, role,
               is_verified, is_banned, ban_reason, banned_at, banned_by,
               created_at, updated_at, last_login
        FROM users
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.username) {
        sql += ` AND username LIKE ?`;
        params.push(`%${filters.username}%`);
      }
      
      if (filters.email) {
        sql += ` AND email LIKE ?`;
        params.push(`%${filters.email}%`);
      }
      
      if (filters.role) {
        sql += ` AND role = ?`;
        params.push(filters.role);
      }
      
      if (filters.is_verified !== undefined) {
        sql += ` AND is_verified = ?`;
        params.push(filters.is_verified);
      }
      
      if (filters.is_banned !== undefined) {
        sql += ` AND is_banned = ?`;
        params.push(filters.is_banned);
      }
      
      sql += ` ORDER BY created_at DESC`;
      
      const users = await executeQuery(sql, params);
      
      logInfo('Usuários buscados com sucesso', { count: users.length, filters });
      return users;
    } catch (error) {
      logError('Erro ao buscar usuários', error, { filters });
      throw error;
    }
  }

  // deletar usuário ()
  static async delete(id) {
    try {
      const sql = `UPDATE users SET is_banned = TRUE, ban_reason = 'Conta deletada', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [id]);
      
      logInfo('Usuário deletado', { userId: id });
      return true;
    } catch (error) {
      logError('Erro ao deletar usuário', error, { userId: id });
      throw error;
    }
  }

  // deletar conta completamente
  static async deleteAccountCompletely(userId) {
    try {

      const deleteCommentsSql = `DELETE FROM comments WHERE user_id = ?`;
      await executeQuery(deleteCommentsSql, [userId]);

      const deleteDownloadsSql = `DELETE FROM downloads WHERE user_id = ?`;
      await executeQuery(deleteDownloadsSql, [userId]);

      const deleteFavoritesSql = `DELETE FROM favorites WHERE user_id = ?`;
      await executeQuery(deleteFavoritesSql, [userId]);

      try {
        const deleteActivitiesSql = `DELETE FROM activities WHERE user_id = ?`;
        await executeQuery(deleteActivitiesSql, [userId]);
      } catch (activityError) {
      }

      const deleteUserSql = `DELETE FROM users WHERE id = ?`;
      const result = await executeQuery(deleteUserSql, [userId]);

      logInfo('Conta do usuário deletada completamente', { userId });
      return true;

    } catch (error) {
      logError('Erro ao deletar conta completamente', error, { userId });
      throw error;
    }
  }

  // atualizar usuário (admin)
  static async updateUser(userId, updateData) {
    try {
      
      const { username, display_name, email, role, is_verified } = updateData;
      
      const fields = [];
      const values = [];
      
      if (username !== undefined) {
        fields.push('username = ?');
        values.push(username);
      }
      
      if (display_name !== undefined) {
        fields.push('display_name = ?');
        values.push(display_name);
      }
      
      if (email !== undefined) {
        fields.push('email = ?');
        values.push(email);
      }
      
      if (role !== undefined) {
        fields.push('role = ?');
        values.push(role);
      }
      
      if (is_verified !== undefined) {
        fields.push('is_verified = ?');
        values.push(is_verified);
      }
      
      if (fields.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }
      
      values.push(userId);
      
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      
      const result = await executeQuery(sql, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      const updatedUser = await this.findById(userId);
      return updatedUser;
      
    } catch (error) {
      logError('Erro ao atualizar usuário', error, { userId });
      throw error;
    }
  }

  // verificar se email existe
  static async emailExists(email) {
    try {
      const sql = `SELECT COUNT(*) as count FROM users WHERE email = ?`;
      const result = await executeQuery(sql, [email]);
      return result[0].count > 0;
    } catch (error) {
      logError('Erro ao verificar se email existe', error, { email });
      throw error;
    }
  }

  // verificar se username existe
  static async usernameExists(username) {
    try {
      const sql = `SELECT COUNT(*) as count FROM users WHERE username = ?`;
      const result = await executeQuery(sql, [username]);
      return result[0].count > 0;
    } catch (error) {
      logError('Erro ao verificar se username existe', error, { username });
      throw error;
    }
  }

  // atualizar perfil do usuário
  static async updateProfile(userId, profileData) {
    try {
      const {
        username,
        email,
        firstName,
        lastName,
        bio,
        website,
        location,
        avatar
      } = profileData;

      const sql = `
        UPDATE users 
        SET username = ?, email = ?, first_name = ?, last_name = ?, 
            bio = ?, website = ?, location = ?, avatar_url = ?, updated_at = NOW()
        WHERE id = ?
      `;

      await executeQuery(sql, [
        username,
        email,
        firstName,
        lastName,
        bio,
        website,
        location,
        avatar,
        userId
      ]);

      return await this.findById(userId);
    } catch (error) {
      logError('Erro ao atualizar perfil', error, { userId, profileData });
      throw error;
    }
  }

  // atualizar configurações de privacidade
  static async updatePrivacySettings(userId, privacySettings) {
    try {
      const {
        profileVisibility,
        showEmail,
        showLocation,
        showWebsite,
        allowMessages,
        showOnlineStatus
      } = privacySettings;

      const sql = `
        UPDATE users 
        SET privacy_settings = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const settingsJson = JSON.stringify({
        profileVisibility,
        showEmail,
        showLocation,
        showWebsite,
        allowMessages,
        showOnlineStatus
      });

      await executeQuery(sql, [settingsJson, userId]);
    } catch (error) {
      logError('Erro ao atualizar configurações de privacidade', error, { userId, privacySettings });
      throw error;
    }
  }

  // atualizar configurações de notificações
  static async updateNotificationSettings(userId, notificationSettings) {
    try {
      const {
        emailNotifications,
        pushNotifications,
        commentNotifications,
        downloadNotifications,
        favoriteNotifications,
        marketingEmails,
        securityAlerts
      } = notificationSettings;

      const sql = `
        UPDATE users 
        SET notification_settings = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const settingsJson = JSON.stringify({
        emailNotifications,
        pushNotifications,
        commentNotifications,
        downloadNotifications,
        favoriteNotifications,
        marketingEmails,
        securityAlerts
      });

      await executeQuery(sql, [settingsJson, userId]);
    } catch (error) {
      logError('Erro ao atualizar configurações de notificação', error, { userId, notificationSettings });
      throw error;
    }
  }

  // atualizar configurações de tema
  static async updateThemeSettings(userId, themeSettings) {
    try {
      const {
        theme,
        accentColor,
        fontSize,
        animations,
        compactMode
      } = themeSettings;

      const sql = `
        UPDATE users 
        SET theme_settings = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const settingsJson = JSON.stringify({
        theme,
        accentColor,
        fontSize,
        animations,
        compactMode
      });

      await executeQuery(sql, [settingsJson, userId]);
    } catch (error) {
      logError('Erro ao atualizar configurações de tema', error, { userId, themeSettings });
      throw error;
    }
  }

  // atualizar configurações de idioma
  static async updateLanguageSettings(userId, languageSettings) {
    try {
      const {
        language,
        dateFormat,
        timeFormat,
        currency
      } = languageSettings;

      const sql = `
        UPDATE users 
        SET language_settings = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const settingsJson = JSON.stringify({
        language,
        dateFormat,
        timeFormat,
        currency
      });

      await executeQuery(sql, [settingsJson, userId]);
    } catch (error) {
      logError('Erro ao atualizar configurações de idioma', error, { userId, languageSettings });
      throw error;
    }
  }

  // atualizar configurações de conta
  static async updateAccountSettings(userId, accountSettings) {
    try {
      const {
        twoFactorEnabled,
        sessionTimeout,
        loginAlerts
      } = accountSettings;

      const sql = `
        UPDATE users 
        SET account_settings = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const settingsJson = JSON.stringify({
        twoFactorEnabled,
        sessionTimeout,
        loginAlerts
      });

      await executeQuery(sql, [settingsJson, userId]);
    } catch (error) {
      logError('Erro ao atualizar configurações de conta', error, { userId, accountSettings });
      throw error;
    }
  }

  // excluir conta do usuário
  static async deleteAccount(userId) {
    try {
      await executeTransaction(async (connection) => {
        await connection.execute('DELETE FROM activities WHERE user_id = ?', [userId]);
        
        await connection.execute('DELETE FROM favorites WHERE user_id = ?', [userId]);
        
        await connection.execute('DELETE FROM downloads WHERE user_id = ?', [userId]);
          
        await connection.execute('DELETE FROM comments WHERE user_id = ?', [userId]);
        
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
      });
    } catch (error) {
      logError('Erro ao excluir conta', error, { userId });
      throw error;
    }
  }
}
