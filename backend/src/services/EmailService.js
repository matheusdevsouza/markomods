import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { logError, logInfo } from '../config/logger.js';

dotenv.config({ path: './config.env' });

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
const smtpSecure = process.env.SMTP_SECURE === 'true';

let transporter;

function getTransporter() {
  if (!transporter) {
    if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure || smtpPort === 465, 
        auth: { 
          user: smtpUser, 
          pass: smtpPass 
        },
        tls: {
          rejectUnauthorized: false 
        }
      });
      
      logInfo('Transporter SMTP configurado', { 
        host: smtpHost, 
        port: smtpPort, 
        secure: smtpSecure || smtpPort === 465 
      });
    } else {
      logInfo('SMTP não configurado, usando modo de desenvolvimento');
      transporter = null;
    }
  }
  return transporter;
}

export class EmailService {
  static async sendMail({ to, subject, html, text }) {
    try {
      const t = getTransporter();
      
      if (!t) {
        logInfo('📧 [MODO DESENVOLVIMENTO] E-mail simulado', {
          to,
          subject,
          html: html ? 'HTML content presente' : 'Sem HTML',
          text: text ? 'Texto presente' : 'Sem texto'
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          messageId: `dev-${Date.now()}`,
          accepted: [to],
          rejected: []
        };
      }
      
      const info = await t.sendMail({
        from: smtpFrom,
        to,
        subject,
        text,
        html
      });
      
      logInfo('E-mail enviado com sucesso', { 
        to, 
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });
      
      return info;
    } catch (error) {
      logError('Erro ao enviar e-mail', error, { to, subject });
      throw error;
    }
  }
}


