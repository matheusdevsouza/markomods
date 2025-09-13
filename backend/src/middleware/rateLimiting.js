import { logWarn, logInfo } from '../config/logger.js';

/**
 * Middleware de Rate Limiting para redefinição de senha
 */
class RateLimiter {
  constructor() {
    this.requests = new Map(); // IP -> { count, resetTime }
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000); // 5 minutos
  }

  /**
   * Rate limiting para redefinição de senha
   * 3 tentativas por 15 minutos por IP
   */
  forgotPasswordRateLimit() {
    return (req, res, next) => {
      const ip = req.ip;
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutos
      const maxRequests = 3;

      const key = `forgot-password:${ip}`;
      const requestData = this.requests.get(key);

      if (!requestData || now > requestData.resetTime) {
        // Primeira requisição ou janela expirada
        this.requests.set(key, {
          count: 1,
          resetTime: now + windowMs
        });
        return next();
      }

      if (requestData.count >= maxRequests) {
        logWarn('Rate limit excedido para forgot-password', {
          ip,
          count: requestData.count,
          resetTime: new Date(requestData.resetTime)
        });

        return res.status(429).json({
          success: false,
          message: 'Muitas tentativas. Tente novamente em 15 minutos.',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        });
      }

      // Incrementar contador
      requestData.count++;
      this.requests.set(key, requestData);

      next();
    };
  }

  /**
   * Rate limiting para reset de senha
   * 5 tentativas por 1 hora por IP
   */
  resetPasswordRateLimit() {
    return (req, res, next) => {
      const ip = req.ip;
      const now = Date.now();
      const windowMs = 60 * 60 * 1000; // 1 hora
      const maxRequests = 5;

      const key = `reset-password:${ip}`;
      const requestData = this.requests.get(key);

      if (!requestData || now > requestData.resetTime) {
        // Primeira requisição ou janela expirada
        this.requests.set(key, {
          count: 1,
          resetTime: now + windowMs
        });
        return next();
      }

      if (requestData.count >= maxRequests) {
        logWarn('Rate limit excedido para reset-password', {
          ip,
          count: requestData.count,
          resetTime: new Date(requestData.resetTime)
        });

        return res.status(429).json({
          success: false,
          message: 'Muitas tentativas. Tente novamente em 1 hora.',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        });
      }

      // Incrementar contador
      requestData.count++;
      this.requests.set(key, requestData);

      next();
    };
  }

  /**
   * Rate limiting para verificação de token
   * 10 tentativas por 15 minutos por IP
   */
  verifyTokenRateLimit() {
    return (req, res, next) => {
      const ip = req.ip;
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutos
      const maxRequests = 10;

      const key = `verify-token:${ip}`;
      const requestData = this.requests.get(key);

      if (!requestData || now > requestData.resetTime) {
        // Primeira requisição ou janela expirada
        this.requests.set(key, {
          count: 1,
          resetTime: now + windowMs
        });
        return next();
      }

      if (requestData.count >= maxRequests) {
        logWarn('Rate limit excedido para verify-token', {
          ip,
          count: requestData.count,
          resetTime: new Date(requestData.resetTime)
        });

        return res.status(429).json({
          success: false,
          message: 'Muitas tentativas. Tente novamente em 15 minutos.',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        });
      }

      // Incrementar contador
      requestData.count++;
      this.requests.set(key, requestData);

      next();
    };
  }

  /**
   * Limpar dados antigos
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logInfo('Rate limiter cleanup', { cleaned, remaining: this.requests.size });
    }
  }

  /**
   * Obter estatísticas
   */
  getStats() {
    const now = Date.now();
    const stats = {
      total: this.requests.size,
      active: 0,
      expired: 0
    };

    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        stats.expired++;
      } else {
        stats.active++;
      }
    }

    return stats;
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

export default rateLimiter;

// Funções de conveniência
export const forgotPasswordRateLimit = () => rateLimiter.forgotPasswordRateLimit();
export const resetPasswordRateLimit = () => rateLimiter.resetPasswordRateLimit();
export const verifyTokenRateLimit = () => rateLimiter.verifyTokenRateLimit();
