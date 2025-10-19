import React, { useEffect } from 'react';

const DomainValidator = () => {
  useEffect(() => {
    const validateDomain = () => {
      const currentHost = window.location.hostname;
      const allowedDomains = [
        'eumarko.com',
        'www.eumarko.com',
        'localhost',
        '127.0.0.1'
      ];

      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (!isDevelopment && !allowedDomains.includes(currentHost)) {
        console.warn('🚨 DOMÍNIO NÃO AUTORIZADO DETECTADO:', currentHost);
        
        document.body.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: 999999;
          ">
            <div style="
              text-align: center;
              max-width: 500px;
              padding: 40px;
              background: #2a2a2a;
              border-radius: 12px;
              border: 2px solid #ff4444;
              box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            ">
              <div style="font-size: 48px; margin-bottom: 20px;">🚨</div>
              <h1 style="color: #ff4444; margin-bottom: 20px; font-size: 24px;">
                DOMÍNIO NÃO AUTORIZADO
              </h1>
              <p style="color: #cccccc; margin-bottom: 20px; line-height: 1.5;">
                Este site está sendo exibido em um domínio não autorizado: <strong>${currentHost}</strong>
              </p>
              <p style="color: #888888; margin-bottom: 30px; line-height: 1.5;">
                Para acessar o site oficial, acesse:
              </p>
              <a href="https://eumarko.com" style="
                display: inline-block;
                background: #007bff;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                transition: background 0.3s;
              " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">
                🌐 ACESSAR SITE OFICIAL
              </a>
              <p style="color: #666666; margin-top: 20px; font-size: 12px;">
                Se você acredita que isso é um erro, entre em contato com o suporte.
              </p>
            </div>
          </div>
        `;

        throw new Error('Domínio não autorizado');
      }
    };

    validateDomain();
  }, []);

  return null;
};

export default DomainValidator;
