-- Adicionar campos de segurança à tabela password_reset_tokens
ALTER TABLE password_reset_tokens 
ADD COLUMN ip_address VARCHAR(45) DEFAULT NULL;

ALTER TABLE password_reset_tokens 
ADD COLUMN user_agent TEXT DEFAULT NULL;

ALTER TABLE password_reset_tokens 
ADD COLUMN attempts INT DEFAULT 0;

ALTER TABLE password_reset_tokens 
ADD COLUMN last_attempt TIMESTAMP NULL DEFAULT NULL;
