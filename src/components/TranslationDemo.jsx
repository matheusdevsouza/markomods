import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';

const TranslationDemo = () => {
  const { t, changeLanguage, language } = useTranslation();

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Demonstração do Sistema de Tradução</h1>
      
      {/* Seletor de Idioma */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">🌍 Mudar Idioma</h2>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            onClick={() => handleLanguageChange('pt-BR')}
            variant={language === 'pt-BR' ? 'default' : 'outline'}
          >
            🇧🇷 Português
          </Button>
          <Button 
            onClick={() => handleLanguageChange('en-US')}
            variant={language === 'en-US' ? 'default' : 'outline'}
          >
            🇺🇸 English
          </Button>
          <Button 
            onClick={() => handleLanguageChange('es-ES')}
            variant={language === 'es-ES' ? 'default' : 'outline'}
          >
            🇪🇸 Español
          </Button>
          <Button 
            onClick={() => handleLanguageChange('fr-FR')}
            variant={language === 'fr-FR' ? 'default' : 'outline'}
          >
            🇫🇷 Français
          </Button>
          <Button 
            onClick={() => handleLanguageChange('pt-PT')}
            variant={language === 'pt-PT' ? 'default' : 'outline'}
          >
            🇵🇹 Português PT
          </Button>
          <Button 
            onClick={() => handleLanguageChange('zh-CN')}
            variant={language === 'zh-CN' ? 'default' : 'outline'}
          >
            🇨🇳 中文
          </Button>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Idioma atual:</strong> {language}
          </p>
        </div>
      </section>
      
      {/* Seção Homepage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">🏠 Homepage</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Título Principal:</h3>
            <p className="text-lg">{t('home.hero.title')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Subtítulo:</h3>
            <p className="text-sm">{t('home.hero.subtitle')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Botão CTA:</h3>
            <p className="text-lg">{t('home.hero.cta')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Sem Mods:</h3>
            <p className="text-lg">{t('home.noModsFound')}</p>
            <p className="text-sm text-gray-600">{t('home.noModsMessage')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Ações:</h3>
            <p className="text-lg">{t('home.viewDetails')}</p>
            <p className="text-lg">{t('home.download')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Informações:</h3>
            <p className="text-lg">{t('home.author')}</p>
            <p className="text-lg">{t('home.published')}</p>
          </div>
        </div>
      </section>

      {/* Seção Header */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">👤 Header</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Nome do Criador:</h3>
            <p className="text-lg">{t('header.creatorName')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Bio:</h3>
            <p className="text-lg">{t('header.creatorBio')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Botões:</h3>
            <p className="text-lg">{t('header.contactMe')}</p>
            <p className="text-lg">{t('header.viewAllContacts')}</p>
          </div>
        </div>
      </section>

      {/* Seção Footer */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">🦶 Footer</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Marca:</h3>
            <p className="text-lg">{t('footer.brandName')}</p>
            <p className="text-sm text-gray-600">{t('footer.brandDescription')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Links Rápidos:</h3>
            <p className="text-lg">{t('footer.quickLinks')}</p>
            <p className="text-lg">{t('footer.home')}</p>
            <p className="text-lg">{t('footer.exploreMods')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Comunidade:</h3>
            <p className="text-lg">{t('footer.community')}</p>
            <p className="text-lg">{t('footer.guidelines')}</p>
            <p className="text-lg">{t('footer.partners')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Suporte:</h3>
            <p className="text-lg">{t('footer.support')}</p>
            <p className="text-lg">{t('footer.helpCenter')}</p>
            <p className="text-lg">{t('footer.contact')}</p>
            <p className="text-lg">{t('footer.faq')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Outros:</h3>
            <p className="text-lg">{t('footer.backToTop')}</p>
            <p className="text-lg">{t('footer.allRightsReserved')}</p>
          </div>
        </div>
      </section>

      {/* Seção de Navegação */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">🧭 Navegação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Menu Principal:</h3>
            <p className="text-lg">{t('nav.home')}</p>
            <p className="text-lg">{t('nav.mods')}</p>
            <p className="text-lg">{t('nav.about')}</p>
            <p className="text-lg">{t('nav.contact')}</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Usuário:</h3>
            <p className="text-lg">{t('nav.login')}</p>
            <p className="text-lg">{t('nav.register')}</p>
            <p className="text-lg">{t('nav.profile')}</p>
            <p className="text-lg">{t('nav.logout')}</p>
          </div>
        </div>
      </section>

      {/* Instruções de Uso */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">📚 Como Usar</h2>
        
        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="font-semibold mb-2">Exemplo de uso nos componentes:</h3>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
{`// No seu componente React
import { useTranslation } from '@/hooks/useTranslation';

const MeuComponente = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.hero.title')}</h1>
      <p>{t('home.hero.subtitle')}</p>
      <button>{t('home.hero.cta')}</button>
    </div>
  );
};`}
          </pre>
        </div>
        
        <div className="p-4 border rounded-lg bg-green-50">
          <h3 className="font-semibold mb-2">Chaves disponíveis:</h3>
          <ul className="text-sm space-y-1">
            <li><strong>home.hero.title</strong> - Título principal da homepage</li>
            <li><strong>home.hero.subtitle</strong> - Subtítulo da homepage</li>
            <li><strong>home.hero.cta</strong> - Botão de chamada para ação</li>
            <li><strong>header.creatorName</strong> - Nome do criador</li>
            <li><strong>footer.quickLinks</strong> - Seção de links rápidos</li>
            <li><strong>nav.home</strong> - Link para página inicial</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default TranslationDemo;


