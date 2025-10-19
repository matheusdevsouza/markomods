const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

/**
 * constroi a URL completa para um avatar
 * @param {string} avatarUrl 
 * @returns {string} 
 */
export const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return undefined;
  }
  
  // se já é uma URL completa, retorna como está
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // se é uma URL relativa, adiciona a base do backend
  return `${BACKEND_URL}${avatarUrl}`;
};

/**
 * constroi a URL de fallback para avatar padrão
 * @returns {string}
 */
export const getDefaultAvatarUrl = () => {
  return '/src/assets/images/marko-avatar.png';
};
