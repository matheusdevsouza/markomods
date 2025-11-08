import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContextMods';

const PermissionsContext = createContext(null);

export const PermissionsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const lastUserRef = useRef(null);

  useEffect(() => {
    if (fetchingRef.current) return;
    
    if (!currentUser || !currentUser.role) {
      setPermissions({});
      setLoading(false);
      lastUserRef.current = null;
      return;
    }

    const userId = currentUser.id;
    const userRole = currentUser.role;

    if (lastUserRef.current?.id === userId && lastUserRef.current?.role === userRole) {
      return;
    }

    fetchingRef.current = true;
    setLoading(true);

    if (userRole === 'admin') {
      setPermissions({ admin: { all: true } });
      setLoading(false);
      lastUserRef.current = { id: userId, role: userRole };
      fetchingRef.current = false;
      return;
    }

    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/administrators/my-permissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          const permsMap = {};
          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            data.data.forEach(item => {
              if (item.role && item.permissions) {
                permsMap[item.role] = item.permissions;
              }
            });
          }
          setPermissions(permsMap);
          lastUserRef.current = { id: userId, role: userRole };
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erro ao buscar permissões:', response.status, errorData);
          setPermissions({});
        }
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
        setPermissions({});
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchPermissions();
  }, [currentUser?.id, currentUser?.role]);

  const refetch = useCallback(async () => {
    if (!currentUser || !currentUser.role) return;
    lastUserRef.current = null;
    fetchingRef.current = false;
    const fetchPermissions = async () => {
      fetchingRef.current = true;
      setLoading(true);
      
      if (currentUser.role === 'admin') {
        setPermissions({ admin: { all: true } });
        setLoading(false);
        lastUserRef.current = { id: currentUser.id, role: currentUser.role };
        fetchingRef.current = false;
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/administrators/my-permissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          const permsMap = {};
          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            data.data.forEach(item => {
              if (item.role && item.permissions) {
                permsMap[item.role] = item.permissions;
              }
            });
          }
          setPermissions(permsMap);
          lastUserRef.current = { id: currentUser.id, role: currentUser.role };
        }
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };
    await fetchPermissions();
  }, [currentUser]);

  const hasPermission = useCallback((permission) => {
    if (!currentUser || !currentUser.role) {
      return false;
    }

    if (currentUser.role === 'admin') {
      return true;
    }

    if (loading) {
      return false;
    }

    const rolePermissions = permissions[currentUser.role];
    if (!rolePermissions || typeof rolePermissions !== 'object') {
      return false;
    }

    const hasPerm = rolePermissions[permission] === true;
    return hasPerm;
  }, [currentUser, permissions, loading]);

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, loading, refetch }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
};

