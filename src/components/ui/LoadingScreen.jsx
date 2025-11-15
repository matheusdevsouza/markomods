import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  useEffect(() => {
    document.body.classList.add('loading-screen-active');
    
    return () => {
      document.body.classList.remove('loading-screen-active');
    };
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .loading-screen-active header,
      .loading-screen-active footer,
      .loading-screen-active nav {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.25, 0.1, 0.25, 1],
          opacity: { duration: 0.5 },
          scale: { duration: 0.6 },
          y: { duration: 0.6 }
        }}
        className="text-center"
      >
        <motion.img 
          src="/eu_girando.gif" 
          alt="Carregando..." 
          className="w-56 h-32 mx-auto object-contain"
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
};

export default LoadingScreen;

