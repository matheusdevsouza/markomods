import { LogService } from '../services/LogService.js';
import { logWarn, logError } from '../config/logger.js';

const sqlInjectionPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
  /(\bOR\b.*=.*)/i,
  /(\bAND\b.*=.*)/i,
  /('|(\\')|(;)|(\\;)|(\|)|(\\|))*(\bOR\b|\bAND\b)/i,
  /(\bUNION\b.*\bSELECT\b)/i,
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b.*\bFROM\b)/i,
  /(\bEXEC\b|\bEXECUTE\b)/i,
  /(\bINTO\b.*\bOUTFILE\b)/i,
  /(\bLOAD_FILE\b)/i,
  /(\bINTO\b.*\bDUMPFILE\b)/i,
  /(;\s*(DROP|DELETE|TRUNCATE))/i,
  /(\b(SELECT|INSERT|UPDATE|DELETE)\b.*\bWHERE\b.*=.*['"]?\s*\d+\s*['"]?\s*OR\s*\d+\s*=\s*\d+)/i,
  /(\b(SELECT|INSERT|UPDATE|DELETE)\b.*\bWHERE\b.*['"]\s*OR\s*['"]\d+['"]\s*=\s*['"]\d+)/i,
  /(;\s*SHOW\s+TABLES)/i,
  /(;\s*SHOW\s+DATABASES)/i,
  /(\b(SELECT|INSERT|UPDATE|DELETE)\b.*\bFROM\b.*\bWHERE\b.*\b1\s*=\s*1)/i,
  /(('|(\\')|(;)|(\\;)|(\|)|(\\|))*(\bOR\b|\bAND\b).*['"]?\s*\d+\s*['"]?\s*=\s*['"]?\s*\d+)/i,
];

const xssPatterns = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/i,
  /on\w+\s*=\s*["'][^"']*["']/i,
  /<img[^>]*onerror/i,
  /<svg[^>]*onload/i,
  /<body[^>]*onload/i,
  /<input[^>]*onfocus/i,
  /<link[^>]*onerror/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /vbscript:/i,
  /data:text\/html/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
];

const pathTraversalPatterns = [
  /\.\.\//g,
  /\.\.\\/g,
  /\.\.\%2F/i,
  /\.\.\%5C/i,
  /\.\.\%2f/i,
  /\.\.\%5c/i,
  /\.\.\x2f/i,
  /\.\.\x5c/i,
  /\.\.%252F/i,
  /\.\.%255C/i,
];

const commandInjectionPatterns = [
  /(;|\||&|`|\$\()/,
  /\b(cat|ls|pwd|whoami|id|uname|ps|kill|rm|mv|cp|chmod|chown|sudo|su|grep|find|tar|zip|unzip|wget|curl|nc|netcat|ssh|telnet|ftp|ping|traceroute|nmap|ifconfig|ipconfig|arp|route|netstat|iptables|firewall|systemctl|service|init\.d|rc\.d)\b/i,
  /(\.\.\/|\.\.\\)/,
  /\$(env|ENV|PATH|HOME|USER|SHELL|PWD|HOSTNAME|HOST)/,
  /<(INPUT|OUTPUT|ERROR)>/i,
  /2>&1/,
];

export function detectSQLInjection(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(input)) {
      return pattern.source;
    }
  }
  
  return null;
}

export function detectXSS(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return pattern.source;
    }
  }
  
  return null;
}

export function detectPathTraversal(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  for (const pattern of pathTraversalPatterns) {
    if (pattern.test(input)) {
      return pattern.source;
    }
  }
  
  return null;
}

export function detectCommandInjection(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  for (const pattern of commandInjectionPatterns) {
    if (pattern.test(input)) {
      return pattern.source;
    }
  }
  
  return null;
}

export function scanForMaliciousPatterns(obj, context = '') {
  const threats = [];
  
  if (!obj || typeof obj !== 'object') {
    return threats;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    const fullContext = context ? `${context}.${key}` : key;
    
    if (typeof value === 'string') {
      const sqlThreat = detectSQLInjection(value);
      if (sqlThreat) {
        threats.push({
          type: 'sql_injection',
          pattern: sqlThreat,
          context: fullContext,
          value: value.substring(0, 200)
        });
      }
      
      const xssThreat = detectXSS(value);
      if (xssThreat) {
        threats.push({
          type: 'xss',
          pattern: xssThreat,
          context: fullContext,
          value: value.substring(0, 200)
        });
      }
      
      const pathThreat = detectPathTraversal(value);
      if (pathThreat) {
        threats.push({
          type: 'path_traversal',
          pattern: pathThreat,
          context: fullContext,
          value: value.substring(0, 200)
        });
      }
      
      const commandThreat = detectCommandInjection(value);
      if (commandThreat) {
        threats.push({
          type: 'command_injection',
          pattern: commandThreat,
          context: fullContext,
          value: value.substring(0, 200)
        });
      }
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const arrayThreats = scanForMaliciousPatterns(value[i], `${fullContext}[${i}]`);
        threats.push(...arrayThreats);
      }
    } else if (typeof value === 'object' && value !== null) {
      const nestedThreats = scanForMaliciousPatterns(value, fullContext);
      threats.push(...nestedThreats);
    }
  }
  
  return threats;
}

export const securityScanningMiddleware = async (req, res, next) => {
  try {
    const threats = [];
    
    if (req.query && Object.keys(req.query).length > 0) {
      const queryThreats = scanForMaliciousPatterns(req.query, 'query');
      threats.push(...queryThreats);
    }
    
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyThreats = scanForMaliciousPatterns(req.body, 'body');
      threats.push(...bodyThreats);
    }
    
    if (req.params && Object.keys(req.params).length > 0) {
      const paramsThreats = scanForMaliciousPatterns(req.params, 'params');
      threats.push(...paramsThreats);
    }
    
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'referer'];
    for (const header of suspiciousHeaders) {
      const headerValue = req.get(header);
      if (headerValue) {
        const headerThreats = scanForMaliciousPatterns({ [header]: headerValue }, 'headers', false);
        threats.push(...headerThreats);
      }
    }
    
    if (threats.length > 0) {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      const userId = req.user?.id || null;
      
      for (const threat of threats) {
        try {
          LogService.createLogAsync({
            userId: userId,
            action: `Tentativa de ${threat.type}`,
            category: 'security',
            level: 'error',
            details: `Tentativa de ${threat.type} detectada: ${threat.pattern} em ${threat.context}`,
            ip,
            userAgent: userAgent,
            metadata: {
              threatType: threat.type,
              pattern: threat.pattern,
              context: threat.context,
              value: threat.value,
              path: req.path,
              method: req.method
            }
          });
        } catch (logError) {
          console.error('Erro ao registrar ameaça de segurança:', logError);
        }
      }
      
      logWarn('Ameaça de segurança detectada', {
        threats,
        ip,
        userId,
        path: req.path,
        method: req.method
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro no middleware de segurança:', error);
    next();
  }
};

export const logUnauthorizedAccess = async (req, res, next) => {
  next();
};

export const logProtectedRouteAccess = async (req, res, next) => {
  try {
    const path = req.path;
    const originalUrl = req.originalUrl || '';
    
    if (path.includes('/logs') || originalUrl.includes('/logs') || path.includes('/api/logs') || originalUrl.includes('/api/logs')) {
      return next();
    }
    
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const userId = req.user?.id || null;
    const userRole = req.user?.role || 'anonymous';
    const method = req.method;
    
    const isAdminRoute = path.includes('/admin') || 
                        path.includes('/security') ||
                        path.includes('/settings') ||
                        path.includes('/administrators');
    
    const isProtectedRoute = path.includes('/user') && method !== 'GET' ||
                            path.includes('/mods') && (method === 'POST' || method === 'PUT' || method === 'DELETE') ||
                            path.includes('/comments') && (method === 'POST' || method === 'PUT' || method === 'DELETE');
    
    if (isAdminRoute || isProtectedRoute) {
      if (userId) {
        LogService.createLogAsync({
          userId,
          action: 'Acesso a rota protegida',
          category: 'security',
          level: 'info',
          details: `Usuário ${userRole} acessou rota protegida: ${method} ${path}`,
          ip,
          userAgent: userAgent,
          metadata: {
            path,
            method,
            userRole,
            routeType: isAdminRoute ? 'admin' : 'protected'
          }
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro no middleware de log de acesso protegido:', error);
    next();
  }
};

export default {
  securityScanningMiddleware,
  logUnauthorizedAccess,
  logProtectedRouteAccess,
  detectSQLInjection,
  detectXSS,
  detectPathTraversal,
  detectCommandInjection,
  scanForMaliciousPatterns
};
