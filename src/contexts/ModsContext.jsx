
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
  useEffect(() => {
    const isAdmin = currentUser?.role === 'super_admin';
    fetchMods(isAdmin);
  }, [currentUser]);
  const fetchMods = useCallback(async (isAdmin = false) => {
    try {
      setLoadingMods(true);
      const token = localStorage.getItem('authToken');
      let url = '/api/mods/public';
      if (isAdmin && token) {
        url = '/api/mods/admin';
      }
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
        setMods(data.data || []);
      } else {
        setMods([]);
      }
    } catch (error) {
      setMods([]);
    } finally {
      setLoadingMods(false);
    }
  }, []);
  const fetchModsByType = useCallback(async (contentType, isAdmin = false) => {
    try {
      setLoadingMods(true);
      const token = localStorage.getItem('authToken');
      let url = `/api/mods/public?content_type=${contentType}`;
      if (isAdmin && token) {
        url = `/api/mods/admin?content_type=${contentType}`;
      }
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
        setMods(data.data || []);
      } else {
        setMods([]);
      }
    } catch (error) {
      setMods([]);
    } finally {
      setLoadingMods(false);
    }
  }, []);
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
      throw error;
    }
  };
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
      throw error;
    }
  };
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