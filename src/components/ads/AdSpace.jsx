import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContextMods';

const AdSpace = ({ 
  page, 
  position = 'top-banner', 
  className = '',
  fallbackText = 'Nenhum anúncio configurado',
  showAdminFallback = true
}) => {
  const { currentUser } = useAuth();
  const [adConfig, setAdConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAdConfig();
  }, [page, position]);

  const loadAdConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ads/page/${page}`);
      
      if (response.ok) {
        const data = await response.json();
        setAdConfig(data.data);
      } else {
        setError('Erro ao carregar configurações de anúncio');
      }
    } catch (err) {
      console.error('Erro ao carregar anúncio:', err);
      setError('Erro ao carregar anúncio');
    } finally {
      setLoading(false);
    }
  };

  // Se não estiver carregado ou houver erro, mostrar fallback
  if (loading) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Se não estiver habilitado ou não tiver código
  if (!adConfig?.enabled || !adConfig?.topBanner?.enabled || !adConfig?.topBanner?.code?.trim()) {
    // Ocultar completamente em páginas públicas, mesmo para super admins,
    // a menos que showAdminFallback esteja explicitamente ativado
    if (!showAdminFallback) {
      return null;
    }
    if (currentUser?.role === 'super_admin') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center ${className}`}
        >
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            {fallbackText}
          </div>
          <button
            onClick={() => window.open('/admin/ads', '_blank')}
            className="mt-2 text-xs text-primary hover:underline"
          >
            + Adicionar Anúncio
          </button>
        </motion.div>
      );
    }
    return null;
  }

  // Renderizar anúncio
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`ad-space ${className}`}
    >
      <div 
        dangerouslySetInnerHTML={{ 
          __html: adConfig.topBanner.code 
        }}
        className="ad-content"
      />
    </motion.div>
  );
};

export default AdSpace;
