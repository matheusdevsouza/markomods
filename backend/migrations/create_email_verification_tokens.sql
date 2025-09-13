-- Tabela para tokens de verificação de email
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME NULL,
  INDEX idx_evt_user (user_id),
  INDEX idx_evt_token (token),
  INDEX idx_evt_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


