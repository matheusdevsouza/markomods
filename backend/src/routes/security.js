import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  generateSecurityReport,
  generateBackupReport 
} from '../services/SecurityService.js';
import { 
  generateBackupReport as getBackupReport,
  listBackups,
  createFullBackup 
} from '../services/BackupService.js';

const router = express.Router();

router.use(authenticateToken, requireAdmin);

// relatorio de seguranã
router.get('/report', (req, res) => {
  try {
    const securityReport = generateSecurityReport();
    res.json({
      success: true,
      data: securityReport
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de segurança:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de segurança'
    });
  }
});

// relatorio de backup
router.get('/backup-report', (req, res) => {
  try {
    const backupReport = getBackupReport();
    res.json({
      success: true,
      data: backupReport
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de backup'
    });
  }
});

// listar backups
router.get('/backups', (req, res) => {
  try {
    const backups = listBackups();
    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar backups'
    });
  }
});

// criar backup manual
router.post('/backup', async (req, res) => {
  try {
    const result = await createFullBackup();
    res.json({
      success: true,
      message: 'Backup criado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar backup'
    });
  }
});

// status de segurança
router.get('/status', (req, res) => {
  try {
    const securityReport = generateSecurityReport();
    const backupReport = getBackupReport();
    
    const status = {
      security: {
        blockedIPs: securityReport.stats.totalBlockedIPs,
        suspiciousIPs: securityReport.stats.totalSuspiciousIPs,
        failedLogins: securityReport.stats.totalFailedLogins,
        rateLimitViolations: securityReport.stats.totalRateLimitViolations
      },
      backup: {
        totalBackups: backupReport.totalBackups,
        totalSizeMB: backupReport.totalSizeMB,
        lastBackup: backupReport.newestBackup
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Erro ao obter status de segurança:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter status de segurança'
    });
  }
});

export default router;


