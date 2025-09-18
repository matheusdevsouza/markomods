import { useEffect } from 'react';

const GoogleAdsenseMeta = () => {
  useEffect(() => {
    // Carregar configurações do Google AdSense
    const loadGoogleAdsense = async () => {
      try {
        const response = await fetch('/api/ads/google-adsense-status');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.data.enabled) {
            // Adicionar meta tag do Google AdSense
            const metaTag = document.createElement('meta');
            metaTag.name = 'google-adsense-account';
            metaTag.content = data.data.account;
            
            // Verificar se já existe
            const existingMeta = document.querySelector('meta[name="google-adsense-account"]');
            if (existingMeta) {
              existingMeta.remove();
            }
            
            document.head.appendChild(metaTag);
            
            // Carregar script do Google AdSense
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${data.data.account}`;
            script.crossOrigin = 'anonymous';
            
            // Verificar se já existe
            const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`);
            if (existingScript) {
              existingScript.remove();
            }
            
            document.head.appendChild(script);
            
          }
        }
      } catch (error) {
        console.error('Erro ao carregar Google AdSense:', error);
      }
    };

    loadGoogleAdsense();
  }, []);

  return null; // Este componente não renderiza nada
};

export default GoogleAdsenseMeta;
