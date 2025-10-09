import { executeQuery } from '../config/database.js';
import { logInfo, logError } from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';
export default class ModsModel {
  static async create(modData) {
    try {
      const id = uuidv4();
      const {
        name, slug, version, minecraft_version, mod_loader, short_description, full_description,
        tags, thumbnail_url, download_url_pc, download_url_mobile, video_url, author_id, content_type_id = 1
      } = modData;
      const sql = `
        INSERT INTO mods (
          id, title, type, description, version, slug, minecraft_version, mod_loader, file_size, file_hash, short_description,
          full_description, tags, thumbnail_url, download_url_pc, download_url_mobile, video_url, author_id, content_type_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        id, name, "mod", name, version, slug, minecraft_version, mod_loader, 0, "", short_description,
        full_description, JSON.stringify(tags || []), thumbnail_url,
        download_url_pc, download_url_mobile, video_url, author_id, content_type_id
      ];
      await executeQuery(sql, params);
      logInfo('Mod criado com sucesso', { modId: id, description: name, author_id, content_type_id });
      return await this.findByIdAdmin(id);
    } catch (error) {
      logError('Erro ao criar mod', error, { modData });
      throw error;
    }
  }
  static async findById(id) {
    try {
      const sql = `
        SELECT m.*, u.username as author_name, u.display_name as author_display_name, u.avatar_url as author_avatar_url,
               ct.name as content_type, ct.display_name as content_type_display, ct.minecraft_edition
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        LEFT JOIN content_types ct ON m.content_type_id = ct.id
        WHERE m.id = ? AND m.is_published = 1 AND (m.is_archived IS NULL OR m.is_archived = 0)
      `;
      const result = await executeQuery(sql, [id]);
      if (result.length === 0) return null;
      const mod = result[0];
      mod.tags = mod.tags && mod.tags !== 'null' ? JSON.parse(mod.tags) : [];
      return mod;
    } catch (error) {
      logError('Erro ao buscar mod por ID', error, { modId: id });
      throw error;
    }
  }
  static async findByIdAdmin(id) {
    try {
      const sql = `
        SELECT m.*, u.username as author_name, u.display_name as author_display_name, u.avatar_url as author_avatar_url,
               ct.name as content_type, ct.display_name as content_type_display, ct.minecraft_edition
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        LEFT JOIN content_types ct ON m.content_type_id = ct.id
        WHERE m.id = ?
      `;
      const result = await executeQuery(sql, [id]);
      if (result.length === 0) return null;
      const mod = result[0];
      mod.tags = mod.tags && mod.tags !== 'null' ? JSON.parse(mod.tags) : [];
      return mod;
    } catch (error) {
      logError('Erro ao buscar mod por ID (admin)', error, { modId: id });
      throw error;
    }
  }
  static async findBySlug(slug) {
    try {
      const sql = `
        SELECT m.*, u.username as author_name, u.display_name as author_display_name, u.avatar_url as author_avatar_url,
               ct.name as content_type, ct.display_name as content_type_display, ct.minecraft_edition
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        LEFT JOIN content_types ct ON m.content_type_id = ct.id
        WHERE m.slug = ? AND m.is_published = 1 AND (m.is_archived IS NULL OR m.is_archived = 0)
      `;
      const result = await executeQuery(sql, [slug]);
      if (result.length === 0) return null;
      const mod = result[0];
      mod.tags = mod.tags && mod.tags !== 'null' ? JSON.parse(mod.tags) : [];
      return mod;
    } catch (error) {
      logError('Erro ao buscar mod por slug', error, { slug });
      throw error;
    }
  }
  static async findBySlugAdmin(slug) {
    try {
      const sql = `
        SELECT m.*, u.username as author_name, u.display_name as author_display_name, u.avatar_url as author_avatar_url,
               ct.name as content_type, ct.display_name as content_type_display, ct.minecraft_edition
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        LEFT JOIN content_types ct ON m.content_type_id = ct.id
        WHERE m.slug = ?
      `;
      const result = await executeQuery(sql, [slug]);
      if (result.length === 0) return null;
      const mod = result[0];
      mod.tags = mod.tags && mod.tags !== 'null' ? JSON.parse(mod.tags) : [];
      return mod;
    } catch (error) {
      logError('Erro ao buscar mod por slug (admin)', error, { slug });
      throw error;
    }
  }
  static async findAll(filters = {}) {
    try {
      let sql = `
        SELECT m.*, u.username as author_name, u.display_name as author_display_name, u.avatar_url as author_avatar_url
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        WHERE 1=1
      `;
      const params = [];
      if (filters.status) {
        if (filters.status === 'published') {
          sql += ' AND m.is_published = 1 AND (m.is_archived IS NULL OR m.is_archived = 0)';
        } else if (filters.status === 'archived') {
          sql += ' AND m.is_archived = 1';
        } else if (filters.status === 'draft') {
          sql += ' AND m.is_published = 0 AND (m.is_archived IS NULL OR m.is_archived = 0)';
        }
      }
      if (filters.featured !== undefined) {
        sql += ' AND m.is_featured = ?';
        params.push(parseInt(filters.featured) ? 1 : 0);
      }
      if (filters.minecraft_version) {
        sql += ' AND m.minecraft_version = ?';
        params.push(filters.minecraft_version);
      }
      if (filters.search) {
        sql += ' AND (m.title LIKE ? OR m.short_description LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }
      sql += ' ORDER BY m.created_at DESC';
      const result = await executeQuery(sql, params);
      const mods = result.map(mod => ({
        ...mod,
        tags: mod.tags && mod.tags !== 'null' ? JSON.parse(mod.tags) : []
      }));
      logInfo('Mods buscados com sucesso', { count: mods.length, filters });
      return mods;
    } catch (error) {
      logError('Erro ao buscar mods', error, { filters });
      throw error;
    }
  }
  static async findPublic(filters = {}) {
    try {
      let sql = `
        SELECT m.*, u.username as author_name, u.display_name as author_display_name, u.avatar_url as author_avatar_url,
               ct.name as content_type, ct.display_name as content_type_display, ct.minecraft_edition
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        LEFT JOIN content_types ct ON m.content_type_id = ct.id
        WHERE m.is_published = 1 AND (m.is_archived IS NULL OR m.is_archived = 0)
      `;
      const params = [];
      if (filters.featured) {
        sql += ' AND m.is_featured = 1';
      }
      if (filters.minecraft_version) {
        sql += ' AND m.minecraft_version = ?';
        params.push(filters.minecraft_version);
      }
      if (filters.content_type) {
        sql += ' AND ct.name = ?';
        params.push(filters.content_type);
      }
      if (filters.search) {
        sql += ' AND (m.title LIKE ? OR m.short_description LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }
      sql += ' ORDER BY m.is_featured DESC, m.created_at DESC';
      if (filters.limit && parseInt(filters.limit) > 0) {
        sql += ` LIMIT ${parseInt(filters.limit)}`;
      }
      if (filters.offset && parseInt(filters.offset) >= 0) {
        sql += ` OFFSET ${parseInt(filters.offset)}`;
      }
      const result = await executeQuery(sql, params);
      const mods = result.map(mod => ({
        ...mod,
        tags: mod.tags && mod.tags !== 'null' ? JSON.parse(mod.tags) : []
      }));
      return mods;
    } catch (error) {
      logError('Erro ao buscar mods públicos', error, { filters });
      throw error;
    }
  }
  static async update(id, updateData) {
    try {
      const allowedFields = [
        'title', 'slug', 'version', 'minecraft_version', 'short_description',
        'description', 'full_description', 'tags', 'thumbnail_url', 'download_url_pc', 'download_url_mobile', 'video_url',
        'mod_loader', 'is_published', 'is_archived', 'is_featured', 'content_type_id'
      ];
      const updates = [];
      const params = [];
      for (const [field, value] of Object.entries(updateData)) {
        if (allowedFields.includes(field) && value !== undefined) {
          if (field === 'tags') {
            updates.push(`${field} = ?`);
            params.push(JSON.stringify(value));
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
      const sql = `UPDATE mods SET ${updates.join(__STRING_PLACEHOLDER_52__)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, params);
      logInfo('Mod atualizado com sucesso', { modId: id, updates: Object.keys(updateData) });
      return await this.findByIdAdmin(id);
    } catch (error) {
      logError('Erro ao atualizar mod', error, { modId: id, updateData });
      throw error;
    }
  }
  static async delete(id) {
    try {
      const sql = 'DELETE FROM mods WHERE id = ?';
      await executeQuery(sql, [id]);
      logInfo('Mod deletado com sucesso', { modId: id });
      return true;
    } catch (error) {
      logError('Erro ao deletar mod', error, { modId: id });
      throw error;
    }
  }
  static async toggleStatus(id, field) {
    try {
      const allowedFields = ['is_published', 'is_archived', 'is_featured'];
      if (!allowedFields.includes(field)) {
        throw new Error('Campo de status inválido');
      }
      const sql = `UPDATE mods SET ${field} = NOT ${field}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [id]);
      logInfo('Status do mod alterado', { modId: id, field });
      return await this.findByIdAdmin(id);
    } catch (error) {
      logError('Erro ao alterar status do mod', error, { modId: id, field });
      throw error;
    }
  }
  static async incrementCount(id, field) {
    try {
      const allowedFields = ['download_count', 'view_count'];
      if (!allowedFields.includes(field)) {
        throw new Error('Campo de contador inválido');
      }
      const sql = `UPDATE mods SET ${field} = ${field} + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await executeQuery(sql, [id]);
      return true;
    } catch (error) {
      logError('Erro ao incrementar contador', error, { modId: id });
      throw error;
    }
  }
  static async generateUniqueSlug(name) {
    try {
      let slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      let finalSlug = slug;
      let counter = 1;
      while (await this.slugExists(finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      return finalSlug;
    } catch (error) {
      logError('Erro ao gerar slug único', error, { name });
      throw error;
    }
  }
  static async slugExists(slug) {
    try {
      const sql = 'SELECT COUNT(*) as count FROM mods WHERE slug = ?';
      const result = await executeQuery(sql, [slug]);
      return result[0].count > 0;
    } catch (error) {
      logError('Erro ao verificar slug', error, { slug });
      throw error;
    }
  }
  static async getStats() {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_mods,
          SUM(CASE WHEN is_published = 1 AND (is_archived IS NULL OR is_archived = 0) THEN 1 ELSE 0 END) as published_mods,
          SUM(CASE WHEN is_archived = 1 THEN 1 ELSE 0 END) as archived_mods,
          SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured_mods,
          SUM(download_count) as total_downloads,
          SUM(view_count) as total_views
        FROM mods
      `;
      const result = await executeQuery(sql);
      return result[0];
    } catch (error) {
      logError('Erro ao buscar estatísticas dos mods', error);
      throw error;
    }
  }
  static async advancedSearch(filters = {}, sort = 'relevance') {
    try {
      let sql = `
        SELECT m.*, u.username as author_name, u.display_name as author_display_name, u.avatar_url as author_avatar_url
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        WHERE m.is_published = 1 AND (m.is_archived IS NULL OR m.is_archived = 0)
      `;
      const params = [];
      if (filters.search) {
        sql += ` AND (
          m.title LIKE ? OR
          m.short_description LIKE ? OR
          m.description LIKE ? OR
          m.tags LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        params.push(String(searchTerm), String(searchTerm), String(searchTerm), String(searchTerm));
      }
      if (filters.minecraft_version) {
        sql += ' AND m.minecraft_version = ?';
        params.push(filters.minecraft_version);
      }
      if (filters.mod_loader) {
        sql += ' AND m.mod_loader = ?';
        params.push(filters.mod_loader);
      }
      if (filters.category) {
        sql += ' AND JSON_CONTAINS(m.tags, ?)';
        params.push(JSON.stringify(filters.category));
      }
      if (filters.featured !== undefined) {
        sql += ' AND m.is_featured = ?';
        params.push(String(parseInt(filters.featured) ? 1 : 0));
      }
      if (filters.author) {
        sql += ' AND (u.username LIKE ? OR u.display_name LIKE ?)';
        const authorTerm = `%${filters.author}%`;
        params.push(authorTerm, authorTerm);
      }
      switch (sort) {
        case 'relevance':
          sql += ' ORDER BY m.is_featured DESC, m.download_count DESC, m.created_at DESC';
          break;
        case 'latest':
          sql += ' ORDER BY m.created_at DESC';
          break;
        case 'downloads':
          sql += ' ORDER BY download_count DESC';
          break;
        case 'views':
          sql += ' ORDER BY view_count DESC';
          break;
        case 'name_asc':
          sql += ' ORDER BY m.title ASC';
          break;
        case 'name_desc':
          sql += ' ORDER BY m.title DESC';
          break;
        case 'popularity':
          sql += ' ORDER BY (download_count + view_count) DESC';
          break;
        default:
          sql += ' ORDER BY m.is_featured DESC, m.created_at DESC';
      }
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(String(parseInt(filters.limit)));
        if (filters.offset !== undefined && filters.offset !== null) {
          sql += ' OFFSET ?';
          params.push(String(parseInt(filters.offset)));
        }
      }
      const result = await executeQuery(sql, params);
      let countSql = `
        SELECT COUNT(DISTINCT m.id) as total
        FROM mods m
        LEFT JOIN users u ON m.author_id = u.id
        WHERE m.is_published = 1 AND (m.is_archived IS NULL OR m.is_archived = 0)
      `;
      const countParams = [];
      if (filters.search) {
        countSql += ` AND (
          m.title LIKE ? OR
          m.short_description LIKE ? OR
          m.description LIKE ? OR
          m.tags LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      if (filters.minecraft_version) {
        countSql += ' AND m.minecraft_version = ?';
        countParams.push(filters.minecraft_version);
      }
      if (filters.mod_loader) {
        countSql += ' AND m.mod_loader = ?';
        countParams.push(filters.mod_loader);
      }
      if (filters.category) {
        countSql += ' AND JSON_CONTAINS(m.tags, ?)';
        countParams.push(JSON.stringify(filters.category));
      }
      if (filters.featured !== undefined) {
        countSql += ' AND m.is_featured = ?';
        countParams.push(parseInt(filters.featured) ? 1 : 0);
      }
      if (filters.author) {
        countSql += ' AND (u.username LIKE ? OR u.display_name LIKE ?)';
        const authorTerm = `%${filters.author}%`;
        countParams.push(authorTerm, authorTerm);
      }
      const countResult = await executeQuery(countSql, countParams);
      const total = countResult[0]?.total || 0;
      const mods = result.map(mod => ({
        ...mod,
        tags: mod.tags && mod.tags !== 'null' ? JSON.parse(mod.tags) : [],
        download_count: parseInt(mod.download_count) || 0,
        view_count: parseInt(mod.view_count) || 0
      }));
      return {
        mods,
        total
      };
    } catch (error) {
      logError('Erro na busca avançada', error, { filters });
      throw error;
    }
  }
  static async getContentTypes() {
    try {
      const sql = 'SELECT * FROM content_types WHERE is_active = 1 ORDER BY id';
      const result = await executeQuery(sql);
      return result;
    } catch (error) {
      logError('Erro ao buscar tipos de conteúdo', error);
      throw error;
    }
  }
  static async getModsCount() {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_mods,
          SUM(CASE WHEN is_published = 1 AND (is_archived IS NULL OR is_archived = 0) THEN 1 ELSE 0 END) as published_mods,
          SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured_mods,
          SUM(CASE WHEN is_published = 0 AND (is_archived IS NULL OR is_archived = 0) THEN 1 ELSE 0 END) as draft_mods,
          SUM(CASE WHEN is_archived = 1 THEN 1 ELSE 0 END) as archived_mods
        FROM mods
      `;
      const result = await executeQuery(sql);
      const counts = result[0];
      return {
        total: parseInt(counts.total_mods) || 0,
        published: parseInt(counts.published_mods) || 0,
        featured: parseInt(counts.featured_mods) || 0,
        draft: parseInt(counts.draft_mods) || 0,
        archived: parseInt(counts.archived_mods) || 0
      };
    } catch (error) {
      logError('Erro ao buscar contagem de mods', error);
      throw error;
    }
  }
  static async registerView(modId, ipAddress) {
    try {
      const incrementSql = 'UPDATE mods SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?';
      await executeQuery(incrementSql, [modId]);
      return { success: true, message: 'Visualização registrada com sucesso' };
    } catch (error) {
      logError('Erro ao registrar visualização', error, { modId, ipAddress });
      throw error;
    }
  }
  static async registerDownload(modId, userId = null) {
    try {
      const sql = 'UPDATE mods SET download_count = COALESCE(download_count, 0) + 1 WHERE id = ?';
      await executeQuery(sql, [modId]);
      if (userId) {
        const insertSql = 'INSERT INTO downloads (mod_id, user_id, created_at) VALUES (?, ?, NOW())';
        try {
          await executeQuery(insertSql, [modId, userId]);
        } catch (err) {
          const msg = String(err?.message || '');
          if (msg.includes('ER_NO_SUCH_TABLE') || msg.includes('Unknown table') || msg.includes("doesn't exist")) {
            try {
              const createSql = `
                CREATE TABLE IF NOT EXISTS downloads (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  mod_id VARCHAR(64) NOT NULL,
                  user_id VARCHAR(64) NOT NULL,
                  created_at DATETIME NOT NULL,
                  KEY idx_user_id (user_id),
                  KEY idx_mod_id (mod_id),
                  KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
              `;
              await executeQuery(createSql, []);
              await executeQuery(insertSql, [modId, userId]);
            } catch (e2) {
              console.warn('Aviso: não foi possível criar/inserir em downloads:', e2?.message);
            }
          } else {
            console.warn('Aviso: falha ao registrar histórico de download:', err?.message);
          }
        }
      }
      return { success: true, message: 'Download registrado com sucesso' };
    } catch (error) {
      logError('Erro ao registrar download', error, { modId, userId });
      throw error;
    }
  }
  static async getUserDownloadsCount(userId) {
    try {
      const sql = 'SELECT COUNT(*) AS total FROM downloads WHERE user_id = ?';
      const result = await executeQuery(sql, [userId]);
      const total = result?.[0]?.total || 0;
      return total;
    } catch (error) {
      logError('Erro ao buscar contagem de downloads do usuário', error, { userId });
      throw error;
    }
  }
  static async getUserDownloadHistory({ userId, offset = 0, limit = 20, search = '', dateCondition = '', type = null }) {
    try {
      let whereClause = 'WHERE d.user_id = ?';
      let params = [userId];
      if (search && search.trim()) {
        whereClause += ' AND m.title LIKE ?';
        params.push(`%${search.trim()}%`);
      }
      if (dateCondition) {
        whereClause += ` ${dateCondition}`;
      }
      if (type && type !== 'all') {
        whereClause += ' AND d.download_type = ?';
        params.push(type);
      }
      const sql = `
        SELECT
          MAX(d.id) AS id,
          MAX(d.created_at) AS created_at,
          m.id AS mod_id,
          m.title AS title,
          m.thumbnail_url,
          m.minecraft_version,
          m.short_description,
          m.tags
        FROM downloads d
        INNER JOIN mods m ON d.mod_id = m.id
        ${whereClause}
        GROUP BY m.id
        ORDER BY MAX(d.created_at) DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
      const rows = await executeQuery(sql, params);
      return rows.map(r => ({
        id: r.id,
        modId: r.mod_id,
        name: r.description,
        thumbnail_url: r.thumbnail_url,
        minecraft_version: r.minecraft_version,
        downloaded_at: r.created_at,
        short_description: r.short_description || '',
        tags: (() => {
          try { return r.tags && r.tags !== 'null' ? JSON.parse(r.tags) : []; } catch { return []; }
        })()
      }));
    } catch (error) {
      logError('Erro ao buscar histórico de downloads do usuário', error, { userId });
      throw error;
    }
  }
  static async toggleFavorite(modId, userId) {
    try {
      if (!modId || !userId) {
        throw new Error('Parâmetros inválidos para toggleFavorite');
      }
      const checkSql = 'SELECT id FROM favorites WHERE mod_id = ? AND user_id = ?';
      const existing = await executeQuery(checkSql, [modId, userId]);
      if (existing.length > 0) {
        const deleteSql = 'DELETE FROM favorites WHERE mod_id = ? AND user_id = ?';
        await executeQuery(deleteSql, [modId, userId]);
        const decrementSql = 'UPDATE mods SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = ?';
        await executeQuery(decrementSql, [modId]);
        return { success: true, message: 'Favorito removido', isFavorite: false };
      } else {
        const favoriteId = uuidv4(); // Gerar ID único
        const insertSql = 'INSERT INTO favorites (id, mod_id, user_id) VALUES (?, ?, ?)';
        await executeQuery(insertSql, [favoriteId, modId, userId]);
        const incrementSql = 'UPDATE mods SET like_count = COALESCE(like_count, 0) + 1 WHERE id = ?';
        await executeQuery(incrementSql, [modId]);
        return { success: true, message: 'Favorito adicionado', isFavorite: true };
      }
    } catch (error) {
      logError('Erro ao alternar favorito', error, { modId, userId });
      throw error;
    }
  }
  static async isFavorite(modId, userId) {
    try {
      if (!modId || !userId) {
        return false;
      }
      const sql = 'SELECT id FROM favorites WHERE mod_id = ? AND user_id = ?';
      const result = await executeQuery(sql, [modId, userId]);
      return result.length > 0;
    } catch (error) {
      logError('Erro ao verificar favorito', error, { modId, userId });
      return false;
    }
  }
  static async getUserFavorites(userId) {
    try {
      const sql = `
        SELECT m.*, u.username as author_name, u.display_name as author_display_name, u.avatar_url as author_avatar_url,
               ct.name as content_type, ct.display_name as content_type_display, ct.minecraft_edition,
               f.created_at as favorited_at
        FROM favorites f
        INNER JOIN mods m ON f.mod_id = m.id
        LEFT JOIN users u ON m.author_id = u.id
        LEFT JOIN content_types ct ON m.content_type_id = ct.id
        WHERE f.user_id = ? AND m.is_published = 1 AND (m.is_archived IS NULL OR m.is_archived = 0)
        ORDER BY f.created_at DESC
      `;
      const result = await executeQuery(sql, [userId]);
      const favorites = result.map(mod => ({
        ...mod,
        tags: mod.tags && mod.tags !== 'null' ? JSON.parse(mod.tags) : [],
        download_count: parseInt(mod.download_count) || 0,
        view_count: parseInt(mod.view_count) || 0,
        like_count: parseInt(mod.like_count) || 0,
        favorited_at: mod.favorited_at
      }));
      return favorites;
    } catch (error) {
      logError('Erro ao buscar favoritos do usuário', error, { userId });
      throw error;
    }
  }
};