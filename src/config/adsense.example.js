export const ADSENSE_CONFIG = {
  CLIENT_ID: 'ca-pub-xxxxxxxxxxxxxx',
  
  AD_SLOTS: {
    TOP_BANNER: '1234567890', 
    SIDEBAR: '1234567891', 
    IN_CONTENT: '1234567892', 
  },
  
  FORMATS: {
    AUTO: 'auto',
    RECTANGLE: 'rectangle',
    BANNER: 'banner',
    LEADERBOARD: 'leaderboard',
    SKYSCRAPER: 'skyscraper'
  }
};

/**
 * @returns {boolean}
 */
export const isAdSenseEnabled = () => {
  return !!ADSENSE_CONFIG.CLIENT_ID && ADSENSE_CONFIG.CLIENT_ID !== 'ca-pub-xxxxxxxxxxxxxx';
};

/**
 * @param {string} position 
 * @returns {string|null}
 */
export const getAdSlot = (position) => {
  return ADSENSE_CONFIG.AD_SLOTS[position.toUpperCase()] || null;
};
