import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import frFR from './locales/fr-FR.json';
import zhCN from './locales/zh-CN.json';
import ptPT from './locales/pt-PT.json';

const resources = {
  'pt-BR': {
    translation: ptBR
  },
  'en-US': {
    translation: enUS
  },
  'es-ES': {
    translation: esES
  },
  'fr-FR': {
    translation: frFR
  },
  'zh-CN': {
    translation: zhCN
  },
  'pt-PT': {
    translation: ptPT
  }
};


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    debug: true,

    supportedLngs: ['pt-BR', 'pt-PT', 'en-US', 'es-ES', 'fr-FR', 'zh-CN'],
    lowerCaseLng: false,
    nonExplicitSupportedLngs: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    ns: ['translation'],
    defaultNS: 'translation',
    
    fallbackNS: false,
    
    pluralSeparator: '_',
    contextSeparator: '_',
    
    keySeparator: '.',
    
    load: 'currentOnly',
    
    cache: {
      enabled: true,
      expirationTime: 7 * 24 * 60 * 60 * 1000,
    }
  }).then(() => {
  }).catch((error) => {
  });

export default i18n;


