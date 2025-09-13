-- Corrigir estrutura da tabela password_reset_tokens
-- Adicionar campos de segurança e corrigir problemas

-- Primeiro, vamos limpar a tabela existente
DELETE FROM password_reset_tokens;

-- Corrigir a estrutura da tabela
ALTER TABLE password_reset_tokens 
MODIFY COLUMN expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 24 HOUR);

-- Adicionar campos de segurança
ALTER TABLE password_reset_tokens 
ADD COLUMN ip_address VARCHAR(45) DEFAULT NULL,
ADD COLUMN user_agent TEXT DEFAULT NULL,
ADD COLUMN attempts INT DEFAULT 0,
ADD COLUMN last_attempt TIMESTAMP NULL DEFAULT NULL;

-- Adicionar índices para performance e segurança
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_ip_address ON password_reset_tokens(ip_address);

-- Adicionar constraint para garantir que expires_at seja sempre no futuro
ALTER TABLE password_reset_tokens 
ADD CONSTRAINT chk_expires_at_future 
CHECK (expires_at > created_at);
