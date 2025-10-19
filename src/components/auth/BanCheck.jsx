import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextMods';
import { useNavigate } from 'react-router-dom';

const BanCheck = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.is_banned) {
      navigate('/banned', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  if (isAuthenticated && currentUser && currentUser.is_banned) {
    return null;
  }

  return children;
};

export default BanCheck;

