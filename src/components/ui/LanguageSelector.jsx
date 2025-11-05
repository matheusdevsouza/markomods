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
  const [dropdownPosition, setDropdownPosition] = useState('right-0');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const dropdownWidth = viewportWidth < 640 ? 280 : 320;
        
        setDropdownPosition('center');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    if (isOpen) {
      handleResize();
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

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

  const LANGUAGES = {
    'pt-BR': { name: 'Português (Brasil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
    'pt-PT': { name: 'Português (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹' },
    'en-US': { name: 'English', nativeName: 'English', flag: '🇺🇸' },
    'es-ES': { name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
    'fr-FR': { name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
    'zh-CN': { name: '中文 (简体)', nativeName: '中文 (简体)', flag: '🇨🇳' }
  };

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
        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300"
        title={t('language.title')}
      >
        <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute top-full mt-2 w-64 sm:w-80 max-w-[calc(100vw-1rem)] rounded-lg border bg-background shadow-lg z-50",
          dropdownPosition === 'center' 
            ? "right-0" 
            : dropdownPosition
        )}>

          {/* header */}
          <div className="p-2 sm:p-4 border-b">
            <h3 className="text-xs sm:text-sm font-medium text-foreground">
              {t('language.title')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isAutoLanguage ? t('language.auto') : currentLangInfo?.nativeName}
            </p>
          </div>

          {/* idioma automático */}
          <div className="p-1 sm:p-2">
            <button
              onClick={handleAutoLanguage}
              className={cn(
                "w-full flex items-center justify-between p-2 sm:p-3 rounded-md text-xs sm:text-sm transition-colors touch-manipulation",
                isAutoLanguage
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-accent text-foreground active:bg-accent/80"
              )}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs text-white">A</span>
                </div>
                <span className="font-medium">{t('language.auto')}</span>
              </div>
              {isAutoLanguage && <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />}
            </button>
          </div>

          {/* grupos de idiomas */}
          <div className="max-h-48 sm:max-h-96 overflow-y-auto overscroll-contain">
            {Object.entries(LANGUAGE_GROUPS).map(([regionKey, group]) => (
              <div key={regionKey} className="border-t">
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-muted/30">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t(`language.${regionKey}`)}
                  </h4>
                </div>
                
                <div className="p-1 sm:p-2 space-y-1">
                  {group.languages.map((langCode) => {
                    const langInfo = LANGUAGES[langCode];
                    const isSelected = language === langCode && !isAutoLanguage;
                    
                    return (
                      <button
                        key={langCode}
                        onClick={() => handleLanguageChange(langCode)}
                        className={cn(
                          "w-full flex items-center justify-between p-2 sm:p-3 rounded-md text-xs sm:text-sm transition-colors touch-manipulation",
                          isSelected
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-accent text-foreground active:bg-accent/80"
                        )}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <span className="text-sm sm:text-lg flex-shrink-0">{langInfo.flag}</span>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium truncate">{langInfo.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {langInfo.nativeName}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div className="p-2 sm:p-3 border-t bg-muted/20">
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
