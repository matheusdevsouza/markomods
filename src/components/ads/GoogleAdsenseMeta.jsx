import { useEffect } from 'react';

const GoogleAdsenseMeta = () => {
  useEffect(() => {
    const loadGoogleAdsense = async () => {
      try {
        if (document.querySelector('script[src*="adsbygoogle.js"]')) {
          return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8224876793145643';
        script.crossOrigin = 'anonymous';
        
        document.head.appendChild(script);
        
        window.adsbygoogle = window.adsbygoogle || [];
        
      } catch (error) {
        console.error('Erro ao carregar Google AdSense:', error);
      }
    };

    loadGoogleAdsense();
  }, []);

  return null; 
};

export default GoogleAdsenseMeta;
