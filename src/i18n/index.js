import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar arquivos de tradução
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

// Debug: verificar se os recursos estão sendo carregados
console.log('🔍 i18n Resources:', resources);
console.log('🔍 i18n Resources pt-BR:', resources['pt-BR']);
console.log('🔍 i18n Resources en-US:', resources['en-US']);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    debug: true, // Ativar debug para ver o que está acontecendo

    // Idiomas suportados explicitamente (mantém os códigos regionais)
    supportedLngs: ['pt-BR', 'pt-PT', 'en-US', 'es-ES', 'fr-FR', 'zh-CN'],
    lowerCaseLng: false,
    nonExplicitSupportedLngs: false,
    
    // Configurações de detecção de idioma
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },
    
    // Configurações de interpolação
    interpolation: {
      escapeValue: false, // React já escapa valores por padrão
    },
    
    // Configurações de namespace
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Configurações de fallback
    fallbackNS: false,
    
    // Configurações de pluralização
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Configurações de formatação
    keySeparator: '.',
    
    // Configurações de carregamento (usar somente o idioma atual com região)
    load: 'currentOnly',
    
    // Configurações de cache
    cache: {
      enabled: true,
      expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 dias
    }
  }).then(() => {
    console.log('✅ i18n inicializado com sucesso!');
    console.log('🌍 Idioma atual:', i18n.language);
    console.log('🔑 Teste de tradução pt-BR:', i18n.t('language.title', { lng: 'pt-BR' }));
    console.log('🔑 Teste de tradução en-US:', i18n.t('language.title', { lng: 'en-US' }));
    console.log('🔑 Teste de tradução home.hero.title pt-BR:', i18n.t('home.hero.title', { lng: 'pt-BR' }));
    console.log('🔑 Teste de tradução home.hero.title en-US:', i18n.t('home.hero.title', { lng: 'en-US' }));
  }).catch((error) => {
    console.error('❌ Erro ao inicializar i18n:', error);
  });

export default i18n;


