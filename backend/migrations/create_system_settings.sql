-- Migração para criar tabela de configurações do sistema
-- Esta tabela armazenará configurações globais do sistema

CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type ENUM('boolean', 'string', 'number', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_setting_type (setting_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserir configurações padrão do sistema
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('moderation_enabled', 'true', 'boolean', 'Ativa/desativa moderação de comentários'),
('auto_approve_trusted_users', 'false', 'boolean', 'Aprova automaticamente comentários de usuários confiáveis'),
('max_comment_length', '1000', 'number', 'Tamanho máximo de caracteres em comentários'),
('comment_cooldown_seconds', '30', 'number', 'Tempo de cooldown entre comentários em segundos'),
('max_comments_per_hour', '10', 'number', 'Máximo de comentários por hora por usuário'),
('notification_email', 'contato@eumarko.com', 'string', 'Email para notificações do sistema'),
('site_name', 'Eu, Marko! Mods', 'string', 'Nome do site'),
('site_description', 'Plataforma de mods para Minecraft', 'string', 'Descrição do site')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    updated_at = CURRENT_TIMESTAMP;

