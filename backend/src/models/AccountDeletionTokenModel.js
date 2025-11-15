import { executeQuery } from '../config/database.js';

export class AccountDeletionTokenModel {
  static async ensureTable() {
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS account_deletion_tokens (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at DATETIME NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          used_at DATETIME NULL,
          INDEX idx_user_id (user_id),
          INDEX idx_token (token),
          INDEX idx_expires_at (expires_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await executeQuery(sql, []);
    } catch (error) {
      console.error('Erro ao criar tabela account_deletion_tokens:', error);
      throw error;
    }
  }

  static async create({ id, userId, token, expiresAt }) {
    await this.ensureTable();
    const sql = `
      INSERT INTO account_deletion_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    await executeQuery(sql, [id, userId, token, expiresAt]);
    return { id, userId, token, expiresAt };
  }

  static async findByToken(token) {
    await this.ensureTable();
    const sql = `
      SELECT * FROM account_deletion_tokens
      WHERE token = ? AND used = FALSE AND expires_at > NOW()
      LIMIT 1
    `;
    const rows = await executeQuery(sql, [token]);
    return rows[0] || null;
  }

  static async markUsed(id) {
    const sql = `
      UPDATE account_deletion_tokens
      SET used = TRUE, used_at = NOW()
      WHERE id = ?
    `;
    await executeQuery(sql, [id]);
  }

  static async invalidateUserTokens(userId) {
    const sql = `
      UPDATE account_deletion_tokens
      SET used = TRUE, used_at = NOW()
      WHERE user_id = ? AND used = FALSE
    `;
    await executeQuery(sql, [userId]);
  }

  static async findActiveTokenByUserId(userId) {
    await this.ensureTable();
    const sql = `
      SELECT * FROM account_deletion_tokens
      WHERE user_id = ? AND used = FALSE AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const rows = await executeQuery(sql, [userId]);
    return rows[0] || null;
  }
}


