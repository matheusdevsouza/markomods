// Utilitários para gerenciar URLs de avatar
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

/**
 * Constrói a URL completa para um avatar
 * @param {string} avatarUrl - URL relativa do avatar (ex: /uploads/avatars/filename.jpg)
 * @returns {string} URL completa do avatar
 */
export const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return undefined;
  }
  
  // Se já é uma URL completa, retorna como está
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // Se é uma URL relativa, adiciona a base do backend
  return `${BACKEND_URL}${avatarUrl}`;
};

/**
 * Constrói a URL de fallback para avatar padrão
 * @returns {string} URL do avatar padrão
 */
export const getDefaultAvatarUrl = () => {
  return '/src/assets/images/marko-avatar.png';
};
