import { UserModel } from '../models/UserModel.js';
import { PasswordResetTokenModel } from '../models/PasswordResetTokenModel.js';
import { JWTService } from '../services/JWTService.js';
import { logError, logInfo, logWarn } from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { LogService } from '../services/LogService.js';
import { EmailService } from '../services/EmailService.js';
import { EmailVerificationTokenModel } from '../models/EmailVerificationTokenModel.js';
import { renderEmailTemplate } from '../services/EmailTemplate.js';
import { recordFailedLogin, recordSuccessfulLogin } from '../services/SecurityService.js';
import { sanitizeEmail, sanitizeUsername, sanitizeText } from '../utils/sanitizer.js';
import encryptionService from '../services/EncryptionService.js';

export class AuthController {

  // registro de usuario
  static async register(req, res) {
    try {
      const { username, email, password, display_name } = req.body;
      
      // sanitizacao dos dados de entrada
      const sanitizedUsername = sanitizeUsername(username);
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedDisplayName = sanitizeText(display_name);
      
      // verificar se o email ja existe
      const emailExists = await UserModel.emailExists(sanitizedEmail);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
      
      // verificar se o username ja existe
      const usernameExists = await UserModel.usernameExists(sanitizedUsername);
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username já está em uso'
        });
      }
      
      // criar usuario com os dados ja sanitizados
      const userData = {
        id: uuidv4(),
        username: sanitizedUsername,
        email: sanitizedEmail,
        password,
        display_name: sanitizedDisplayName
      };
      
      const user = await UserModel.create(userData);
      
      const decryptedUser = encryptionService.decryptUserData(user, true);
      
      // gerar tokens (usuario registrado) - JWT não deve conter dados descriptografados
      const tokenPayload = {
        id: user.id,
        role: user.role
      };
      
      const tokens = JWTService.generateTokenPair(tokenPayload);

      // gerar tokens (verificacao de email)
      const verificationToken = uuidv4() + ':' + uuidv4();
      const expiresAt = new Date(Date.now() + (parseInt(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS || '24') * 60 * 60 * 1000));
      await EmailVerificationTokenModel.invalidateUserTokens(user.id);
      await EmailVerificationTokenModel.create({ id: uuidv4(), userId: user.id, token: verificationToken, expiresAt });

      // url de verificacao do email
      const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
      const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;

      // enviar email de verificacao (usar email descriptografado)
      await EmailService.sendMail({
        to: decryptedUser.email,
        subject: 'Verifique seu e-mail - Eu, Marko!',
        html: renderEmailTemplate({
          preheader: 'Confirme seu e-mail para ativar sua conta',
          title: 'Confirme seu e-mail',
          intro: `Olá <strong>${decryptedUser.display_name || decryptedUser.username}</strong>, para ativar sua conta clique no botão abaixo.`,
          buttonText: 'Confirmar e-mail',
          buttonUrl: verifyUrl,
          secondary: `Se o botão não funcionar, copie e cole este link no navegador:<br/><a href="${verifyUrl}">${verifyUrl}</a>`,
          timingNote: 'Link válido por 24 horas.',
          footerNote: 'Este é um e-mail automático. Não responda.'
        })
      });
      
      logInfo('Usuário registrado com sucesso', { userId: user.id, username: sanitizedUsername, email: sanitizedEmail });
      
      try {
        console.log('📝 Criando log de registro...');
        await LogService.logUsers(
          user.id,
          'Conta criada',
          `Novo usuário registrado: ${decryptedUser.username} (${decryptedUser.display_name || decryptedUser.username})`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          user.id,
          {
            email: decryptedUser.email,
            username: decryptedUser.username,
            display_name: decryptedUser.display_name
          }
        );
        console.log('✅ Log de registro criado com sucesso');
      } catch (logErr) {
        console.error('❌ Erro ao criar log de registro:', logErr);
        logError('Erro ao criar log de registro', logErr, { userId: user.id });
      }
      
      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso. Verifique seu e-mail para ativar a conta.',
        data: {
          user: {
            id: decryptedUser.id,
            username: decryptedUser.username,
            email: decryptedUser.email,
            display_name: decryptedUser.display_name,
            role: decryptedUser.role,
            is_verified: decryptedUser.is_verified,
            created_at: decryptedUser.created_at
          },
          tokens
        }
      });
      
    } catch (error) {
      logError('Erro no registro de usuário', error, { body: req.body });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // login dos usuarios
  static async login(req, res) {
    try {
      const { email, password } = req.body;
    
      const sanitizedEmail = sanitizeEmail(email);
      
      // buscar o usuario pelo email
      const user = await UserModel.findByEmail(sanitizedEmail);
      if (!user) {

        // registrar a tentativa de login falhada (email nao encontrado)
        recordFailedLogin(req.ip, sanitizedEmail, req.get('User-Agent'));
        
        logWarn('Tentativa de login com email inexistente', { email: sanitizedEmail, ip: req.ip });
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }
      
      // verificar a senha
      const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {

        // registrar a tentativa de login falhada (senha incorreta)
        recordFailedLogin(req.ip, sanitizedEmail, req.get('User-Agent'));
        
        try {
          await LogService.logFailedLogin(
            req.ip || 'N/A',
            req.get('User-Agent') || 'N/A',
            sanitizedEmail,
            'Senha incorreta',
            { userId: user.id }
          );
        } catch (logErr) {
          console.error('❌ Erro ao criar log de login falhado:', logErr);
        }
        
        logWarn('Tentativa de login com senha incorreta', { email: sanitizedEmail, userId: user.id, ip: req.ip });
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }
      
      // bloquear o login se o usuario nao estiver verificado
      if (!user.is_verified) {
        try {
          await LogService.logFailedLogin(
            req.ip || 'N/A',
            req.get('User-Agent') || 'N/A',
            sanitizedEmail,
            'Conta não verificada',
            { userId: user.id }
          );
        } catch (logErr) {
          console.error('❌ Erro ao criar log de login não verificado:', logErr);
        }
        
        logWarn('Tentativa de login de usuário não verificado', { userId: user.id, email: sanitizedEmail, ip: req.ip });
        return res.status(403).json({
          success: false,
          message: 'Conta não verificada. Verifique seu e-mail para acessar.'
        });
      }
      
      // registrar o login feito com sucesso
      recordSuccessfulLogin(req.ip, user.id, req.get('User-Agent'));
      
      // verificar se a conta esta banida
      if (user.is_banned) {
        try {
          await LogService.logFailedLogin(
            req.ip || 'N/A',
            req.get('User-Agent') || 'N/A',
            sanitizedEmail,
            'Conta banida',
            { userId: user.id }
          );
        } catch (logErr) {
          console.error('❌ Erro ao criar log de login banido:', logErr);
        }
        
        logWarn('Tentativa de login em conta banida', { email, userId: user.id });
        return res.status(403).json({
          success: false,
          message: 'Conta suspensa ou banida'
        });
      }
      
      // atualizar o ultimo login do usuario
      await UserModel.updateLastLogin(user.id);
      
      // descriptografar dados do próprio usuário para exibição
      const decryptedUser = encryptionService.decryptUserData(user, true);
      
      // gerar tokens (usuario logado) - JWT não deve conter dados descriptografados
      const tokenPayload = {
        id: user.id,
        role: user.role
      };
      
      const tokens = JWTService.generateTokenPair(tokenPayload);
      
      logInfo('Usuário logado com sucesso', { userId: user.id });
      
      try {
        await LogService.logAuth(
          user.id,
          'Login realizado',
          `Usuário ${decryptedUser.username} (${decryptedUser.display_name || decryptedUser.username}) fez login com sucesso`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          'info'
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de login:', logErr);
      }
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: decryptedUser.id,
            username: decryptedUser.username,
            email: decryptedUser.email,
            display_name: decryptedUser.display_name,
            avatar_url: decryptedUser.avatar_url,
            role: decryptedUser.role,
            is_verified: decryptedUser.is_verified,
            created_at: decryptedUser.created_at,
            last_login: decryptedUser.last_login
          },
          tokens
        }
      });
      
    } catch (error) {
      logError('Erro no login', error, { email: req.body.email });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // logout dos usuarios
  static async logout(req, res) {
    try {
      // buscar dados do usuário para logs (descriptografar se necessário)
      const userForLog = await UserModel.findById(req.user.id);
      const decryptedUserForLog = userForLog ? encryptionService.decryptUserData(userForLog, true) : null;
      
      try {
        await LogService.logAuth(
          req.user.id,
          'Logout realizado',
          `Usuário ${decryptedUserForLog?.username || req.user.id} fez logout`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          'info'
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de logout:', logErr);
      }
      
      // invalidar o token
      logInfo('Usuário fez logout', { userId: req.user.id, username: decryptedUserForLog?.username || 'N/A' });
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
      
    } catch (error) {
      logError('Erro no logout', error, { userId: req.user?.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // verificar token
  static async verifyToken(req, res) {
    try {
      const userId = req.user.id;
      const userFromDb = await UserModel.findById(userId);
      
      if (!userFromDb) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // descriptografar dados do próprio usuário para exibição
      const decryptedUser = encryptionService.decryptUserData(userFromDb, true);
      
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: {
            id: decryptedUser.id,
            username: decryptedUser.username,
            email: decryptedUser.email,
            display_name: decryptedUser.display_name,
            avatar_url: decryptedUser.avatar_url,
            role: decryptedUser.role,
            is_verified: decryptedUser.is_verified,
            created_at: decryptedUser.created_at,
            last_login: decryptedUser.last_login
          }
        }
      });
      
    } catch (error) {
      logError('Erro na verificação de token', error, { userId: req.user?.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // verificar email via token
  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const decodedToken = decodeURIComponent(token || '');
      const record = await EmailVerificationTokenModel.findByToken(decodedToken);
      
      if (!record) {
        return res.status(400).json({ success: false, message: 'Token inválido' });
      }
      
      if (record.used) {

        // verificar se o token ja foi usado e se o usuario ja esta verificado
        const user = await UserModel.findById(record.user_id);
        if (user && user.is_verified) {
          logInfo('Token já utilizado, mas usuário já verificado', { userId: record.user_id });
          return res.json({ success: true, message: 'E-mail já foi verificado anteriormente' });
        }
        return res.status(400).json({ success: false, message: 'Token já utilizado' });
      }
      
      if (new Date(record.expires_at) < new Date()) {
        return res.status(400).json({ success: false, message: 'Token expirado' });
      }

      const user = await UserModel.findById(record.user_id);
      const decryptedUser = user ? encryptionService.decryptUserData(user, true) : null;
      await UserModel.updateUser(record.user_id, { is_verified: 1 });
      await EmailVerificationTokenModel.markUsed(record.id);

      try {
        await LogService.logEmailVerification(
          record.user_id,
          'Email verificado',
          `Email do usuário ${decryptedUser?.username || record.user_id} foi verificado com sucesso`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          { email: decryptedUser?.email }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de verificação de email:', logErr);
      }

      logInfo('E-mail verificado com sucesso', { userId: record.user_id });
      return res.json({ success: true, message: 'E-mail verificado com sucesso' });
    } catch (error) {
      logError('Erro ao verificar e-mail', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // reenviar verificacao de email
  static async resendVerification(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Autenticação necessária' });
      }
      const user = await UserModel.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      if (user.is_verified) return res.status(400).json({ success: false, message: 'E-mail já verificado' });
      const decryptedUser = encryptionService.decryptUserData(user, true);

      await EmailVerificationTokenModel.invalidateUserTokens(userId);
      const token = uuidv4() + ':' + uuidv4();
      const expiresAt = new Date(Date.now() + (parseInt(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS || '24') * 60 * 60 * 1000));
      await EmailVerificationTokenModel.create({ id: uuidv4(), userId, token, expiresAt });

      try {
        await LogService.logEmailVerification(
          userId,
          'Email de verificação reenviado',
          `Email de verificação reenviado para usuário ${decryptedUser.username || userId}`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          { email: decryptedUser.email }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de reenvio de email:', logErr);
      }

      const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
      const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
      await EmailService.sendMail({
        to: decryptedUser.email,
        subject: 'Confirme seu e-mail - Eu, Marko!',
        html: renderEmailTemplate({
          preheader: 'Reenviamos seu link de verificação',
          title: 'Verificação de e-mail',
          intro: `Olá <strong>${decryptedUser.display_name || decryptedUser.username}</strong>, segue novamente seu link de verificação.`,
          buttonText: 'Confirmar e-mail',
          buttonUrl: verifyUrl,
          timingNote: 'Link válido por 24 horas.',
          secondary: `Se o botão não funcionar, copie e cole este link no navegador:<br/><a href="${verifyUrl}">${verifyUrl}</a>`,
          footerNote: 'Este é um e-mail automático. Não responda.'
        })
      });

      logInfo('Reenvio de verificação de e-mail', { userId });
      return res.json({ success: true, message: 'E-mail de verificação reenviado' });
    } catch (error) {
      logError('Erro ao reenviar verificação de e-mail', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // renovar tokens
  static async refreshTokens(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório'
        });
      }
      
      const newTokens = JWTService.refreshTokens(refreshToken);
      
      logInfo('Tokens renovados com sucesso', { userId: req.user?.id });
      
      res.json({
        success: true,
        message: 'Tokens renovados com sucesso',
        data: {
          tokens: newTokens
        }
      });
      
    } catch (error) {
      logError('Erro na renovação de tokens', error);
      res.status(401).json({
        success: false,
        message: 'Refresh token inválido ou expirado'
      });
    }
  }

  // solicitar recuperação de senha
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');
      
      // sanitizar o email
      const sanitizedEmail = sanitizeEmail(email);
      
      // verificar rate limiting IP
      const isRateLimited = !(await PasswordResetTokenModel.checkRateLimit(ipAddress, 3, 15));
      if (isRateLimited) {
        logWarn('Rate limit excedido para recuperação de senha', { ipAddress, email: sanitizedEmail });
        return res.status(429).json({
          success: false,
          message: 'Muitas tentativas. Tente novamente em 15 minutos.'
        });
      }
      
      // resposta neutra para evitar ataques de timing
      const neutral = () => res.json({ 
        success: true, 
        message: 'Se o email estiver cadastrado, você receberá instruções de recuperação' 
      });
      
      // buscar o usuario pelo email
      const user = await UserModel.findByEmail(sanitizedEmail);
      if (!user || user.is_banned) {
        logInfo('Solicitação de recuperação de senha - usuário não encontrado ou banido', { 
          email: sanitizedEmail, 
          userFound: !!user,
          ipAddress 
        });
        return neutral();
      }
      
      // descriptografar dados 
      const decryptedUser = encryptionService.decryptUserData(user, true);

      try {
        await LogService.logPasswordReset(
          user.id,
          'Solicitação de recuperação de senha',
          `Usuário ${decryptedUser.username} solicitou recuperação de senha`,
          ipAddress || 'N/A',
          userAgent || 'N/A',
          { email: sanitizedEmail }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de recuperação de senha:', logErr);
      }
      
      // verificar se o usuario esta verificado
      if (!user.is_verified) {
        logWarn('Tentativa de recuperação de senha em conta não verificada', { 
          userId: user.id, 
          email: sanitizedEmail,
          ipAddress 
        });
        return neutral();
      }
      
      // invalidar tokens anteriores e criar um novo
      await PasswordResetTokenModel.removeUserTokens(user.id);
      const reset = await PasswordResetTokenModel.create(user.id, ipAddress, userAgent);
      
      const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(reset.token)}`;
      
      // enviar email de recuperação de senha
      await EmailService.sendMail({
        to: decryptedUser.email,
        subject: 'Redefinir Senha - Eu, Marko!',
        html: renderEmailTemplate({
          preheader: 'Crie uma nova senha segura para sua conta',
          title: 'Redefinir Senha',
          intro: `
            <p style="margin: 0 0 16px 0;">Olá <strong>${decryptedUser.display_name || decryptedUser.username}</strong>,</p>
            <p style="margin: 0 0 16px 0;">Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Eu, Marko!</strong></p>
            <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #1E40AF; font-weight: 600; margin: 0; font-size: 15px;">
                🔐 Redefina sua senha com segurança
              </p>
            </div>
            <p style="margin: 0 0 12px 0;">Para criar uma nova senha, siga os passos abaixo:</p>
            <ol style="text-align: left; margin: 12px 0; padding-left: 24px; line-height: 1.8;">
              <li>Clique no botão <strong>"Redefinir Senha"</strong> abaixo</li>
              <li>Digite sua nova senha (mínimo de 8 caracteres)</li>
              <li>Confirme sua nova senha</li>
              <li>Clique em <strong>"Alterar Senha"</strong></li>
            </ol>
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
              <p style="color: #92400E; margin: 0; font-size: 13px; line-height: 1.6;">
                <strong>💡 Dica de segurança:</strong> Use uma senha forte com letras maiúsculas, minúsculas, números e caracteres especiais. Não compartilhe sua senha com ninguém.
              </p>
            </div>
            <p style="margin: 16px 0 0 0;">Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança. Sua senha atual permanecerá inalterada.</p>
          `,
          buttonText: 'Redefinir Senha',
          buttonUrl: resetUrl,
          timingNote: 'Este link expira em 24 horas por questões de segurança.',
          secondary: `Se o botão não funcionar, copie e cole este link no navegador:<br/><a href="${resetUrl}" style="word-break: break-all; color: #6D28D9;">${resetUrl}</a><br/><br/>Se você não solicitou esta alteração, ignore este e-mail.`,
          footerNote: 'Este é um e-mail automático. Não responda.'
        })
      });
      
      logInfo('E-mail de reset enviado com sucesso', { 
        userId: user.id, 
        email: sanitizedEmail,
        ipAddress,
        tokenId: reset.id
      });
      
      return neutral();
    } catch (error) {
      logError('Erro na solicitação de recuperação de senha', error, { 
        email: req.body.email,
        ipAddress: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // verificar token de reset
  static async verifyResetToken(req, res) {
    try {
      const { token } = req.params;
      const ipAddress = req.ip;
      
      // buscar o token
      const tokenData = await PasswordResetTokenModel.findByToken(token);
      
      if (!tokenData) {
        logWarn('Tentativa de verificação de token inexistente', { token, ipAddress });
        return res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }
      
      // verificar se o token expirou
      if (new Date() > new Date(tokenData.expires_at)) {
        logWarn('Tentativa de uso de token expirado', { 
          tokenId: tokenData.id, 
          userId: tokenData.user_id,
          ipAddress 
        });
        return res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }
      
      // verificar se o token ja foi usado
      if (tokenData.used_at) {
        logWarn('Tentativa de reutilização de token', { 
          tokenId: tokenData.id, 
          userId: tokenData.user_id,
          ipAddress 
        });
        return res.status(400).json({
          success: false,
          message: 'Token já foi utilizado'
        });
      }
      
      // verificar se o token excedeu as tentativas maximas permitidas
      const hasExceededAttempts = await PasswordResetTokenModel.hasExceededMaxAttempts(tokenData.id, 5);
      if (hasExceededAttempts) {
        logWarn('Token excedeu tentativas máximas', { 
          tokenId: tokenData.id, 
          userId: tokenData.user_id,
          ipAddress 
        });
        return res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }
      
      res.json({
        success: true,
        message: 'Token válido'
      });
      
    } catch (error) {
      logError('Erro na verificação de token de reset', error, { 
        token: req.params.token,
        ipAddress: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // resetar senha
  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');
      
      // buscar o token
      const tokenData = await PasswordResetTokenModel.findByToken(token);
      
      if (!tokenData) {
        logWarn('Tentativa de reset com token inexistente', { token, ipAddress });
        return res.status(400).json({ 
          success: false, 
          message: 'Token inválido ou expirado' 
        });
      }
      
      // verificar se o token expirou
      if (new Date() > new Date(tokenData.expires_at)) {
        logWarn('Tentativa de reset com token expirado', { 
          tokenId: tokenData.id, 
          userId: tokenData.user_id,
          ipAddress 
        });
        return res.status(400).json({ 
          success: false, 
          message: 'Token inválido ou expirado' 
        });
      }
      
      // verificar se o token ja foi usado
      if (tokenData.used_at) {
        logWarn('Tentativa de reutilização de token para reset', { 
          tokenId: tokenData.id, 
          userId: tokenData.user_id,
          ipAddress 
        });
        return res.status(400).json({ 
          success: false, 
          message: 'Token já foi utilizado' 
        });
      }
      
      // verificar se o token excedeu as tentativas maximas permitidas
      const hasExceededAttempts = await PasswordResetTokenModel.hasExceededMaxAttempts(tokenData.id, 5);
      if (hasExceededAttempts) {
        logWarn('Token excedeu tentativas máximas para reset', { 
          tokenId: tokenData.id, 
          userId: tokenData.user_id,
          ipAddress 
        });
        return res.status(400).json({ 
          success: false, 
          message: 'Token inválido ou expirado' 
        });
      }
      
      // incrementar as tentativas
      await PasswordResetTokenModel.incrementAttempts(tokenData.id);
      const user = await UserModel.findById(tokenData.user_id);
      const decryptedUser = user ? encryptionService.decryptUserData(user, true) : null;
      await UserModel.updatePassword(tokenData.user_id, password);
      await PasswordResetTokenModel.markAsUsed(tokenData.id);
      await PasswordResetTokenModel.removeUserTokens(tokenData.user_id);

      try {
        await LogService.logPasswordReset(
          tokenData.user_id,
          'Senha redefinida com sucesso',
          `Usuário ${decryptedUser?.username || tokenData.user_id} redefiniu a senha com sucesso via token`,
          ipAddress || 'N/A',
          userAgent || 'N/A',
          { tokenId: tokenData.id }
        );
      } catch (logErr) {
        console.error('❌ Erro ao criar log de redefinição de senha:', logErr);
      }
      
      logInfo('Senha resetada com sucesso', { 
        userId: tokenData.user_id,
        tokenId: tokenData.id,
        ipAddress 
      });
      
      res.json({ 
        success: true, 
        message: 'Senha alterada com sucesso' 
      });
      
    } catch (error) {
      logError('Erro no reset de senha', error, { 
        token: req.body.token,
        ipAddress: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // alterar senha
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // verificar a senha atual
      const isValidPassword = await UserModel.verifyPassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }
      
      // atualizar a senha
      await UserModel.updatePassword(userId, newPassword);
      
      logInfo('Senha alterada pelo usuário', { userId });
      
      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
      
    } catch (error) {
      logError('Erro na alteração de senha', error, { userId: req.user?.id });
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

