import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContextMods';

const DownloadsContext = createContext();

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (!context) {
    throw new Error('useDownloads deve ser usado dentro de um DownloadsProvider');
  }
  return context;
};

export const DownloadsProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDownloads, setTotalDownloads] = useState(0);

  // Buscar histórico de downloads via API
  const fetchDownloadHistory = useCallback(async (params = {}) => {
    if (!isAuthenticated || !currentUser) {
      setDownloadHistory([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
      }

      // Construir parâmetros da query
      const queryParams = new URLSearchParams({
        limit: params.limit || '20',
        page: params.page || '1',
        search: params.search || '',
        period: params.period || 'all',
        type: params.type || 'all',
        ...params
      });

      const response = await fetch(`/api/mods/user/downloads/history?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const apiHistory = data.data || [];
        
        // Unir com histórico local salvo ao clicar no download, priorizando o mais recente
        try {
          const localRaw = localStorage.getItem('userDownloadHistory');
          const localList = localRaw ? JSON.parse(localRaw) : [];
          const map = new Map();
          
          // Adicionar histórico local primeiro (mais recente)
          localList.forEach(item => {
            const key = item.modId || item.mod_id || item.id;
            if (key) map.set(key, item);
          });
          
          // Adicionar histórico da API
          apiHistory.forEach(item => {
            const key = item.modId || item.mod_id || item.id;
            if (key && !map.has(key)) map.set(key, item);
          });
          
          const combinedHistory = Array.from(map.values())
            .sort((a, b) => {
              const dateA = new Date(a.downloaded_at || a.saved_at || 0);
              const dateB = new Date(b.downloaded_at || b.saved_at || 0);
              return dateB - dateA;
            });
          
          setDownloadHistory(combinedHistory);
        } catch (error) {
          console.error('Erro ao processar histórico local:', error);
          setDownloadHistory(apiHistory);
        }
        
        // Buscar contagem total para paginação
        const countResponse = await fetch('/api/mods/user/downloads/count', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (countResponse.ok) {
          const countData = await countResponse.json();
          setTotalDownloads(countData.data?.total || 0);
        } else {
          console.error('Erro ao buscar contagem de downloads:', countResponse.status);
          // Usar contagem do histórico combinado como fallback
          setTotalDownloads(combinedHistory.length);
        }
      } else {
        console.error('Erro ao buscar downloads:', response.status);
      }
    } catch (error) {
      console.error('Erro ao buscar downloads:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  // Atualizar histórico local quando um download é feito
  const addDownloadToHistory = (modData) => {
    try {
      const historyKey = 'userDownloadHistory';
      const raw = localStorage.getItem(historyKey);
      const list = raw ? JSON.parse(raw) : [];
      
      const entry = {
        modId: modData.id,
        id: modData.id,
        name: modData.title || modData.name,
        title: modData.title || modData.name,
        thumbnail_url: modData.thumbnail_url,
        minecraft_version: modData.minecraft_version,
        short_description: modData.short_description,
        tags: modData.tags || [],
        downloaded_at: new Date().toISOString(),
        saved_at: new Date().toISOString()
      };
      
      // Remover duplicatas e adicionar no início
      const dedup = [entry, ...list.filter(i => (i.modId || i.id) !== modData.id)].slice(0, 20);
      localStorage.setItem(historyKey, JSON.stringify(dedup));
      localStorage.setItem('downloadsUpdated', String(Date.now()));
      
      // Atualizar estado local
      setDownloadHistory(prev => [entry, ...prev.filter(i => (i.modId || i.id) !== modData.id)].slice(0, 20));
      
      // Recarregar dados do servidor para obter contagem atualizada
      if (isAuthenticated && currentUser) {
        fetchDownloadHistory();
      }
    } catch (error) {
      console.error('Erro ao salvar histórico local:', error);
    }
  };

  // Listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'downloadsUpdated') {
        // Recarregar dados do servidor para obter contagem atualizada
        if (isAuthenticated && currentUser) {
          fetchDownloadHistory();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, currentUser, fetchDownloadHistory]);

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchDownloadHistory();
    } else {
      setDownloadHistory([]);
      setTotalDownloads(0);
    }
  }, [isAuthenticated, currentUser]);

  const value = {
    downloadHistory,
    totalDownloads,
    loading,
    fetchDownloadHistory,
    addDownloadToHistory,
    setDownloadHistory,
    setTotalDownloads
  };

  return (
    <DownloadsContext.Provider value={value}>
      {children}
    </DownloadsContext.Provider>
  );
};
