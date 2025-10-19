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
      
      // gerar tokens (usuario registrado)
      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
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

      // enviar email de verificacao
      await EmailService.sendMail({
        to: user.email,
        subject: 'Verifique seu e-mail - Eu, Marko!',
        html: renderEmailTemplate({
          preheader: 'Confirme seu e-mail para ativar sua conta',
          title: 'Confirme seu e-mail',
          intro: `Olá <strong>${user.display_name || user.username}</strong>, para ativar sua conta clique no botão abaixo.`,
          buttonText: 'Confirmar e-mail',
          buttonUrl: verifyUrl,
          secondary: `Se o botão não funcionar, copie e cole este link no navegador:<br/><a href="${verifyUrl}">${verifyUrl}</a>`,
          timingNote: 'Link válido por 24 horas.',
          footerNote: 'Este é um e-mail automático. Não responda.'
        })
      });
      
      logInfo('Usuário registrado com sucesso', { userId: user.id, username, email });
      
      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso. Verifique seu e-mail para ativar a conta.',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            display_name: user.display_name,
            role: user.role,
            is_verified: user.is_verified,
            created_at: user.created_at
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
      
      // sanitizar o email
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
        
        logWarn('Tentativa de login com senha incorreta', { email: sanitizedEmail, userId: user.id, ip: req.ip });
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }
      
      // bloquear o login se o usuario nao estiver verificado
      if (!user.is_verified) {
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
        logWarn('Tentativa de login em conta banida', { email, userId: user.id });
        return res.status(403).json({
          success: false,
          message: 'Conta suspensa ou banida'
        });
      }
      
      // atualizar o ultimo login do usuario
      await UserModel.updateLastLogin(user.id);
      
      // gerar tokens (usuario logado)
      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      const tokens = JWTService.generateTokenPair(tokenPayload);
      
      logInfo('Usuário logado com sucesso', { userId: user.id, username: user.username });
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            role: user.role,
            is_verified: user.is_verified,
            created_at: user.created_at,
            last_login: user.last_login
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
      
      // invalidar o token
      logInfo('Usuário fez logout', { userId: req.user.id, username: req.user.username });
      
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
      const user = req.user;
      
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            role: user.role,
            is_verified: user.is_verified,
            created_at: user.created_at,
            last_login: user.last_login
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

      // marcar o usuario como verificado
      await UserModel.updateUser(record.user_id, { is_verified: 1 });
      await EmailVerificationTokenModel.markUsed(record.id);

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

      await EmailVerificationTokenModel.invalidateUserTokens(userId);
      const token = uuidv4() + ':' + uuidv4();
      const expiresAt = new Date(Date.now() + (parseInt(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS || '24') * 60 * 60 * 1000));
      await EmailVerificationTokenModel.create({ id: uuidv4(), userId, token, expiresAt });

      const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
      const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
      await EmailService.sendMail({
        to: user.email,
        subject: 'Confirme seu e-mail - Eu, Marko!',
        html: renderEmailTemplate({
          preheader: 'Reenviamos seu link de verificação',
          title: 'Verificação de e-mail',
          intro: `Olá <strong>${user.display_name || user.username}</strong>, segue novamente seu link de verificação.`,
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
      
      // verificar rate limiting por IP
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
        to: user.email,
        subject: 'Redefinir senha - Eu, Marko!',
        html: renderEmailTemplate({
          preheader: 'Crie uma nova senha com segurança',
          title: 'Redefinir senha',
          intro: `Olá <strong>${user.display_name || user.username}</strong>, clique no botão abaixo para criar uma nova senha.`,
          buttonText: 'Redefinir senha',
          buttonUrl: resetUrl,
          timingNote: 'Link válido por 24 horas.',
          secondary: `Se você não solicitou, ignore este e-mail. Caso o botão não funcione, copie e cole este link no navegador:<br/><a href="${resetUrl}">${resetUrl}</a>`,
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
      
      // atualizar a senha
      await UserModel.updatePassword(tokenData.user_id, password);
      
      // marcar o token como usado
      await PasswordResetTokenModel.markAsUsed(tokenData.id);
      
      // invalidar todos os outros tokens do usuario
      await PasswordResetTokenModel.removeUserTokens(tokenData.user_id);
      
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
      
      // buscar o usuario com a senha
      const user = await UserModel.findByEmail(req.user.email);
      
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

