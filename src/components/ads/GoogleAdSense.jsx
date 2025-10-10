import React, { useEffect, useRef } from 'react';
import { ADSENSE_CONFIG, isAdSenseEnabled, getAdSlot } from '../../config/adsense';


const GoogleAdSense = ({ 
  position = 'TOP_BANNER',
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = {},
  className = ''
}) => {
  const adRef = useRef(null);
  const isLoaded = useRef(false);

  useEffect(() => {

    if (!isAdSenseEnabled()) {
      return;
    }


    if (window.adsbygoogle && !isLoaded.current) {
      try {

        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      } catch (error) {
        console.error('Erro ao carregar anúncio AdSense:', error);
      }
    }
  }, []);


  const adSlot = getAdSlot(position);

  if (!adSlot || !isAdSenseEnabled()) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default GoogleAdSense;
