-- Migração para criar tabela de atividades
-- Esta tabela registrará todas as atividades dos usuários no sistema

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mod_id VARCHAR(36) NULL,
    activity_type ENUM('favorite', 'download', 'view', 'comment', 'rating', 'upload', 'edit', 'delete') NOT NULL,
    activity_data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mod_id) REFERENCES mods(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_mod_id (mod_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;