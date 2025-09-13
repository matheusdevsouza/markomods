-- Criar tabela de configurações de anúncios
CREATE TABLE IF NOT EXISTS ads_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  google_adsense_enabled BOOLEAN DEFAULT FALSE,
  google_adsense_account VARCHAR(255) DEFAULT 'ca-pub-8224876793145643',
  custom_ads_enabled BOOLEAN DEFAULT FALSE,
  mod_detail_page JSON,
  mod_download_page JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configuração padrão
INSERT INTO ads_config (
  google_adsense_enabled,
  google_adsense_account,
  custom_ads_enabled,
  mod_detail_page,
  mod_download_page
) VALUES (
  FALSE,
  'ca-pub-8224876793145643',
  FALSE,
  JSON_OBJECT(
    'enabled', FALSE,
    'topBanner', JSON_OBJECT(
      'enabled', FALSE,
      'code', '',
      'type', 'google-adsense'
    )
  ),
  JSON_OBJECT(
    'enabled', FALSE,
    'topBanner', JSON_OBJECT(
      'enabled', FALSE,
      'code', '',
      'type', 'google-adsense'
    )
  )
);
