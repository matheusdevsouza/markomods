import AdsModel from '../models/AdsModel.js';

// Buscar configurações de anúncios
export const getAdsConfig = async (req, res) => {
  try {
    const config = await AdsModel.getAdsConfig();
    
    // Converter para formato esperado pelo frontend
    const formattedConfig = {
      googleAdsenseEnabled: config.google_adsense_enabled,
      googleAdsenseAccount: config.google_adsense_account,
      customAdsEnabled: config.custom_ads_enabled,
      modDetailPage: JSON.parse(config.mod_detail_page),
      modDownloadPage: JSON.parse(config.mod_download_page)
    };

    res.json({
      success: true,
      data: formattedConfig
    });
  } catch (error) {
    console.error('Erro ao buscar configurações de anúncios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar configurações de anúncios
export const updateAdsConfig = async (req, res) => {
  try {
    const config = req.body;
    
    // Validar dados obrigatórios
    if (!config.googleAdsenseAccount) {
      return res.status(400).json({
        success: false,
        message: 'ID da conta Google AdSense é obrigatório'
      });
    }

    await AdsModel.updateAdsConfig(config);

    res.json({
      success: true,
      message: 'Configurações de anúncios atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações de anúncios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar configurações de anúncios para página específica (público)
export const getPageAdsConfig = async (req, res) => {
  try {
    const { page } = req.params;
    
    if (!['mod-detail', 'mod-download'].includes(page)) {
      return res.status(400).json({
        success: false,
        message: 'Página inválida'
      });
    }

    const config = await AdsModel.getPageAdsConfig(page);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configurações não encontradas'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Erro ao buscar configurações de página:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Verificar se Google AdSense está ativo (para meta tags)
export const isGoogleAdsenseActive = async (req, res) => {
  try {
    const isActive = await AdsModel.isGoogleAdsenseEnabled();
    const config = await AdsModel.getAdsConfig();
    
    res.json({
      success: true,
      data: {
        enabled: isActive,
        account: config.google_adsense_account
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status do Google AdSense:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};