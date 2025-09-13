import { executeQuery } from '../config/database.js';

export class EmailVerificationTokenModel {
  static async create({ id, userId, token, expiresAt }) {
    const sql = `
      INSERT INTO email_verification_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    await executeQuery(sql, [id, userId, token, expiresAt]);
    return { id, userId, token, expiresAt };
  }

  static async findByToken(token) {
    const sql = `
      SELECT * FROM email_verification_tokens
      WHERE token = ?
      LIMIT 1
    `;
    const rows = await executeQuery(sql, [token]);
    return rows[0] || null;
  }

  static async markUsed(id) {
    const sql = `
      UPDATE email_verification_tokens
      SET used = TRUE, used_at = NOW()
      WHERE id = ?
    `;
    await executeQuery(sql, [id]);
  }

  static async invalidateUserTokens(userId) {
    const sql = `
      UPDATE email_verification_tokens
      SET used = TRUE, used_at = NOW()
      WHERE user_id = ? AND used = FALSE
    `;
    await executeQuery(sql, [userId]);
  }
}




