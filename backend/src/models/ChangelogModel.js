import { executeQuery } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export default class ChangelogModel {
  static async ensureTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS changelogs (
        id CHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(220) NOT NULL UNIQUE,
        summary TEXT,
        tags LONGTEXT NULL,
        entries LONGTEXT NOT NULL,
        is_published TINYINT(1) DEFAULT 0,
        published_at TIMESTAMP NULL,
        author_id VARCHAR(36) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_published (is_published, published_at),
        INDEX idx_created_at (created_at)
      );
    `;
    await executeQuery(sql, []);
  }
  static async create({ title, slug, summary, tags = [], entries = [], author_id, is_published = 0 }) {
    const id = uuidv4();
    const sql = `INSERT INTO changelogs (id, title, slug, summary, tags, entries, is_published, published_at, author_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [id, title, slug, summary || null, JSON.stringify(tags), JSON.stringify(entries), is_published ? 1 : 0, is_published ? new Date() : null, author_id || null];
    await executeQuery(sql, params);
    return this.findById(id);
  }

  static async update(id, data) {
    const fields = [];
    const params = [];
    const add = (f, v) => { fields.push(`${f} = ?`); params.push(v); };

    if (data.title !== undefined) add('title', data.title);
    if (data.slug !== undefined) add('slug', data.slug);
    if (data.summary !== undefined) add('summary', data.summary);
    if (data.tags !== undefined) add('tags', JSON.stringify(data.tags || []));
    if (data.entries !== undefined) add('entries', JSON.stringify(data.entries || []));
    if (data.is_published !== undefined) {
      add('is_published', data.is_published ? 1 : 0);
      add('published_at', data.is_published ? new Date() : null);
    }

    if (!fields.length) return this.findById(id);
    const sql = `UPDATE changelogs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params.push(id);
    await executeQuery(sql, params);
    return this.findById(id);
  }

  static async delete(id) {
    await executeQuery('DELETE FROM changelogs WHERE id = ?', [id]);
    return { id };
  }

  static async listPublic(limit = 50, offset = 0) {
    await this.ensureTable();
    const safeLimit = Math.max(1, Math.min(1000, parseInt(limit) || 50));
    const safeOffset = Math.max(0, parseInt(offset) || 0);
    const sql = `SELECT * FROM changelogs WHERE is_published = 1 ORDER BY published_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    return await executeQuery(sql);
  }

  static async listAll(limit = 50, offset = 0, search = '') {
    await this.ensureTable();
    const like = `%${search}%`;
    const safeLimit = Math.max(1, Math.min(1000, parseInt(limit) || 50));
    const safeOffset = Math.max(0, parseInt(offset) || 0);
    const sql = `SELECT * FROM changelogs WHERE title LIKE ? OR summary LIKE ? ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    return await executeQuery(sql, [like, like]);
  }

  static async findBySlug(slug) {
    await this.ensureTable();
    const rows = await executeQuery('SELECT * FROM changelogs WHERE slug = ? LIMIT 1', [slug]);
    return rows[0] || null;
  }

  static async findById(id) {
    await this.ensureTable();
    const rows = await executeQuery('SELECT * FROM changelogs WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }
}


