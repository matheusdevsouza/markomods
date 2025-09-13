import { logError, logWarn, logInfo } from '../config/logger.js';
import { LogService } from './LogService.js';

/**
 * Serviço de Monitoramento de Segurança
 * Detecta e responde a atividades suspeitas
 */

class SecurityService {
  constructor() {
    this.failedLogins = new Map(); // IP -> { count, lastAttempt, blocked }
    this.suspiciousIPs = new Set();
    this.blockedIPs = new Set();
    this.rateLimitViolations = new Map();
    
    // Configurações de segurança
    this.maxFailedLogins = 5;
    this.blockDuration = 15 * 60 * 1000; // 15 minutos
    this.suspiciousThreshold = 3;
    
    // Limpar dados antigos a cada 5 minutos
    setInterval(() => this.cleanupOldData(), 5 * 60 * 1000);
  }

  /**
   * Registra tentativa de login falhada
   */
  recordFailedLogin(ip, email, userAgent) {
    const now = Date.now();
    const existing = this.failedLogins.get(ip) || { count: 0, lastAttempt: 0, blocked: false };
    
    existing.count++;
    existing.lastAttempt = now;
    
    // Se excedeu o limite, bloquear IP
    if (existing.count >= this.maxFailedLogins) {
      existing.blocked = true;
      this.blockedIPs.add(ip);
      
      logWarn('🚨 IP BLOQUEADO por tentativas excessivas de login', {
        ip,
        email,
        attempts: existing.count,
        userAgent
      });
      
      // Log de segurança
      LogService.logSecurity(
        null,
        'IP bloqueado por tentativas excessivas',
        `IP ${ip} bloqueado após ${existing.count} tentativas falhadas. Email: ${email}`,
        ip,
        userAgent
      );
    } else {
      logWarn('⚠️ Tentativa de login falhada', {
        ip,
        email,
        attempts: existing.count,
        userAgent
      });
    }
    
    this.failedLogins.set(ip, existing);
    
    // Marcar como suspeito se próximo do limite
    if (existing.count >= this.suspiciousThreshold) {
      this.suspiciousIPs.add(ip);
    }
  }

  /**
   * Registra login bem-sucedido
   */
  recordSuccessfulLogin(ip, userId, userAgent) {
    // Limpar tentativas falhadas para este IP
    this.failedLogins.delete(ip);
    this.suspiciousIPs.delete(ip);
    this.blockedIPs.delete(ip);
    
    logInfo('✅ Login bem-sucedido', { ip, userId });
  }

  /**
   * Verifica se IP está bloqueado
   */
  isIPBlocked(ip) {
    const data = this.failedLogins.get(ip);
    if (!data || !data.blocked) return false;
    
    // Verificar se o bloqueio ainda é válido
    const now = Date.now();
    if (now - data.lastAttempt > this.blockDuration) {
      // Bloqueio expirou, remover
      this.failedLogins.delete(ip);
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }

  /**
   * Verifica se IP é suspeito
   */
  isIPSuspicious(ip) {
    return this.suspiciousIPs.has(ip);
  }

  /**
   * Registra violação de rate limit
   */
  recordRateLimitViolation(ip, endpoint, userAgent) {
    const now = Date.now();
    const key = `${ip}-${endpoint}`;
    const existing = this.rateLimitViolations.get(key) || { count: 0, lastViolation: 0 };
    
    existing.count++;
    existing.lastViolation = now;
    
    this.rateLimitViolations.set(key, existing);
    
    logWarn('🚨 Violação de rate limit', {
      ip,
      endpoint,
      violations: existing.count,
      userAgent
    });
    
    // Se muitas violações, marcar IP como suspeito
    if (existing.count >= 3) {
      this.suspiciousIPs.add(ip);
      
      LogService.logSecurity(
        null,
        'IP marcado como suspeito por violações de rate limit',
        `IP ${ip} marcado como suspeito após ${existing.count} violações em ${endpoint}`,
        ip,
        userAgent
      );
    }
  }

  /**
   * Detecta atividade suspeita
   */
  detectSuspiciousActivity(req, activity) {
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const userId = req.user?.id;
    
    // Padrões suspeitos
    const suspiciousPatterns = [
      /script/i,
      /<script/i,
      /javascript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\.cookie/i,
      /window\.location/i,
      /\.\.\//, // Path traversal
      /union.*select/i, // SQL injection
      /drop.*table/i, // SQL injection
      /insert.*into/i, // SQL injection
      /delete.*from/i, // SQL injection
    ];
    
    // Verificar se a atividade contém padrões suspeitos
    const activityString = JSON.stringify(activity);
    const suspiciousPattern = suspiciousPatterns.find(pattern => pattern.test(activityString));
    
    if (suspiciousPattern) {
      logWarn('🚨 Atividade suspeita detectada', {
        ip,
        userId,
        pattern: suspiciousPattern.source,
        activity: activityString.substring(0, 200),
        userAgent
      });
      
      // Marcar IP como suspeito
      this.suspiciousIPs.add(ip);
      
      // Log de segurança
      LogService.logSecurity(
        userId,
        'Atividade suspeita detectada',
        `Padrão suspeito detectado: ${suspiciousPattern.source}. Atividade: ${activityString.substring(0, 200)}`,
        ip,
        userAgent
      );
      
      return true;
    }
    
    return false;
  }

  /**
   * Analisa logs em busca de padrões de ataque
   */
  analyzeAttackPatterns() {
    // Esta função seria implementada para analisar logs históricos
    // e detectar padrões de ataque mais complexos
    logInfo('🔍 Analisando padrões de ataque...');
  }

  /**
   * Gera relatório de segurança
   */
  generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousIPs: Array.from(this.suspiciousIPs),
      failedLogins: Object.fromEntries(this.failedLogins),
      rateLimitViolations: Object.fromEntries(this.rateLimitViolations),
      stats: {
        totalBlockedIPs: this.blockedIPs.size,
        totalSuspiciousIPs: this.suspiciousIPs.size,
        totalFailedLogins: this.failedLogins.size,
        totalRateLimitViolations: this.rateLimitViolations.size
      }
    };
    
    logInfo('📊 Relatório de segurança gerado', report);
    return report;
  }

  /**
   * Limpa dados antigos
   */
  cleanupOldData() {
    const now = Date.now();
    const cleanupThreshold = 60 * 60 * 1000; // 1 hora
    
    // Limpar tentativas de login antigas
    for (const [ip, data] of this.failedLogins.entries()) {
      if (now - data.lastAttempt > cleanupThreshold) {
        this.failedLogins.delete(ip);
        this.suspiciousIPs.delete(ip);
        this.blockedIPs.delete(ip);
      }
    }
    
    // Limpar violações de rate limit antigas
    for (const [key, data] of this.rateLimitViolations.entries()) {
      if (now - data.lastViolation > cleanupThreshold) {
        this.rateLimitViolations.delete(key);
      }
    }
    
    logInfo('🧹 Dados de segurança antigos limpos');
  }

  /**
   * Middleware para verificar segurança
   */
  securityMiddleware() {
    return (req, res, next) => {
      const ip = req.ip;
      
      // Verificar se IP está bloqueado
      if (this.isIPBlocked(ip)) {
        return res.status(403).json({
          success: false,
          message: 'IP bloqueado por tentativas excessivas de login. Tente novamente mais tarde.',
          retryAfter: Math.round(this.blockDuration / 1000)
        });
      }
      
      // Verificar se IP é suspeito
      if (this.isIPSuspicious(ip)) {
        logWarn('⚠️ Requisição de IP suspeito', {
          ip,
          path: req.path,
          userAgent: req.get('User-Agent')
        });
      }
      
      // Detectar atividade suspeita
      this.detectSuspiciousActivity(req, {
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      next();
    };
  }
}

// Instância singleton
const securityService = new SecurityService();

export default securityService;

// Funções de conveniência
export const recordFailedLogin = (ip, email, userAgent) => securityService.recordFailedLogin(ip, email, userAgent);
export const recordSuccessfulLogin = (ip, userId, userAgent) => securityService.recordSuccessfulLogin(ip, userId, userAgent);
export const isIPBlocked = (ip) => securityService.isIPBlocked(ip);
export const isIPSuspicious = (ip) => securityService.isIPSuspicious(ip);
export const recordRateLimitViolation = (ip, endpoint, userAgent) => securityService.recordRateLimitViolation(ip, endpoint, userAgent);
export const detectSuspiciousActivity = (req, activity) => securityService.detectSuspiciousActivity(req, activity);
export const generateSecurityReport = () => securityService.generateSecurityReport();
export const securityMiddleware = () => securityService.securityMiddleware();

/**
 * Gera relatório de backup (função de conveniência para compatibilidade)
 */
export const generateBackupReport = () => {
  logInfo('📊 Gerando relatório de backup...');
  
  // Em desenvolvimento, retorna dados mockados
  return {
    success: true,
    report: {
      timestamp: new Date().toISOString(),
      backups: [],
      totalBackups: 0,
      lastBackup: null,
      nextScheduledBackup: null
    }
  };
};


