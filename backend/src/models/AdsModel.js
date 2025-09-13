import { executeQuery } from '../config/database.js';

class AdsModel {
  // Buscar configurações de anúncios
  static async getAdsConfig() {
    try {
      const query = 'SELECT * FROM ads_config WHERE id = 1';
      const result = await executeQuery(query);
      
      if (result.length === 0) {
        // Se não existir, criar configuração padrão
        await this.createDefaultConfig();
        return await this.getAdsConfig();
      }
      
      return result[0];
    } catch (error) {
      console.error('Erro ao buscar configurações de anúncios:', error);
      throw error;
    }
  }

  // Criar configuração padrão
  static async createDefaultConfig() {
    try {
      const defaultConfig = {
        google_adsense_enabled: false,
        google_adsense_account: 'ca-pub-8224876793145643',
        custom_ads_enabled: false,
        mod_detail_page: JSON.stringify({
          enabled: false,
          topBanner: {
            enabled: false,
            code: '',
            type: 'google-adsense'
          }
        }),
        mod_download_page: JSON.stringify({
          enabled: false,
          topBanner: {
            enabled: false,
            code: '',
            type: 'google-adsense'
          }
        })
      };

      const query = `
        INSERT INTO ads_config (
          google_adsense_enabled,
          google_adsense_account,
          custom_ads_enabled,
          mod_detail_page,
          mod_download_page,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;

      await executeQuery(query, [
        defaultConfig.google_adsense_enabled,
        defaultConfig.google_adsense_account,
        defaultConfig.custom_ads_enabled,
        defaultConfig.mod_detail_page,
        defaultConfig.mod_download_page
      ]);

      console.log('Configuração padrão de anúncios criada');
    } catch (error) {
      console.error('Erro ao criar configuração padrão de anúncios:', error);
      throw error;
    }
  }

  // Atualizar configurações de anúncios
  static async updateAdsConfig(config) {
    try {
      const query = `
        UPDATE ads_config SET
          google_adsense_enabled = ?,
          google_adsense_account = ?,
          custom_ads_enabled = ?,
          mod_detail_page = ?,
          mod_download_page = ?,
          updated_at = NOW()
        WHERE id = 1
      `;

      await executeQuery(query, [
        config.googleAdsenseEnabled,
        config.googleAdsenseAccount,
        config.customAdsEnabled,
        JSON.stringify(config.modDetailPage),
        JSON.stringify(config.modDownloadPage)
      ]);

      console.log('Configurações de anúncios atualizadas');
    } catch (error) {
      console.error('Erro ao atualizar configurações de anúncios:', error);
      throw error;
    }
  }

  // Verificar se meta tags estão ativas
  static async isGoogleAdsenseEnabled() {
    try {
      const config = await this.getAdsConfig();
      return config.google_adsense_enabled;
    } catch (error) {
      console.error('Erro ao verificar status do Google AdSense:', error);
      return false;
    }
  }

  // Buscar configurações de página específica
  static async getPageAdsConfig(page) {
    try {
      const config = await this.getAdsConfig();
      
      if (page === 'mod-detail') {
        return JSON.parse(config.mod_detail_page);
      } else if (page === 'mod-download') {
        return JSON.parse(config.mod_download_page);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar configurações de página:', error);
      return null;
    }
  }
}

export default AdsModel;