// Email HTML template centralizado para toda a aplicação

const BRAND = {
  primary: '#6D28D9',
  bgLight: '#FFFFFF',
  panelBg: '#F9FAFB',
  textLight: '#111827',
  mutedLight: '#6B7280',
  bgDark: '#0B0B10',
  textDark: '#E5E7EB',
  mutedDark: '#9CA3AF'
};

export function renderEmailTemplate({
  preheader = '',
  title = 'Mensagem',
  intro = '',
  buttonText = null,
  buttonUrl = null,
  secondary = '',
  brandName = 'Eu, Marko! Mods',
  timingNote = 'Link válido por 24 horas.',
}) {
  const buttonBlock = buttonText && buttonUrl ? `
    <tr>
      <td align="center" style="padding-top: 20px;">
        <a href="${buttonUrl}" style="display:inline-block;padding:12px 18px;background:${BRAND.primary};color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">
          ${buttonText}
        </a>
      </td>
    </tr>
  ` : '';

  return `<!doctype html>
  <html lang="pt-BR">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      @media (prefers-color-scheme: dark) { body { background: ${BRAND.bgDark} !important; color: ${BRAND.textDark} !important; } }
      a { color: ${BRAND.primary}; }
    </style>
  </head>
  <body style="margin:0;background:${BRAND.bgLight};padding:40px 0;color:${BRAND.textLight};">
    <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;color:transparent">${preheader}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;padding:0 24px;">
            <tr>
              <td>
                <!-- Painel (modal) -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.panelBg};border-radius:18px;border:1px solid rgba(109,40,217,.15);box-shadow:0 18px 50px -20px rgba(109,40,217,.25);">
                  <tr>
                    <td style="height:6px;background:linear-gradient(90deg, ${BRAND.primary} 0%, rgba(109,40,217,.4) 60%, transparent 100%);border-top-left-radius:18px;border-top-right-radius:18px;"></td>
                  </tr>
                  <tr>
                    <td style="padding:24px 40px 8px 40px;text-align:center;">
                      <div style="font-size:12px;color:${BRAND.mutedLight};font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">${brandName}</div>
                      <h1 style="margin:10px 0 6px 0;font-size:24px;line-height:1.25;font-weight:800;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">${title}</h1>
                      <p style="margin:0;font-size:14px;line-height:1.7;color:${BRAND.mutedLight};font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">${intro}</p>
                      ${buttonBlock}
                      ${secondary ? `
                      <p style="padding:24px 32px 0 32px;margin:0;font-size:12px;line-height:1.7;color:${BRAND.mutedLight};font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">${secondary}</p>` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 40px 24px 40px;text-align:center;">
                      <p style="margin:0;font-size:11px;color:${BRAND.mutedLight};font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">${timingNote}</p>
                      <p style="margin:4px 0 0 0;font-size:11px;color:${BRAND.mutedLight};font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">© ${new Date().getFullYear()} ${brandName}. Todos os direitos reservados.</p>
                    </td>
                  </tr>
                </table>
                <!-- /Painel -->
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}


