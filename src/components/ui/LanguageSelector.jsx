import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './button';
import { cn } from '../../lib/utils';

const LanguageSelector = () => {
  const { t, language, changeLanguage, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isAutoLanguage, setIsAutoLanguage] = useState(false);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsAutoLanguage(false);
    setIsOpen(false);
  };

  const handleAutoLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    const detectedLang = browserLang.startsWith('pt') ? 'pt-BR' : 
                        browserLang.startsWith('en') ? 'en-US' : 
                        browserLang.startsWith('es') ? 'es-ES' : 
                        browserLang.startsWith('fr') ? 'fr-FR' : 
                        browserLang.startsWith('zh') ? 'zh-CN' : 'pt-BR';
    
    changeLanguage(detectedLang);
    setIsAutoLanguage(true);
    setIsOpen(false);
  };

  // Definir idiomas disponíveis
  const LANGUAGES = {
    'pt-BR': { name: 'Português (Brasil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
    'pt-PT': { name: 'Português (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹' },
    'en-US': { name: 'English', nativeName: 'English', flag: '🇺🇸' },
    'es-ES': { name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
    'fr-FR': { name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
    'zh-CN': { name: '中文 (简体)', nativeName: '中文 (简体)', flag: '🇨🇳' }
  };

  // Agrupamento por região
  const LANGUAGE_GROUPS = {
    americas: { name: 'Américas', languages: ['pt-BR', 'en-US'] },
    europe: { name: 'Europa', languages: ['pt-PT', 'es-ES', 'fr-FR'] },
    asia: { name: 'Ásia', languages: ['zh-CN'] }
  };

  const currentLangInfo = LANGUAGES[language];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300"
        title={t('language.title')}
      >
        <Globe className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-background shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-foreground">
              {t('language.title')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isAutoLanguage ? t('language.auto') : currentLangInfo?.nativeName}
            </p>
          </div>

          {/* Auto Language Option */}
          <div className="p-2">
            <button
              onClick={handleAutoLanguage}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-md text-sm transition-colors",
                isAutoLanguage
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs text-white">A</span>
                </div>
                <span className="font-medium">{t('language.auto')}</span>
              </div>
              {isAutoLanguage && <Check className="h-4 w-4 text-primary" />}
            </button>
          </div>

          {/* Language Groups */}
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(LANGUAGE_GROUPS).map(([regionKey, group]) => (
              <div key={regionKey} className="border-t">
                <div className="px-4 py-2 bg-muted/30">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t(`language.${regionKey}`)}
                  </h4>
                </div>
                
                <div className="p-2 space-y-1">
                  {group.languages.map((langCode) => {
                    const langInfo = LANGUAGES[langCode];
                    const isSelected = language === langCode && !isAutoLanguage;
                    
                    return (
                      <button
                        key={langCode}
                        onClick={() => handleLanguageChange(langCode)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-md text-sm transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-accent text-foreground"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{langInfo.flag}</span>
                          <div className="text-left">
                            <div className="font-medium">{langInfo.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {langInfo.nativeName}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/20">
            <div className="text-xs text-muted-foreground text-center">
              {isAutoLanguage 
                ? `${t('language.detected')}: ${currentLangInfo?.nativeName}`
                : `${t('language.selected')}: ${currentLangInfo?.nativeName}`
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
