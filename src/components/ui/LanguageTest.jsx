import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const LanguageTest = () => {
  const { language, t } = useTranslation();

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">Teste de Tradução</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Idioma Atual:</span>
          <span className="text-white font-medium">{currentLanguage}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Modo Automático:</span>
          <span className="text-white font-medium">{isAutoLanguage ? 'Sim' : 'Não'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Nome do Idioma:</span>
          <span className="text-white font-medium">{LANGUAGES[currentLanguage]?.nativeName}</span>
        </div>
        
        <div className="border-t border-gray-600 pt-3">
          <h4 className="text-md font-medium text-white mb-2">Exemplos de Tradução:</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Navegação:</span>
              <span className="text-white">{t('nav.home')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Busca:</span>
              <span className="text-white">{t('mods.search.placeholder')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Detalhes:</span>
              <span className="text-white">{t('modDetail.description')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Idioma:</span>
              <span className="text-white">{t('language.title')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest;
