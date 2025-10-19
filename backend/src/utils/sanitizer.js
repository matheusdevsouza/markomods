import DOMPurify from 'isomorphic-dompurify';

class Sanitizer {

  // sanitizar HTML removendo scripts e conteúdo malicioso
  static sanitizeHTML(dirty) {
    if (!dirty || typeof dirty !== 'string') return '';
    
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'u', 's'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SANITIZE_DOM: true,
      SANITIZE_NAMED_PROPS: true
    });
  }

  // sanitizar texto removendo caracteres perigosos
  static sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/script/gi, '')
      .replace(/iframe/gi, '')
      .replace(/object/gi, '')
      .replace(/embed/gi, '')
      .replace(/link/gi, '')
      .replace(/meta/gi, '')
      .replace(/style/gi, '')
      .trim();
  }

  // sanitizar nome de arquivo
  static sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') return '';
    
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .substring(0, 255);
  }

  // sanitizar URL
  static sanitizeURL(url) {
    if (!url || typeof url !== 'string') return '';
    
    try {
      const urlObj = new URL(url);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '';
      }
      
      return urlObj.toString();
    } catch (error) {
      return '';
    }
  }

  // sanitizar email
  static sanitizeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    
    return email
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9@._-]/g, '')
      .substring(0, 255);
  }

  // sanitizar username
  static sanitizeUsername(username) {
    if (!username || typeof username !== 'string') return '';
    
    return username
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 50)
      .toLowerCase();
  }

  // sanitizar JSON
  static sanitizeJSON(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeText(key);
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.sanitizeJSON(value);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }
    
    return sanitized;
  }

  // remover padrões de SQL injection
  static removeSQLInjection(text) {
    if (!text || typeof text !== 'string') return '';
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
      /(UNION\s+SELECT)/gi,
      /(DROP\s+TABLE)/gi,
      /(INSERT\s+INTO)/gi,
      /(DELETE\s+FROM)/gi,
      /(UPDATE\s+SET)/gi,
      /(ALTER\s+TABLE)/gi,
      /(CREATE\s+TABLE)/gi,
      /(EXEC\s*\()/gi,
      /(SCRIPT\s*\()/gi,
      /(--|\/\*|\*\/)/g,
      /(;|\||&)/g
    ];
    
    let sanitized = text;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  }

  // remover padrões de XSS
  static removeXSS(text) {
    if (!text || typeof text !== 'string') return '';
    
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]*>/g
    ];
    
    let sanitized = text;
    xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  }

  // sanitizar dados de entrada completos
  static sanitizeInput(data) {
    if (!data) return data;
    
    if (typeof data === 'string') {
      return this.sanitizeText(this.removeXSS(this.removeSQLInjection(data)));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      
      for (const [key, value] of Object.entries(data)) {
        sanitized[this.sanitizeText(key)] = this.sanitizeInput(value);
      }
      
      return sanitized;
    }
    
    return data;
  }

  // validar se o texto contém conteúdo malicioso
  static isMalicious(text) {
    if (!text || typeof text !== 'string') return false;
    
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /union.*select/i,
      /drop.*table/i,
      /insert.*into/i,
      /delete.*from/i,
      /update.*set/i,
      /alter.*table/i,
      /create.*table/i,
      /exec\s*\(/i,
      /script\s*\(/i
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(text));
  }
}

export default Sanitizer;

// funções de conveniência
export const sanitizeHTML = (text) => Sanitizer.sanitizeHTML(text);
export const sanitizeText = (text) => Sanitizer.sanitizeText(text);
export const sanitizeFilename = (filename) => Sanitizer.sanitizeFilename(filename);
export const sanitizeURL = (url) => Sanitizer.sanitizeURL(url);
export const sanitizeEmail = (email) => Sanitizer.sanitizeEmail(email);
export const sanitizeUsername = (username) => Sanitizer.sanitizeUsername(username);
export const sanitizeJSON = (obj) => Sanitizer.sanitizeJSON(obj);
export const sanitizeInput = (data) => Sanitizer.sanitizeInput(data);
export const isMalicious = (text) => Sanitizer.isMalicious(text);