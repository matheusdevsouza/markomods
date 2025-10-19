import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logError, logInfo, logWarn } from '../config/logger.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.maxBackups = 30; 
    this.backupInterval = 24 * 60 * 60 * 1000; 
    
    // criar diretório de backup se não existir
    this.ensureBackupDirectory();
    
    // iniciar backup automático 
    if (process.env.NODE_ENV === 'production') {
      this.startAutomaticBackup();
    } else {
      logInfo('🔧 Backup automático desabilitado em modo desenvolvimento');
    }
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logInfo('📁 Diretório de backup criado', { path: this.backupDir });
    }
  }

  async createDatabaseBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `database-backup-${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFile);
      const command = `mysqldump -u ${process.env.DB_USER || 'root'} -p${process.env.DB_PASSWORD || ''} ${process.env.DB_NAME || 'markomods_db'} > "${backupPath}"`;
      
      logInfo('🔄 Iniciando backup do banco de dados...', { backupFile });
      
      await execAsync(command);
      
      const stats = fs.statSync(backupPath);
      if (stats.size === 0) {
        throw new Error('Backup vazio - possível erro na conexão com o banco');
      }
      
      logInfo('✅ Backup do banco de dados criado com sucesso', {
        backupFile,
        size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        path: backupPath
      });
      
      // limpar backups antigos
      await this.cleanupOldBackups();
      
      return {
        success: true,
        backupFile,
        path: backupPath,
        size: stats.size,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logError('❌ Erro ao criar backup do banco de dados', error);
      throw error;
    }
  }

  async createFilesBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `files-backup-${timestamp}.tar.gz`;
      const backupPath = path.join(this.backupDir, backupFile);
      const uploadsDir = path.join(__dirname, '../../uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        logWarn('⚠️ Diretório de uploads não encontrado', { uploadsDir });
        return null;
      }
      
      const command = `tar -czf "${backupPath}" -C "${path.dirname(uploadsDir)}" "${path.basename(uploadsDir)}"`;
      
      logInfo('🔄 Iniciando backup dos arquivos...', { backupFile });
      
      await execAsync(command);
      
      const stats = fs.statSync(backupPath);
      
      logInfo('✅ Backup dos arquivos criado com sucesso', {
        backupFile,
        size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        path: backupPath
      });
      
      return {
        success: true,
        backupFile,
        path: backupPath,
        size: stats.size,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logError('❌ Erro ao criar backup dos arquivos', error);
      throw error;
    }
  }

  async createFullBackup() {
    try {
      logInfo('🚀 Iniciando backup completo...');
      
      const results = {
        database: null,
        files: null,
        timestamp: new Date().toISOString()
      };
      
      // backup do banco de dados
      try {
        results.database = await this.createDatabaseBackup();
      } catch (error) {
        logError('❌ Falha no backup do banco de dados', error);
        results.database = { success: false, error: error.message };
      }
      
      // backup dos arquivos
      try {
        results.files = await this.createFilesBackup();
      } catch (error) {
        logError('❌ Falha no backup dos arquivos', error);
        results.files = { success: false, error: error.message };
      }
      
      const success = results.database?.success || results.files?.success;
      
      if (success) {
        logInfo('✅ Backup completo finalizado', results);
      } else {
        logError('❌ Backup completo falhou', results);
      }
      
      return results;
      
    } catch (error) {
      logError('❌ Erro no backup completo', error);
      throw error;
    }
  }

  async cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('database-backup-') || file.startsWith('files-backup-'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime); 
      
      // deixar somente os backups mais recentes
      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);
        
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          logInfo('🗑️ Backup antigo removido', { file: file.name });
        }
        
        logInfo('🧹 Limpeza de backups concluída', {
          totalFiles: backupFiles.length,
          deletedFiles: filesToDelete.length,
          remainingFiles: this.maxBackups
        });
      }
      
    } catch (error) {
      logError('❌ Erro ao limpar backups antigos', error);
    }
  }

  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('database-backup-') || file.startsWith('files-backup-'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.mtime,
            type: file.startsWith('database-backup-') ? 'database' : 'files'
          };
        })
        .sort((a, b) => b.created - a.created);
      
      return backupFiles;
      
    } catch (error) {
      logError('❌ Erro ao listar backups', error);
      return [];
    }
  }

  async restoreDatabaseBackup(backupFile) {
    try {
      const backupPath = path.join(this.backupDir, backupFile);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error('Arquivo de backup não encontrado');
      }
      
      const command = `mysql -u ${process.env.DB_USER || 'root'} -p${process.env.DB_PASSWORD || ''} ${process.env.DB_NAME || 'markomods_db'} < "${backupPath}"`;
      
      logInfo('🔄 Iniciando restauração do banco de dados...', { backupFile });
      
      await execAsync(command);
      
      logInfo('✅ Banco de dados restaurado com sucesso', { backupFile });
      
      return { success: true, backupFile };
      
    } catch (error) {
      logError('❌ Erro ao restaurar backup do banco de dados', error);
      throw error;
    }
  }

  startAutomaticBackup() {
    this.createFullBackup().catch(error => {
      logError('❌ Erro no backup automático inicial', error);
    });
    
    // backups regulares
    setInterval(() => {
      this.createFullBackup().catch(error => {
        logError('❌ Erro no backup automático agendado', error);
      });
    }, this.backupInterval);
    
    logInfo('⏰ Backup automático configurado', {
      interval: `${this.backupInterval / 1000 / 60 / 60} horas`,
      maxBackups: this.maxBackups
    });
  }

  generateBackupReport() {
    const backups = this.listBackups();
    const databaseBackups = backups.filter(b => b.type === 'database');
    const fileBackups = backups.filter(b => b.type === 'files');
    
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    
    return {
      timestamp: new Date().toISOString(),
      totalBackups: backups.length,
      databaseBackups: databaseBackups.length,
      fileBackups: fileBackups.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].created : null,
      newestBackup: backups.length > 0 ? backups[0].created : null,
      backups: backups.slice(0, 10) 
    };
  }
}

// instancia singleton
const backupService = new BackupService();

export default backupService;

// funcoes de conveniencia
export const createDatabaseBackup = () => backupService.createDatabaseBackup();
export const createFilesBackup = () => backupService.createFilesBackup();
export const createFullBackup = () => backupService.createFullBackup();
export const listBackups = () => backupService.listBackups();
export const restoreDatabaseBackup = (backupFile) => backupService.restoreDatabaseBackup(backupFile);
export const generateBackupReport = () => backupService.generateBackupReport();


