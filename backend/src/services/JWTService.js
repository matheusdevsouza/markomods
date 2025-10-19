import jwt from 'jsonwebtoken';
import { logError, logInfo, logWarn } from '../config/logger.js';

export class JWTService {

  // gerar access token
  static generateAccessToken(payload) {
    try {
      const secret = process.env.JWT_SECRET;
      const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
      
      if (!secret) {
        throw new Error('JWT_SECRET não configurado');
      }
      
      const token = jwt.sign(payload, secret, { expiresIn });
      
      logInfo('Access token gerado', { userId: payload.id, expiresIn });
      
      return token;
    } catch (error) {
      logError('Erro ao gerar access token', error, { userId: payload.id });
      throw error;
    }
  }

  // gerar refresh token
  static generateRefreshToken(payload) {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
      
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET não configurado');
      }
      
      const token = jwt.sign(payload, secret, { expiresIn });
      
      logInfo('Refresh token gerado', { userId: payload.id, expiresIn });
      
      return token;
    } catch (error) {
      logError('Erro ao gerar refresh token', error, { userId: payload.id });
      throw error;
    }
  }

  // verificar access token
  static verifyAccessToken(token) {
    try {
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        throw new Error('JWT_SECRET não configurado');
      }
      
      const decoded = jwt.verify(token, secret);
      
      logInfo('Access token verificado', { userId: decoded.id });
      
      return {
        valid: true,
        payload: decoded
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logWarn('Access token expirado', { token: token.substring(0, 20) + '...' });
        return {
          valid: false,
          error: 'TOKEN_EXPIRED'
        };
      } else if (error.name === 'JsonWebTokenError') {
        logWarn('Access token inválido', { token: token.substring(0, 20) + '...' });
        return {
          valid: false,
          error: 'INVALID_TOKEN'
        };
      } else {
        logError('Erro ao verificar access token', error);
        return {
          valid: false,
          error: 'VERIFICATION_ERROR'
        };
      }
    }
  }

  // verificar refresh token
  static verifyRefreshToken(token) {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET não configurado');
      }
      
      const decoded = jwt.verify(token, secret);
      
      logInfo('Refresh token verificado', { userId: decoded.id });
      
      return {
        valid: true,
        payload: decoded
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logWarn('Refresh token expirado', { token: token.substring(0, 20) + '...' });
        return {
          valid: false,
          error: 'TOKEN_EXPIRED'
        };
      } else if (error.name === 'JsonWebTokenError') {
        logWarn('Refresh token inválido', { token: token.substring(0, 20) + '...' });
        return {
          valid: false,
          error: 'INVALID_TOKEN'
        };
      } else {
        logError('Erro ao verificar refresh token', error);
        return {
          valid: false,
          error: 'VERIFICATION_ERROR'
        };
      }
    }
  }

  // decodificar token  
  static decodeToken(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded;
    } catch (error) {
      logError('Erro ao decodificar token', error);
      return null;
    }
  }

  // extrair seu payload
  static extractPayload(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && typeof decoded === 'object') {
        return {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          iat: decoded.iat,
          exp: decoded.exp
        };
      }
      return null;
    } catch (error) {
      logError('Erro ao extrair payload do token', error);
      return null;
    }
  }

  // verificar se seu token esta quase expirando
  static isTokenNearExpiry(token, thresholdMinutes = 30) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return false;
      }
      
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      const thresholdSeconds = thresholdMinutes * 60;
      
      return timeUntilExpiry <= thresholdSeconds;
    } catch (error) {
      logError('Erro ao verificar expiração do token', error);
      return false;
    }
  }

  // gerar par de tokens (access + refresh)
  static generateTokenPair(payload) {
    try {
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);
      
      return {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };
    } catch (error) {
      logError('Erro ao gerar par de tokens', error, { userId: payload.id });
      throw error;
    }
  }

  // renovar tokens
  static refreshTokens(refreshToken) {
    try {
      const verification = this.verifyRefreshToken(refreshToken);
      
      if (!verification.valid) {
        throw new Error('Refresh token inválido');
      }
      
      const payload = verification.payload;
      
      // gerar novos tokens
      const newAccessToken = this.generateAccessToken(payload);
      const newRefreshToken = this.generateRefreshToken(payload);
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };
    } catch (error) {
      logError('Erro ao renovar tokens', error);
      throw error;
    }
  }
}

