import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '../config/api.js';

const AuthContextMods = createContext();

export const useAuth = () => {
  const context = useContext(AuthContextMods);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProviderMods');
  }
  return context;
};

export const AuthProviderMods = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  const openVerificationModal = () => setVerificationModalOpen(true);
  const closeVerificationModal = () => setVerificationModalOpen(false);

  // Configuração da API

  // Verificar se há uma sessão ativa ao carregar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.data && data.data.user) {
            const user = data.data.user;
            
            // Verificar se o usuário foi banido
            if (user.is_banned) {
              // Usuário banido - fazer logout automático
              toast({
                title: "Conta banida",
                description: `Sua conta foi banida da plataforma. Motivo: ${user.ban_reason || 'Banimento administrativo'}. Para mais informações, entre em contato através do e-mail ou outros meios de contato disponíveis.`,
                variant: "destructive"
              });
              
              // Fazer logout automático
              localStorage.removeItem('authToken');
              setCurrentUser(null);
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
            
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            // Token válido mas sem dados do usuário, fazer logout
            localStorage.removeItem('authToken');
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Token inválido ou expirado
          localStorage.removeItem('authToken');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Em caso de erro, limpar estado
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Registro
  const register = async (userData) => {
    try {
      setLoading(true);
      
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        // Verificar se data.data.user existe (estrutura do backend)
        if (!data.data || !data.data.user) {
          throw new Error('Dados do usuário não recebidos do servidor');
        }

        const user = data.data.user;
        const token = data.data.tokens?.accessToken || data.data.tokens?.access_token;

        if (!token) {
          throw new Error('Token de acesso não recebido do servidor');
        }

        // Salvar token e definir usuário, mas não marcar como autenticado até verificação
        localStorage.setItem('authToken', token);
        setCurrentUser(user);
        // Abrir modal de verificação e manter o usuário na página
        openVerificationModal();
        toast({ title: 'Conta criada!', description: 'Enviamos um e-mail para verificação.' });
        
        
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Erro ao criar conta');
      }
      
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: error.message || "Ocorreu um erro ao criar sua conta",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        // Verificar se data.data.user existe (estrutura do backend)
        if (!data.data || !data.data.user) {
          throw new Error('Dados do usuário não recebidos do servidor');
        }

        const user = data.data.user;
        const token = data.data.tokens?.accessToken || data.data.tokens?.access_token;

        if (!token) {
          throw new Error('Token de acesso não recebido do servidor');
        }

        // Salvar token
        localStorage.setItem('authToken', token);
        
        // Definir usuário e estado de autenticação
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${user.display_name || user.username}!`,
          variant: "default"
        });
        
        return { success: true, message: data.message, user };
      } else {
        throw new Error(data.message || 'Erro ao fazer login');
      }
      
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro ao fazer login",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para determinar o redirecionamento baseado no cargo
  const getRedirectPath = (user) => {
    if (!user || !user.role) return '/dashboard';
    
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        return '/admin';
      case 'moderator':
        return '/admin'; // Moderadores também acessam o admin
      default:
        return '/dashboard'; // Usuários comuns vão para dashboard normal
    }
  };

  // Logout
  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Chamar endpoint de logout no backend
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Limpar estado local
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
        variant: "default"
      });
    } catch (error) {
      // Mesmo com erro, limpar estado local
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Solicitar recuperação de senha (não usar loading global para evitar overlay na UI)
  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email enviado!",
          description: "Se o email estiver cadastrado, você receberá instruções de recuperação",
          variant: "default"
        });
        
        return { success: true, message: data.message };
      } else if (response.status === 429) {
        // Rate limit excedido
        toast({
          title: "Muitas tentativas",
          description: data.message || "Tente novamente em alguns minutos",
          variant: "destructive"
        });
        throw new Error(data.message || 'Muitas tentativas. Tente novamente mais tarde.');
      } else {
        throw new Error(data.message || 'Erro ao enviar email de recuperação');
      }
      
    } catch (error) {
      
      // Não mostrar toast se já foi mostrado acima
      if (!error.message.includes('Muitas tentativas')) {
        toast({
          title: "Erro ao enviar email",
          description: error.message || "Ocorreu um erro ao enviar o email de recuperação",
          variant: "destructive"
        });
      }
      
      throw error;
    } finally {
      // não alterar loading global aqui
    }
  };

  // Redefinir senha (não usar loading global para evitar overlay na UI)
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password: newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Senha redefinida!",
          description: "Sua senha foi alterada com sucesso. Faça login com a nova senha.",
          variant: "default"
        });
        
        return { success: true, message: data.message };
      } else if (response.status === 429) {
        // Rate limit excedido
        toast({
          title: "Muitas tentativas",
          description: data.message || "Tente novamente em alguns minutos",
          variant: "destructive"
        });
        throw new Error(data.message || 'Muitas tentativas. Tente novamente mais tarde.');
      } else {
        throw new Error(data.message || 'Erro ao redefinir senha');
      }
      
    } catch (error) {
      
      // Não mostrar toast se já foi mostrado acima
      if (!error.message.includes('Muitas tentativas')) {
        toast({
          title: "Erro ao redefinir senha",
          description: error.message || "Ocorreu um erro ao redefinir sua senha",
          variant: "destructive"
        });
      }
      
      throw error;
    } finally {
      // não alterar loading global aqui
    }
  };

  // Verificar token de reset
  const verifyResetToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.status === 429) {
        // Rate limit excedido
        return { 
          success: false, 
          message: data.message || 'Muitas tentativas. Tente novamente mais tarde.' 
        };
      }
      
      return { success: response.ok, message: data.message };
      
    } catch (error) {
      return { success: false, message: 'Erro ao verificar token' };
    }
  };

    // Atualizar perfil
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data.user);
        
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram salvas com sucesso",
          variant: "default"
        });
        
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Erro ao atualizar perfil');
      }
      
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil",
        variant: "destructive"
        });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar usuário no contexto (para uso interno)
  const updateUser = (userData) => {
    if (userData) {
      // Atualizar o estado do usuário
      setCurrentUser(userData);
      
      // Atualizar também o estado de autenticação se necessário
      if (userData.id) {
        setIsAuthenticated(true);
      }
    } else {
      // Se userData for null, limpar o estado
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Função para fazer requisições autenticadas
  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Não deslogar automaticamente aqui para evitar logout ao abrir páginas que podem falhar temporariamente
    // Deixe a verificação periódica /auth/verify cuidar de invalidar sessões
    return response;
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated,
    setIsAuthenticated,
    register,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    verifyResetToken,
    updateProfile,
    updateUser,
    authenticatedFetch,
    getRedirectPath,
    verificationModalOpen,
    openVerificationModal,
    closeVerificationModal,
  };

  return (
    <AuthContextMods.Provider value={value}>
      {children}
    </AuthContextMods.Provider>
  );
};

