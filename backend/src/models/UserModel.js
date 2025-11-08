import { executeQuery, executeTransaction, getConnection } from '../config/database.js';
import { logError, logInfo, logWarn } from '../config/logger.js';
import bcrypt from 'bcryptjs';
import encryptionService from '../services/EncryptionService.js';

export class UserModel {

  // buscar o usuário por ID 
  static async findById(id, decryptForAdmin = false) {
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
      
      if (decryptForAdmin) {
        return encryptionService.decryptUserData(user, true);
      }
      
      return user;
    } catch (error) {
      logError('Erro ao buscar usuário por ID', error, { userId: id });
      throw error;
    }
  }

  // buscar o usuário por email 
  static async findByEmail(email, decryptForAdmin = false) {
    try {
      const emailHash = encryptionService.hashForSearch(email);
      
      if (!emailHash) {
        return null;
      }
      
      const sql = `
        SELECT id, username, email, password_hash, display_name, avatar_url,
               role, is_verified, is_banned, created_at, updated_at, last_login
        FROM users 
        WHERE email_hash = ?
      `;
      
      const [user] = await executeQuery(sql, [emailHash]);
      
      if (!user) {
        return null;
      }
      
      if (decryptForAdmin) {
        return encryptionService.decryptUserData(user, true);
      }
      
      return user;
    } catch (error) {
      logError('Erro ao buscar usuário por email', error, { email });
      throw error;
    }
  }

  // buscar o usuário por username 
  static async findByUsername(username, decryptForAdmin = false) {
    try {
      const usernameHash = encryptionService.hashForSearch(username);
      
      if (!usernameHash) {
        return null;
      }
      
      const sql = `
        SELECT id, username, email, display_name, avatar_url,
               role, is_verified, is_banned, created_at, updated_at, last_login
        FROM users 
        WHERE username_hash = ?
      `;
      
      const [user] = await executeQuery(sql, [usernameHash]);
      
      if (!user) {
        return null;
      }
      
      if (decryptForAdmin) {
        return encryptionService.decryptUserData(user, true);
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
      
      const encryptedData = encryptionService.encryptUserData({
        username,
        email,
        display_name: display_name || null
      });
      
      const sql = `
        INSERT INTO users (
          id, username, email, password_hash, display_name,
          username_hash, email_hash,
          role, is_verified, is_banned, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      const params = [
        id, 
        encryptedData.username || null, 
        encryptedData.email || null, 
        passwordHash, 
        encryptedData.display_name || null,
        encryptedData.username_hash || null,
        encryptedData.email_hash || null,
        'member', 
        false, 
        false
      ];
      
      await executeQuery(sql, params);
      
      const user = await this.findById(id);
      
      logInfo('Usuário criado com sucesso', { userId: id });
      
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

      const fieldsToEncrypt = ['username', 'email', 'display_name'];
      const encryptedData = {};

      for (const [field, value] of Object.entries(updateData)) {
        if (allowedFields.includes(field) && value !== undefined) {
          if (fieldsToEncrypt.includes(field) && value !== null) {
            encryptedData[field] = encryptionService.encrypt(value);
            updates.push(`${field} = ?`);
            params.push(encryptedData[field]);
            
            if (field === 'username') {
              updates.push(`username_hash = ?`);
              params.push(encryptionService.hashForSearch(value));
            } else if (field === 'email') {
              updates.push(`email_hash = ?`);
              params.push(encryptionService.hashForSearch(value));
            }
          } else {
            updates.push(`${field} = ?`);
            params.push(value);
          }
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
      const allowedRoles = ['member', 'moderator', 'supervisor', 'admin'];
      if (!allowedRoles.includes(newRole)) {
        throw new Error('Role inválida');
      }

      const currentUserData = await executeQuery(
        'SELECT is_verified FROM users WHERE id = ?',
        [id]
      );
      
      if (!currentUserData || currentUserData.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const currentIsVerified = currentUserData[0].is_verified;
      const isVerifiedValue = currentIsVerified === 1 || currentIsVerified === true || currentIsVerified === '1' ? 1 : 0;
      
      logInfo('Atualizando role - valores antes do update', { 
        userId: id, 
        newRole, 
        currentIsVerified: currentIsVerified,
        isVerifiedType: typeof currentIsVerified,
        isVerifiedValue 
      });

      const sql = `UPDATE users 
                   SET role = ?, 
                       is_verified = ?,
                       updated_at = CURRENT_TIMESTAMP 
                   WHERE id = ?`;
      
      await executeQuery(sql, [newRole, isVerifiedValue, id]);
      
      const verificationCheck = await executeQuery(
        'SELECT is_verified FROM users WHERE id = ?',
        [id]
      );
      
      const finalIsVerified = verificationCheck[0]?.is_verified;
      
      logInfo('Role do usuário atualizada', { 
        userId: id, 
        newRole, 
        is_verified_antes: currentIsVerified,
        is_verified_depois: finalIsVerified,
        is_verified_depois_type: typeof finalIsVerified
      });
      
      const finalValue = finalIsVerified === 1 || finalIsVerified === true || finalIsVerified === '1' ? 1 : 0;
      const originalValue = currentIsVerified === 1 || currentIsVerified === true || currentIsVerified === '1' ? 1 : 0;
      
      if (finalValue !== originalValue) {
        logWarn('ATENÇÃO: is_verified foi alterado durante updateRole! Corrigindo...', {
          userId: id,
          antes: currentIsVerified,
          depois: finalIsVerified,
          originalValue,
          finalValue
        });
        
        const correctSql = `UPDATE users SET is_verified = ? WHERE id = ?`;
        await executeQuery(correctSql, [originalValue, id]);
        
        logInfo('Correção aplicada', { userId: id, originalValue });
      }
      
      return true;
    } catch (error) {
      logError('Erro ao atualizar role', error, { userId: id, newRole });
      throw error;
    }
  }

  static async findByRoles(roles, decryptForAdmin = false) {
    try {
      if (!Array.isArray(roles) || roles.length === 0) {
        return [];
      }

      const placeholders = roles.map(() => '?').join(',');
      const sql = `
        SELECT id, username, email, display_name, avatar_url,
               role, is_verified, is_banned, created_at, updated_at, last_login
        FROM users 
        WHERE role IN (${placeholders})
        ORDER BY 
          CASE role
            WHEN 'admin' THEN 1
            WHEN 'supervisor' THEN 2
            WHEN 'moderator' THEN 3
            ELSE 4
          END,
          created_at DESC
      `;
      
      const users = await executeQuery(sql, roles);
      
      if (decryptForAdmin && users.length > 0) {
        return encryptionService.decryptUserArray(users, true);
      }
      
      return users;
    } catch (error) {
      logError('Erro ao buscar usuários por roles', error, { roles });
      throw error;
    }
  }

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
  static async findAll(filters = {}, decryptForAdmin = false) {
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
        const usernameHash = encryptionService.hashForSearch(filters.username);
        if (usernameHash) {
          sql += ` AND username_hash = ?`;
          params.push(usernameHash);
        }
      }
      
      if (filters.email) {
        const emailHash = encryptionService.hashForSearch(filters.email);
        if (emailHash) {
          sql += ` AND email_hash = ?`;
          params.push(emailHash);
        }
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
      
      if (decryptForAdmin) {
        const decryptedUsers = encryptionService.decryptUserArray(users, true);
        logInfo('Usuários buscados com sucesso (descriptografados para admin)', { count: decryptedUsers.length, filters });
        return decryptedUsers;
      }
      
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


  // atualizar usuário (admin) - com criptografia automática
  static async updateUser(userId, updateData) {
    try {
      
      const { username, display_name, email, role, is_verified } = updateData;
      
      const currentUser = await this.findById(userId, true);
      if (!currentUser) {
        throw new Error('Usuário não encontrado');
      }
      
      const fields = [];
      const values = [];
      
      if (username !== undefined) {
        fields.push('username = ?');
        values.push(encryptionService.encrypt(username));
        fields.push('username_hash = ?');
        values.push(encryptionService.hashForSearch(username));
      }
      
      if (display_name !== undefined) {
        fields.push('display_name = ?');
        values.push(display_name ? encryptionService.encrypt(display_name) : null);
      }
      
      if (email !== undefined) {
        fields.push('email = ?');
        values.push(encryptionService.encrypt(email));
        fields.push('email_hash = ?');
        values.push(encryptionService.hashForSearch(email));
      }
      
      if (role !== undefined) {
        fields.push('role = ?');
        values.push(role);
      }
      
      const isVerifiedValue = is_verified !== undefined 
        ? (is_verified === true || is_verified === 'true' || is_verified === 1 || is_verified === '1' ? 1 : 0)
        : (currentUser.is_verified === 1 || currentUser.is_verified === true || currentUser.is_verified === '1' ? 1 : 0);
      
      fields.push('is_verified = ?');
      values.push(isVerifiedValue);
      
      if (fields.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }
      
      values.push(userId);
      
      const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      const result = await executeQuery(sql, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      const updatedUser = await this.findById(userId, true);
      return updatedUser;
      
    } catch (error) {
      logError('Erro ao atualizar usuário', error, { userId });
      throw error;
    }
  }

  // verificar se email existe 
  static async emailExists(email) {
    try {
      const emailHash = encryptionService.hashForSearch(email);
      if (!emailHash) {
        return false;
      }
      const sql = `SELECT COUNT(*) as count FROM users WHERE email_hash = ?`;
      const result = await executeQuery(sql, [emailHash]);
      return result[0].count > 0;
    } catch (error) {
      logError('Erro ao verificar se email existe', error, { email });
      throw error;
    }
  }

  // verificar se username existe 
  static async usernameExists(username) {
    try {
      const usernameHash = encryptionService.hashForSearch(username);
      if (!usernameHash) {
        return false;
      }
      const sql = `SELECT COUNT(*) as count FROM users WHERE username_hash = ?`;
      const result = await executeQuery(sql, [usernameHash]);
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

  // excluir conta do usuário completamente
  static async deleteAccountCompletely(userId) {
    try {
      const connection = await getConnection();
      await connection.beginTransaction();
      
      try {
        await connection.execute('DELETE FROM activity_logs WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM email_verification_tokens WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM account_deletion_tokens WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM comments WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM favorites WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM downloads WHERE user_id = ?', [userId]);
        await connection.execute('UPDATE mods SET author_id = NULL WHERE author_id = ?', [userId]);
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        
        await connection.commit();
        
        logInfo('Conta do usuário excluída completamente', { userId });
        return true;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        if (connection && typeof connection.release === 'function') {
          connection.release();
        } else if (connection && typeof connection.end === 'function') {
          await connection.end();
        }
      }
    } catch (error) {
      logError('Erro ao excluir conta completamente', error, { userId });
      throw error;
    }
  }

  // excluir conta do usuário 
  static async deleteAccount(userId) {
    return this.deleteAccountCompletely(userId);
  }
}
