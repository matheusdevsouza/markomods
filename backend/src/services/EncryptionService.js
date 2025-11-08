import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
const configEnvPath = path.resolve(__dirname, '../../config.env');

try {
  dotenv.config({ path: envPath });
} catch (error) {
  try {
    dotenv.config({ path: configEnvPath });
  } catch (err) {
    console.error('Erro ao carregar arquivo .env:', err);
  }
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

class EncryptionService {
  constructor() {
    this.encryptionKey = this.getEncryptionKey();
  }

  getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;
    
    if (!key) {
      throw new Error('ENCRYPTION_KEY não está definida no arquivo .env');
    }

    if (key.length < 64) {
      throw new Error('ENCRYPTION_KEY deve ter pelo menos 64 caracteres (recomendado: 128 caracteres)');
    }

    return crypto.createHash('sha256').update(key).digest();
  }

  encrypt(text) {
    if (!text || text === null || text === undefined) {
      return null;
    }

    try {
      const textString = String(text);
      if (textString.trim() === '') {
        return null;
      }

      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);
      
      let encrypted = cipher.update(textString, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao criptografar dados:', error);
      throw new Error('Falha ao criptografar dados');
    }
  }

  decrypt(encryptedText) {
    if (!encryptedText || encryptedText === null || encryptedText === undefined) {
      return null;
    }

    try {
      const encryptedString = String(encryptedText);
      if (encryptedString.trim() === '') {
        return null;
      }

      if (!encryptedString.includes(':')) {
        return encryptedString;
      }

      const parts = encryptedString.split(':');
      if (parts.length !== 3) {
        console.warn('⚠️ Formato de texto criptografado inválido, retornando como texto normal');
        return encryptedString;
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('❌ Erro ao descriptografar dados:', error);
      console.error('❌ Texto criptografado (primeiros 50 chars):', encryptedText?.substring(0, 50));
      throw new Error('Falha ao descriptografar dados');
    }
  }

  encryptUserData(userData) {
    if (!userData) {
      return userData;
    }

    const encrypted = { ...userData };

    if (userData.username) {
      encrypted.username = this.encrypt(userData.username);
      encrypted.username_hash = this.hashForSearch(userData.username);
    }

    if (userData.email) {
      encrypted.email = this.encrypt(userData.email);
      encrypted.email_hash = this.hashForSearch(userData.email);
    }

    if (userData.display_name) {
      encrypted.display_name = this.encrypt(userData.display_name);
    }

    return encrypted;
  }

  decryptUserData(userData, isAdmin = false) {
    if (!userData) {
      return userData;
    }

    if (!isAdmin) {
      return userData;
    }

    const decrypted = { ...userData };

    if (userData.username) {
      try {
        decrypted.username = this.decrypt(userData.username);
      } catch (error) {
        console.error('❌ Erro ao descriptografar username:', error);
        decrypted.username = userData.username;
      }
    }

    if (userData.email) {
      try {
        decrypted.email = this.decrypt(userData.email);
      } catch (error) {
        console.error('❌ Erro ao descriptografar email:', error);
        decrypted.email = userData.email;
      }
    }

    if (userData.display_name) {
      try {
        decrypted.display_name = this.decrypt(userData.display_name);
      } catch (error) {
        console.error('❌ Erro ao descriptografar display_name:', error);
        decrypted.display_name = userData.display_name;
      }
    }

    return decrypted;
  }

  decryptUserArray(users, isAdmin = false) {
    if (!Array.isArray(users)) {
      return users;
    }

    if (!isAdmin) {
      return users;
    }

    return users.map(user => this.decryptUserData(user, true));
  }

  isEncrypted(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }

    const parts = text.split(':');
    if (parts.length !== 3) {
      return false;
    }

    try {
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      return iv.length === IV_LENGTH && authTag.length === AUTH_TAG_LENGTH;
    } catch (error) {
      return false;
    }
  }

  hashForSearch(text) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    const normalizedText = text.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalizedText).digest('hex');
  }

  encryptSearchQuery(query) {
    if (!query || typeof query !== 'string') {
      return query;
    }

    const encrypted = this.encrypt(query);
    if (encrypted && encrypted.includes(':')) {
      const parts = encrypted.split(':');
      return parts[2];
    }
    return query;
  }

  generateSecureKey() {
    return crypto.randomBytes(128).toString('hex');
  }
}

const encryptionService = new EncryptionService();

export default encryptionService;

