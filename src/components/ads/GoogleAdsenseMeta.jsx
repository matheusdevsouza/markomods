import { useEffect } from 'react';

const GoogleAdsenseMeta = () => {
  useEffect(() => {
    // Carregar script oficial do Google AdSense
    const loadGoogleAdsense = async () => {
      try {
        // Verificar se o script já foi carregado
        if (document.querySelector('script[src*="adsbygoogle.js"]')) {
          return;
        }

        // Carregar script oficial do Google AdSense
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8224876793145643';
        script.crossOrigin = 'anonymous';
        
        // Adicionar ao head
        document.head.appendChild(script);
        
        // Inicializar o array global se não existir
        window.adsbygoogle = window.adsbygoogle || [];
        
      } catch (error) {
        console.error('Erro ao carregar Google AdSense:', error);
      }
    };

    loadGoogleAdsense();
  }, []);

  return null; // Este componente não renderiza nada
};

export default GoogleAdsenseMeta;
