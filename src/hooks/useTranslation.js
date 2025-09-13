import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Hook personalizado para traduções com funcionalidades adicionais
 * @returns {Object} Objeto com funções de tradução e informações do idioma
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  /**
   * Função para traduzir com parâmetros
   * @param {string} key - Chave de tradução
   * @param {Object} params - Parâmetros para interpolação
   * @returns {string} Texto traduzido
   */
  const translate = (key, params = {}) => {
    return t(key, params);
  };

  /**
   * Função para traduzir com pluralização
   * @param {string} key - Chave base de tradução
   * @param {number} count - Contador para pluralização
   * @param {Object} params - Parâmetros adicionais
   * @returns {string} Texto traduzido com pluralização
   */
  const translatePlural = (key, count, params = {}) => {
    return t(key, { count, ...params });
  };

  /**
   * Função para traduzir com contexto
   * @param {string} key - Chave de tradução
   * @param {string} context - Contexto da tradução
   * @param {Object} params - Parâmetros adicionais
   * @returns {string} Texto traduzido com contexto
   */
  const translateWithContext = (key, context, params = {}) => {
    return t(key, { context, ...params });
  };

  /**
   * Função para verificar se uma chave de tradução existe
   * @param {string} key - Chave de tradução
   * @returns {boolean} True se a chave existe
   */
  const hasTranslation = (key) => {
    return i18n.exists(key);
  };

  /**
   * Função para obter o idioma atual
   * @returns {string} Código do idioma atual
   */
  const getCurrentLanguage = () => {
    return i18n.language;
  };

  /**
   * Função para obter o nome nativo do idioma atual
   * @returns {string} Nome nativo do idioma
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
   * Função para obter a direção do texto (LTR/RTL)
   * @returns {string} Direção do texto
   */
  const getTextDirection = () => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr';
  };

  /**
   * Função para formatar números de acordo com o idioma
   * @param {number} number - Número para formatar
   * @param {Object} options - Opções de formatação
   * @returns {string} Número formatado
   */
  const formatNumber = (number, options = {}) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  /**
   * Função para formatar datas de acordo com o idioma
   * @param {Date|string|number} date - Data para formatar
   * @param {Object} options - Opções de formatação
   * @returns {string} Data formatada
   */
  const formatDate = (date, options = {}) => {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
  };

  /**
   * Função para formatar moeda de acordo com o idioma
   * @param {number} amount - Valor monetário
   * @param {string} currency - Código da moeda
   * @param {Object} options - Opções de formatação
   * @returns {string} Valor monetário formatado
   */
  const formatCurrency = (amount, currency = 'BRL', options = {}) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      ...options
    }).format(amount);
  };

  return {
    // Funções de tradução
    t: translate,
    translate,
    translatePlural,
    translateWithContext,
    
    // Funções de verificação
    hasTranslation,
    
    // Funções de idioma
    getCurrentLanguage,
    getCurrentLanguageName,
    getTextDirection,
    
    // Funções de formatação
    formatNumber,
    formatDate,
    formatCurrency,
    
    // Objeto i18n original
    i18n,
    
    // Idioma atual
    language: i18n.language,
    
    // Função para mudar idioma
    changeLanguage: i18n.changeLanguage.bind(i18n),
    
    // Função para detectar se está carregando
    isInitialized: i18n.isInitialized
  };
};

export default useTranslation;


