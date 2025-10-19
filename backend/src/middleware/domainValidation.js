export const validateDomain = (req, res, next) => {
  const host = req.get('host');
  const allowedDomains = [
    'eumarko.com',
    'www.eumarko.com'
  ];

  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    allowedDomains.push('localhost:3001', '127.0.0.1:3001');
  }

  if (!allowedDomains.includes(host)) {
    console.warn('🚨 TENTATIVA DE ACESSO DE DOMÍNIO NÃO AUTORIZADO:', {
      host,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    return res.status(403).json({
      success: false,
      message: 'Domínio não autorizado',
      error: 'FORBIDDEN_DOMAIN'
    });
  }

  next();
};

export const logSuspiciousActivity = (req, res, next) => {
  const host = req.get('host');
  const userAgent = req.get('user-agent');
  const ip = req.ip;

  const suspiciousDomains = [
    'accedeliderescl.site',
    'www.accedeliderescl.site',
    'enjooei.shop',
    'www.enjooei.shop'
  ];

  if (suspiciousDomains.includes(host)) {
    console.error('🚨 ATIVIDADE SUSPEITA DETECTADA:', {
      host,
      ip,
      userAgent,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      headers: {
        'x-forwarded-for': req.get('x-forwarded-for'),
        'x-real-ip': req.get('x-real-ip'),
        'referer': req.get('referer')
      }
    });
  }

  next();
};
