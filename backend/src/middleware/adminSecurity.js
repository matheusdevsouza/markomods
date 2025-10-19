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
export const detectSuspiciousAdminAccess = (req, res, next) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  // verificar se é uma rota administrativa
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  // verificar agent suspeito
  const isSuspiciousUserAgent = suspiciousUserAgents.some(pattern => pattern.test(userAgent));
  
  if (isSuspiciousUserAgent) {
    logWarn('🚨 User Agent suspeito detectado em rota administrativa', {
      ip,
      userAgent,
      userId,
      userRole,
      path: req.path
    });
    
    // deixar IP como suspeito
    suspiciousIPs.add(ip);
    
    // registrar tentativa de acesso suspeita
    recordRateLimitViolation(ip, 'suspicious_admin_access', userAgent);
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. User Agent não autorizado.'
    });
  }
  
  // verificar se IP está na lista de suspeitos
  if (suspiciousIPs.has(ip)) {
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

// middleware para verificar padrões de acesso administrativo
export const validateAdminAccessPattern = (req, res, next) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  // verificar se é uma rota administrativa
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  // verificar se o usuário tem cargo de admin
  const isAdmin = ['admin', 'super_admin', 'moderator'].includes(userRole);
  
  if (!isAdmin) {
    logWarn('🚨 Usuário não-admin tentando acessar rota administrativa', {
      ip,
      userId,
      userRole,
      path: req.path,
      userAgent
    });
    
    // registrar tentativa de escalação de privilégios
    recordRateLimitViolation(ip, 'privilege_escalation_attempt', userAgent);
    
    // log de segurança
    LogService.logSecurity(
      userId,
      'Tentativa de escalação de privilégios',
      `Usuário com role '${userRole}' tentou acessar rota administrativa: ${req.path}`,
      ip,
      userAgent
    );
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissões insuficientes.'
    });
  }
  
  next();
};

// middleware para verificar frequência de acesso administrativo
export const checkAdminAccessFrequency = (req, res, next) => {
  const ip = req.ip;
  const userId = req.user?.id;
  
  // verificar se é uma rota administrativa
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  // implementar rate limiting específico para rotas administrativas
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; 
  const maxRequests = 10; 
  
  const key = `admin_access_${ip}_${userId}`;
  const requests = global.adminAccessRequests || new Map();
  
  if (!requests.has(key)) {
    requests.set(key, { count: 0, resetTime: now + windowMs });
  }
  
  const requestData = requests.get(key);
  
  // resetar contador se a janela expirou
  if (now > requestData.resetTime) {
    requestData.count = 0;
    requestData.resetTime = now + windowMs;
  }
  
  // aumentar contador
  requestData.count++;
  
  // verificar se passou do limite
  if (requestData.count > maxRequests) {
    logWarn('🚨 Rate limit excedido para acesso administrativo', {
      ip,
      userId,
      count: requestData.count,
      maxRequests,
      path: req.path
    });
    
    // deixar IP como suspeito
    suspiciousIPs.add(ip);
    
    return res.status(429).json({
      success: false,
      message: 'Muitas requisições administrativas. Tente novamente mais tarde.',
      retryAfter: Math.round((requestData.resetTime - now) / 1000)
    });
  }
  
  next();
};

// middleware para verificar origem da requisição
export const validateRequestOrigin = (req, res, next) => {
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  const host = req.get('Host');
  
  // verificar se é uma rota administrativa
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  // lista de origens permitidas
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];
  
  // verificar origem
  if (origin && !allowedOrigins.includes(origin)) {
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

// middleware para verificar headers de segurança
export const validateSecurityHeaders = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const accept = req.get('Accept') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  
  // verificar se é uma rota administrativa
  const isAdminRoute = req.path.includes('/admin') || 
                      req.path.includes('/security') ||
                      req.path.includes('/logs') ||
                      req.path.includes('/settings');
  
  if (!isAdminRoute) {
    return next();
  }
  
  // verificar se headers parecem legítimos
  const hasValidHeaders = userAgent && 
                         accept && 
                         acceptLanguage && 
                         acceptEncoding;
  
  if (!hasValidHeaders) {
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

// middleware principal de segurança administrativa
export const adminSecurityMiddleware = [
  detectSuspiciousAdminAccess,
  validateAdminAccessPattern,
  checkAdminAccessFrequency,
  validateRequestOrigin,
  validateSecurityHeaders
];

export default adminSecurityMiddleware;


