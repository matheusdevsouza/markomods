import { logWarn, logError } from '../config/logger.js';
import { LogService } from '../services/LogService.js';
import { recordFailedLogin, recordRateLimitViolation } from '../services/SecurityService.js';

// lista de IPs suspeitos conhecidos
const suspiciousIPs = new Set();

// lista de agents suspeitos
const suspiciousUserAgents = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /wget/i,
  /curl/i,
  /python/i,
  /java/i,
  /php/i,
  /perl/i,
  /ruby/i,
  /go-http/i,
  /okhttp/i,
  /apache/i,
  /nginx/i
];

// middleware para detectar tentativas de acesso administrativo suspeitas
export const detectSuspiciousAdminAccess = async (req, res, next) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  const isSuspiciousUserAgent = suspiciousUserAgents.some(pattern => pattern.test(userAgent));
  
  if (isSuspiciousUserAgent) {
    try {
      await LogService.logSecurity(
        userId,
        'User Agent suspeito detectado em rota administrativa',
        `User Agent suspeito detectado tentando acessar rota administrativa: ${req.method} ${req.path}. User Agent: ${userAgent}`,
        ip,
        userAgent,
        'error',
        {
          path: req.path,
          method: req.method,
          userRole: userRole || 'anonymous',
          reason: 'suspicious_user_agent',
          userAgent
        }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de user agent suspeito:', logErr);
    }
    
    logWarn('🚨 User Agent suspeito detectado em rota administrativa', {
      ip,
      userAgent,
      userId,
      userRole,
      path: req.path
    });
    
    suspiciousIPs.add(ip);
    recordRateLimitViolation(ip, 'suspicious_admin_access', userAgent);
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. User Agent não autorizado.'
    });
  }
  
  if (suspiciousIPs.has(ip)) {
    try {
      await LogService.logSecurity(
        userId,
        'IP suspeito tentando acessar rota administrativa',
        `IP marcado como suspeito tentou acessar rota administrativa: ${req.method} ${req.path}`,
        ip,
        userAgent,
        'error',
        {
          path: req.path,
          method: req.method,
          userRole: userRole || 'anonymous',
          reason: 'suspicious_ip',
          ip
        }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de IP suspeito:', logErr);
    }
    
    logWarn('🚨 IP suspeito tentando acessar rota administrativa', {
      ip,
      userId,
      userRole,
      path: req.path
    });
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. IP suspeito detectado.'
    });
  }
  
  next();
};

export const validateAdminAccessPattern = async (req, res, next) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  const isAdmin = ['supervisor', 'admin', 'moderator'].includes(userRole);
  
  if (!isAdmin) {
    try {
      await LogService.logSecurity(
        userId,
        'Tentativa de escalação de privilégios',
        `Usuário comum (role: '${userRole}') tentou acessar rota administrativa: ${req.method} ${req.path}`,
        ip,
        userAgent,
        'error',
        {
          path: req.path,
          method: req.method,
          userRole: userRole || 'anonymous',
          userId: userId || 'anonymous',
          reason: 'privilege_escalation',
          username: req.user?.username || 'unknown'
        }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de escalação de privilégios:', logErr);
    }
    
    logWarn('🚨 Usuário não-admin tentando acessar rota administrativa', {
      ip,
      userId,
      userRole,
      path: req.path,
      userAgent
    });
    
    recordRateLimitViolation(ip, 'privilege_escalation_attempt', userAgent);
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissões insuficientes.'
    });
  }
  
  next();
};

export const checkAdminAccessFrequency = async (req, res, next) => {
  const ip = req.ip;
  const userId = req.user?.id;
  
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const maxRequests = 10;
  
  const key = `admin_access_${ip}_${userId}`;
  const requests = global.adminAccessRequests || new Map();
  
  if (!requests.has(key)) {
    requests.set(key, { count: 0, resetTime: now + windowMs });
  }
  
  const requestData = requests.get(key);
  
  if (now > requestData.resetTime) {
    requestData.count = 0;
    requestData.resetTime = now + windowMs;
  }
  
  requestData.count++;
  
  if (requestData.count > maxRequests) {
    try {
      await LogService.logSecurity(
        userId,
        'Rate limit excedido para acesso administrativo',
        `Usuário excedeu limite de requisições administrativas. ${requestData.count} requisições em ${Math.round(windowMs / 1000 / 60)} minutos. Limite: ${maxRequests}. Rota: ${req.method} ${req.path}`,
        ip,
        req.get('User-Agent') || 'unknown',
        'warning',
        {
          path: req.path,
          method: req.method,
          userId: userId || 'anonymous',
          count: requestData.count,
          maxRequests,
          windowMinutes: Math.round(windowMs / 1000 / 60),
          reason: 'rate_limit_exceeded'
        }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de rate limit:', logErr);
    }
    
    logWarn('🚨 Rate limit excedido para acesso administrativo', {
      ip,
      userId,
      count: requestData.count,
      maxRequests,
      path: req.path
    });
    
    suspiciousIPs.add(ip);
    
    return res.status(429).json({
      success: false,
      message: 'Muitas requisições administrativas. Tente novamente mais tarde.',
      retryAfter: Math.round((requestData.resetTime - now) / 1000)
    });
  }
  
  next();
};

export const validateRequestOrigin = async (req, res, next) => {
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  const host = req.get('Host');
  
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];
  
  if (origin && !allowedOrigins.includes(origin)) {
    try {
      await LogService.logSecurity(
        req.user?.id,
        'Tentativa de acesso de origem não autorizada',
        `Tentativa de acesso à rota administrativa ${req.method} ${req.path} de origem não autorizada: ${origin}`,
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        'error',
        {
          path: req.path,
          method: req.method,
          origin,
          referer,
          host,
          allowedOrigins,
          reason: 'unauthorized_origin'
        }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de origem não autorizada:', logErr);
    }
    
    logWarn('🚨 Origem não autorizada em rota administrativa', {
      origin,
      referer,
      host,
      path: req.path,
      ip: req.ip
    });
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Origem não autorizada.'
    });
  }
  
  next();
};

export const validateSecurityHeaders = async (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const accept = req.get('Accept') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  const hasValidHeaders = userAgent &&
                         accept &&
                         acceptLanguage &&
                         acceptEncoding;
  
  if (!hasValidHeaders) {
    try {
      await LogService.logSecurity(
        req.user?.id,
        'Headers suspeitos em rota administrativa',
        `Tentativa de acesso à rota administrativa ${req.method} ${req.path} com headers inválidos ou ausentes`,
        req.ip || 'unknown',
        userAgent || 'unknown',
        'warning',
        {
          path: req.path,
          method: req.method,
          userAgent,
          accept,
          acceptLanguage,
          acceptEncoding,
          reason: 'suspicious_headers'
        }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de headers suspeitos:', logErr);
    }
    
    logWarn('🚨 Headers suspeitos em rota administrativa', {
      userAgent,
      accept,
      acceptLanguage,
      acceptEncoding,
      path: req.path,
      ip: req.ip
    });
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Headers inválidos.'
    });
  }
  
  next();
};

export const adminSecurityMiddleware = [
  detectSuspiciousAdminAccess,
  validateAdminAccessPattern,
  checkAdminAccessFrequency,
  validateRequestOrigin,
  validateSecurityHeaders
];

export default adminSecurityMiddleware;


