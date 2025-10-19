import crypto from 'crypto';
import { logError, logInfo } from '../config/logger.js';

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    
    this.key = this.deriveKey(process.env.JWT_SECRET || 'fallback-key');
  }

  // derivar chave de criptografia segura
  deriveKey(secret) {
    return crypto.scryptSync(secret, 'eu-marko-mods-salt', this.keyLength);
  }

  // criptografar dados sensíveis
  encrypt(plaintext) {
    try {
      if (!plaintext) return null;
      
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipherGCM(this.algorithm, this.key, iv);
      cipher.setAAD(Buffer.from('eu-marko-mods-aad'));
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      const result = {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: this.algorithm
      };
      
      logInfo('Dados criptografados com sucesso', { 
        dataType: typeof plaintext,
        dataLength: plaintext.length 
      });
      
      return result;
    } catch (error) {
      logError('Erro ao criptografar dados', error);
      throw new Error('Falha na criptografia');
    }
  }

  // descriptografar dados sensíveis
  decrypt(encryptedData) {
    try {
      if (!encryptedData || !encryptedData.encrypted) return null;
      
      const { encrypted, iv, authTag, algorithm } = encryptedData;
      
      if (algorithm !== this.algorithm) {
        throw new Error('Algoritmo de criptografia incompatível');
      }
      
      const decipher = crypto.createDecipherGCM(algorithm, this.key, Buffer.from(iv, 'hex'));
      decipher.setAAD(Buffer.from('eu-marko-mods-aad'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      logInfo('Dados descriptografados com sucesso', { 
        dataType: typeof decrypted,
        dataLength: decrypted.length 
      });
      
      return decrypted;
    } catch (error) {
      logError('Erro ao descriptografar dados', error);
      throw new Error('Falha na descriptografia');
    }
  }

  // criptografar dados para armazenamento no banco
  encryptForStorage(plaintext) {
    const encrypted = this.encrypt(plaintext);
    return encrypted ? JSON.stringify(encrypted) : null;
  }

  // descriptografar dados do banco
  decryptFromStorage(encryptedJson) {
    if (!encryptedJson) return null;
    
    try {
      const encryptedData = JSON.parse(encryptedJson);
      return this.decrypt(encryptedData);
    } catch (error) {
      logError('Erro ao parsear dados criptografados do banco', error);
      return null;
    }
  }

  // gerar hash seguro para senhas
  hashPassword(password, salt = null) {
    const actualSalt = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512');
    return {
      hash: hash.toString('hex'),
      salt: actualSalt
    };
  }

  // verificar senha contra hash
  verifyPassword(password, hash, salt) {
    const newHash = this.hashPassword(password, salt);
    return newHash.hash === hash;
  }

  // gerar token seguro para CSRF
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // gerar nonce seguro
  generateNonce() {
    return crypto.randomBytes(16).toString('base64');
  }

  // gerar chave de sessão segura
  generateSessionKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

// instância singleton
const encryptionService = new EncryptionService();

export default encryptionService;

// funções de conveniência
export const encrypt = (data) => encryptionService.encrypt(data);
export const decrypt = (data) => encryptionService.decrypt(data);
export const encryptForStorage = (data) => encryptionService.encryptForStorage(data);
export const decryptFromStorage = (data) => encryptionService.decryptFromStorage(data);
export const hashPassword = (password, salt) => encryptionService.hashPassword(password, salt);
export const verifyPassword = (password, hash, salt) => encryptionService.verifyPassword(password, hash, salt);
export const generateCSRFToken = () => encryptionService.generateCSRFToken();
export const generateNonce = () => encryptionService.generateNonce();
export const generateSessionKey = () => encryptionService.generateSessionKey();
