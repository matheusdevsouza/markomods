import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextMods';
import { useNavigate } from 'react-router-dom';

const BanCheck = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se usuário está logado e banido, redirecionar para página de banimento
    if (isAuthenticated && currentUser && currentUser.is_banned) {
      navigate('/banned', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Se usuário está banido, não renderizar nada (será redirecionado)
  if (isAuthenticated && currentUser && currentUser.is_banned) {
    return null;
  }

  return children;
};

export default BanCheck;

