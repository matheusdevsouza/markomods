import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const AuthContext = createContext(null);

const LOCAL_STORAGE_USERS_KEY = 'mediaKitUsers';
const LOCAL_STORAGE_SESSION_KEY = 'mediaKitSession';

const getInitialUsers = () => {
  const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  return storedUsers ? JSON.parse(storedUsers) : [];
};

const getInitialSession = () => {
  const storedSession = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
  return storedSession ? JSON.parse(storedSession) : null;
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(getInitialUsers);
  const [session, setSession] = useState(getInitialSession);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
      const userProfile = users.find(u => u.id === session.user.id);
      setCurrentUserProfile(userProfile);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      setCurrentUserProfile(null);
    }
    setLoadingAuth(false);
  }, [session, users]);

  const fetchUserProfile = useCallback((userId) => {
    const userProfile = users.find(u => u.id === userId);
    setCurrentUserProfile(userProfile);
    return userProfile;
  }, [users]);

  const login = async (credentials) => {
    setLoadingAuth(true);
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    setLoadingAuth(false);
    if (user) {
      setSession({ user: { id: user.id, email: user.email, username: user.username }, expires_at: Date.now() + 3600 * 1000 });
      toast({ title: "Login bem-sucedido!", description: "Bem-vindo de volta!" });
      return true;
    }
    toast({ title: "Falha no Login", description: "Email ou senha inválidos.", variant: "destructive" });
    return null;
  };

  const register = async (userData) => {
    setLoadingAuth(true);
    if (users.find(u => u.email === userData.email)) {
      setLoadingAuth(false);
      toast({ title: "Erro no Cadastro", description: "Este email já está em uso.", variant: "destructive" });
      return null;
    }
    if (users.find(u => u.username === userData.username)) {
      setLoadingAuth(false);
      toast({ title: "Erro no Cadastro", description: "Este nome de usuário já está em uso.", variant: "destructive" });
      return null;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email: userData.email,
      password: userData.password, 
      username: userData.username,
      role: users.length === 0 ? 'admin' : 'member',
      is_verified: users.length === 0, // First user is admin and verified
      avatar_url: '', 
      full_name: userData.username,
      bio: 'Novo membro!',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setLoadingAuth(false);
    toast({ title: "Cadastro realizado!", description: "Você já pode fazer login." });
    return newUser;
  };

  const logout = async () => {
    setLoadingAuth(true);
    setSession(null);
    setCurrentUserProfile(null);
    setLoadingAuth(false);
    toast({ title: "Logout realizado" });
  };
  
  const updateUserProfileInList = (updatedProfile) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedProfile.id ? updatedProfile : u));
    if (currentUserProfile?.id === updatedProfile.id) {
      setCurrentUserProfile(updatedProfile);
    }
  };


  return (
    <AuthContext.Provider value={{ session, currentUserProfile, loadingAuth, login, register, logout, fetchUserProfile, users, updateUserProfileInList, setUsers /* For admin user management */ }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};