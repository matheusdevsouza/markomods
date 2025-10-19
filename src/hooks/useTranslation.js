import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * hook personalizado para traduções com funcionalidades adicionais
 * @returns {Object} 
 */

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  /**
   * função para traduzir com parâmetros
   * @param {string} key 
   * @param {Object} params 
   * @returns {string} 
   */
  
  const translate = (key, params = {}) => {
    return t(key, params);
  };

  /**
   * função para traduzir com pluralização
   * @param {string} key 
   * @param {number} count 
   * @param {Object} params 
   * @returns {string} 
   */

  const translatePlural = (key, count, params = {}) => {
    return t(key, { count, ...params });
  };

  /**
   * função para traduzir com contexto
   * @param {string} key 
   * @param {string} context 
   * @param {Object} params 
   * @returns {string} 
   */

  const translateWithContext = (key, context, params = {}) => {
    return t(key, { context, ...params });
  };

  /**
   * função para verificar se uma chave de tradução existe
   * @param {string} key 
   * @returns {boolean} 
   */

  const hasTranslation = (key) => {
    return i18n.exists(key);
  };

  /**
   * função para obter o idioma atual
   * @returns {string} 
   */
  
  const getCurrentLanguage = () => {
    return i18n.language;
  };

  /**
   * função para obter o nome nativo do idioma atual
   * @returns {string} 
   */
  const getCurrentLanguageName = () => {
    const language = i18n.language;
    const languageNames = {
      'pt-BR': 'Português (Brasil)',
      'pt-PT': 'Português (Portugal)',
      'en-US': 'English',
      'es-ES': 'Español',
      'fr-FR': 'Français',
      'zh-CN': '中文 (简体)'
    };
    return languageNames[language] || language;
  };

  /**
   * função para obter a direção do texto (LTR/RTL)
   * @returns {string} 
   */
  const getTextDirection = () => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr';
  };

  /**
   * função para formatar números de acordo com o idioma
   * @param {number} number 
   * @param {Object} options 
   * @returns {string} 
   */
  const formatNumber = (number, options = {}) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  /**
  * função para formatar datas de acordo com o idioma
   * @param {Date|string|number} date 
   * @param {Object} options 
   * @returns {string} 
   */
  const formatDate = (date, options = {}) => {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
  };

  /**
   * função para formatar moeda de acordo com o idioma
   * @param {number} amount 
   * @param {string} currency 
   * @param {Object} options 
   * @returns {string} 
   */
  const formatCurrency = (amount, currency = 'BRL', options = {}) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      ...options
    }).format(amount);
  };

  return {
    // funções de tradução
    t: translate,
    translate,
    translatePlural,
    translateWithContext,
    
    // funções de verificação
    hasTranslation,
    
    // funções de idioma
    getCurrentLanguage,
    getCurrentLanguageName,
    getTextDirection,
    
    // funções de formatação
    formatNumber,
    formatDate,
    formatCurrency,
    
    // objeto i18n original
    i18n,
    
    // idioma atual
    language: i18n.language,
    
    // função para mudar idioma
    changeLanguage: i18n.changeLanguage.bind(i18n),
    
    // função para detectar se está carregando
    isInitialized: i18n.isInitialized
  };
};

export default useTranslation;


