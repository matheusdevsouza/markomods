import { executeQuery } from '../config/database.js';
import { logError, logInfo } from '../config/logger.js';

class StatsService {
  constructor() {
    this.cache = {
      avgDownloadsPerMod: null,
      totalDownloads: null,
      totalMods: null,
      lastUpdated: null
    };
    this.updateInterval = 30 * 60 * 1000;
    this.isUpdating = false;
    this.updateTimer = null;
  }

  async initialize() {
    try {
      await this.ensureCacheTable();
      await this.loadFromCache();
      this.startAutoUpdate();
      logInfo('📊 StatsService inicializado com sucesso');
    } catch (error) {
      logError('Erro ao inicializar StatsService', error);
    }
  }

  async ensureCacheTable() {
    try {
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS stats_cache (
          id INT AUTO_INCREMENT PRIMARY KEY,
          stat_key VARCHAR(100) NOT NULL UNIQUE,
          stat_value DECIMAL(15, 2) NOT NULL,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_stat_key (stat_key),
          INDEX idx_updated_at (updated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await executeQuery(createTableSql);
    } catch (error) {
      logError('Erro ao criar tabela stats_cache', error);
      throw error;
    }
  }

  async loadFromCache() {
    try {
      const sql = `
        SELECT stat_key, stat_value, updated_at
        FROM stats_cache
        WHERE stat_key IN ('avg_downloads_per_mod', 'total_downloads', 'total_mods')
      `;
      const results = await executeQuery(sql);
      
      if (results && results.length > 0) {
        results.forEach(row => {
          switch (row.stat_key) {
            case 'avg_downloads_per_mod':
              this.cache.avgDownloadsPerMod = parseFloat(row.stat_value) || 0;
              break;
            case 'total_downloads':
              this.cache.totalDownloads = parseInt(row.stat_value) || 0;
              break;
            case 'total_mods':
              this.cache.totalMods = parseInt(row.stat_value) || 0;
              break;
          }
        });
        
        const lastUpdated = results.reduce((latest, row) => {
          const rowDate = new Date(row.updated_at);
          return !latest || rowDate > latest ? rowDate : latest;
        }, null);
        
        this.cache.lastUpdated = lastUpdated;
        
        logInfo('📊 Estatísticas carregadas do cache', {
          avgDownloadsPerMod: this.cache.avgDownloadsPerMod,
          totalDownloads: this.cache.totalDownloads,
          totalMods: this.cache.totalMods,
          lastUpdated: this.cache.lastUpdated
        });
      } else {
        await this.calculateAndCache();
      }
    } catch (error) {
      logError('Erro ao carregar cache de estatísticas', error);
      await this.calculateAndCache();
    }
  }

  async calculateStats() {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_mods,
          SUM(COALESCE(download_count, 0)) as total_downloads,
          AVG(COALESCE(download_count, 0)) as avg_downloads_per_mod
        FROM mods
        WHERE is_published = 1 AND (is_archived IS NULL OR is_archived = 0)
      `;
      
      const results = await executeQuery(sql);
      
      if (results && results.length > 0) {
        const stats = results[0];
        return {
          totalMods: parseInt(stats.total_mods) || 0,
          totalDownloads: parseInt(stats.total_downloads) || 0,
          avgDownloadsPerMod: parseFloat(stats.avg_downloads_per_mod) || 0
        };
      }
      
      return {
        totalMods: 0,
        totalDownloads: 0,
        avgDownloadsPerMod: 0
      };
    } catch (error) {
      logError('Erro ao calcular estatísticas', error);
      throw error;
    }
  }

  async calculateAndCache() {
    if (this.isUpdating) {
      logInfo('📊 Atualização de estatísticas já em andamento, aguardando...');
      return;
    }

    this.isUpdating = true;
    
    try {
      logInfo('📊 Calculando estatísticas de downloads...');
      
      const stats = await this.calculateStats();
      
      this.cache.avgDownloadsPerMod = stats.avgDownloadsPerMod;
      this.cache.totalDownloads = stats.totalDownloads;
      this.cache.totalMods = stats.totalMods;
      this.cache.lastUpdated = new Date();
      
      await this.saveToCache(stats);
      
      logInfo('✅ Estatísticas calculadas e armazenadas', {
        avgDownloadsPerMod: stats.avgDownloadsPerMod.toFixed(2),
        totalDownloads: stats.totalDownloads,
        totalMods: stats.totalMods
      });
    } catch (error) {
      logError('Erro ao calcular e armazenar estatísticas', error);
    } finally {
      this.isUpdating = false;
    }
  }

  async saveToCache(stats) {
    try {
      const insertOrUpdateSql = `
        INSERT INTO stats_cache (stat_key, stat_value, updated_at)
        VALUES
          ('avg_downloads_per_mod', ?, NOW()),
          ('total_downloads', ?, NOW()),
          ('total_mods', ?, NOW())
        ON DUPLICATE KEY UPDATE
          stat_value = VALUES(stat_value),
          updated_at = NOW()
      `;
      
      await executeQuery(insertOrUpdateSql, [
        stats.avgDownloadsPerMod,
        stats.totalDownloads,
        stats.totalMods
      ]);
    } catch (error) {
      logError('Erro ao salvar estatísticas no cache', error);
      throw error;
    }
  }

  getAvgDownloadsPerMod() {
    if (this.cache.avgDownloadsPerMod !== null && this.cache.avgDownloadsPerMod !== undefined) {
      const value = parseFloat(this.cache.avgDownloadsPerMod);
      return isNaN(value) ? 0 : value;
    }
    return 0;
  }

  getTotalDownloads() {
    if (this.cache.totalDownloads !== null && this.cache.totalDownloads !== undefined) {
      const value = parseInt(this.cache.totalDownloads);
      return isNaN(value) ? 0 : value;
    }
    return 0;
  }

  getTotalMods() {
    if (this.cache.totalMods !== null && this.cache.totalMods !== undefined) {
      const value = parseInt(this.cache.totalMods);
      return isNaN(value) ? 0 : value;
    }
    return 0;
  }

  getAllStats() {
    return {
      avgDownloadsPerMod: this.getAvgDownloadsPerMod(),
      totalDownloads: this.getTotalDownloads(),
      totalMods: this.getTotalMods(),
      lastUpdated: this.cache.lastUpdated
    };
  }

  needsUpdate() {
    if (!this.cache.lastUpdated) {
      return true;
    }
    
    const now = new Date();
    const timeSinceUpdate = now - this.cache.lastUpdated;
    return timeSinceUpdate >= this.updateInterval;
  }

  startAutoUpdate() {
    if (this.needsUpdate()) {
      this.calculateAndCache().catch(error => {
        logError('Erro na atualização inicial de estatísticas', error);
      });
    }
    
    this.updateTimer = setInterval(() => {
      if (this.needsUpdate()) {
        this.calculateAndCache().catch(error => {
          logError('Erro na atualização automática de estatísticas', error);
        });
      }
    }, this.updateInterval);
    
    logInfo(`⏰ Atualização automática de estatísticas configurada (a cada ${this.updateInterval / 1000 / 60} minutos)`);
  }

  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  async forceUpdate() {
    await this.calculateAndCache();
  }
}

const statsService = new StatsService();

export default statsService;
