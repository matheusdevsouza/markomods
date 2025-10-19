import { useState, useEffect } from 'react';

export const usePlatform = () => {
  const [platform, setPlatform] = useState('unknown');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.innerWidth;
      
      // detectar dispositivo móvel
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      
      // detectar tablet baseado no tamanho da tela
      const isTabletDevice = screenWidth >= 768 && screenWidth <= 1024 && isMobileDevice;
      
      // detectar mobile baseado no tamanho da tela
      const isMobileScreen = screenWidth < 768 && isMobileDevice;
      
      // detectar desktop
      const isDesktopDevice = !isMobileDevice || (screenWidth > 1024);
      
      if (isMobileScreen) {
        setPlatform('mobile');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (isTabletDevice) {
        setPlatform('tablet');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (isDesktopDevice) {
        setPlatform('desktop');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else {
        setPlatform('unknown');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(false);
      }
    };

    // detectar na montagem
    detectPlatform();
    
    // detectar em mudanças de tamanho de tela
    const handleResize = () => {
      detectPlatform();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    platform,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet
  };
};
