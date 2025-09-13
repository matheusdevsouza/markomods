
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContextMods';

const ModsContext = createContext();

export const useMods = () => {
  const context = useContext(ModsContext);
  if (!context) {
    throw new Error('useMods deve ser usado dentro de um ModsProvider');
  }
  return context;
};

export const ModsProvider = ({ children }) => {
  const [mods, setMods] = useState([]);
  const [loadingMods, setLoadingMods] = useState(true);
  const { currentUser } = useAuth();

  // Buscar mods quando o componente montar
  useEffect(() => {
    // Detectar se o usuário é admin e buscar mods apropriados
    const isAdmin = currentUser?.role === 'super_admin';
    console.log('🔍 ModsContext: currentUser:', currentUser);
    console.log('🔍 ModsContext: isAdmin:', isAdmin);
    console.log('🔍 ModsContext: role:', currentUser?.role);
    fetchMods(isAdmin);
  }, [currentUser]);

  // Buscar mods do banco de dados
  const fetchMods = useCallback(async (isAdmin = false) => {
    try {
      setLoadingMods(true);
      const token = localStorage.getItem('authToken');
      
      let url = '/api/mods/public';
      if (isAdmin && token) {
        url = '/api/mods/admin';
      }

      console.log('🔍 ModsContext: fetchMods - isAdmin:', isAdmin);
      console.log('🔍 ModsContext: fetchMods - url:', url);
      console.log('🔍 ModsContext: fetchMods - token:', token ? 'presente' : 'ausente');

      const headers = {
        'Content-Type': 'application/json'
      };

      // Adicionar token apenas se existir
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        headers
      });

      console.log('🔍 ModsContext: fetchMods - response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 ModsContext: fetchMods - data:', data);
        setMods(data.data || []);
      } else {
        console.error('Erro ao buscar mods:', response.statusText);
        setMods([]);
      }
    } catch (error) {
      console.error('Erro ao buscar mods:', error);
      setMods([]);
    } finally {
      setLoadingMods(false);
    }
  }, []);

  // Buscar mods por tipo de conteúdo
  const fetchModsByType = useCallback(async (contentType, isAdmin = false) => {
    console.log('🚀 ModsContext: fetchModsByType chamada com:', { contentType, isAdmin });
    
    try {
      setLoadingMods(true);
      const token = localStorage.getItem('authToken');
      
      let url = `/api/mods/public?content_type=${contentType}`;
      if (isAdmin && token) {
        url = `/api/mods/admin?content_type=${contentType}`;
      }

      console.log('🔍 ModsContext: fetchModsByType - contentType:', contentType);
      console.log('🔍 ModsContext: fetchModsByType - isAdmin:', isAdmin);
      console.log('🔍 ModsContext: fetchModsByType - url:', url);

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 ModsContext: fetchModsByType - data:', data);
        setMods(data.data || []);
      } else {
        console.error('Erro ao buscar mods por tipo:', response.statusText);
        setMods([]);
      }
    } catch (error) {
      console.error('Erro ao buscar mods por tipo:', error);
      setMods([]);
    } finally {
      setLoadingMods(false);
    }
  }, []);

  // Criar novo mod
  const addMod = async (modData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/mods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modData)
      });

      if (response.ok) {
        const data = await response.json();
        setMods(prev => [data.data, ...prev]);
        return data;
      } else {
        throw new Error('Erro ao criar mod');
      }
    } catch (error) {
      console.error('Erro ao criar mod:', error);
      throw error;
    }
  };

  // Atualizar mod
  const updateMod = async (modId, updateData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/mods/${modId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setMods(prev => prev.map(mod => 
          mod.id === modId ? data.data : mod
        ));
        return data;
      } else {
        throw new Error('Erro ao atualizar mod');
      }
    } catch (error) {
      console.error('Erro ao atualizar mod:', error);
      throw error;
    }
  };

  // Excluir mod
  const deleteMod = async (modId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/mods/${modId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMods(prev => prev.filter(mod => mod.id !== modId));
        return true;
      } else {
        throw new Error('Erro ao excluir mod');
      }
    } catch (error) {
      console.error('Erro ao excluir mod:', error);
      throw error;
    }
  };

  const value = {
    mods,
    loadingMods,
    fetchMods,
    fetchModsByType,
    addMod,
    updateMod,
    deleteMod
  };

  return (
    <ModsContext.Provider value={value}>
      {children}
    </ModsContext.Provider>
  );
};
