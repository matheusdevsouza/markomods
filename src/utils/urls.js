// Utilitários para construção de URLs
import { API_BASE_URL } from '../config/api.js';

/**
 * Constrói a URL completa para uma imagem
 * @param {string} imagePath - Caminho relativo da imagem (ex: /uploads/thumbnails/image.png)
 * @returns {string} URL completa da imagem
 */
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Se já é uma URL completa (http/https), retorna como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Se é um caminho relativo que começa com /uploads, retorna como está
  // O proxy do Vite vai redirecionar /uploads para o backend
  if (imagePath.startsWith('/uploads')) {
    return imagePath;
  }
  
  // Se é um caminho relativo que NÃO é uploads, adiciona API_BASE_URL
  if (imagePath.startsWith('/')) {
    const fullUrl = `${API_BASE_URL}${imagePath}`;
    return fullUrl;
  }
  
  // Se não tem barra no início, adiciona
  const fullUrl = `${API_BASE_URL}/${imagePath}`;
  return fullUrl;
};

/**
 * Constrói a URL completa para uma thumbnail
 * @param {string} thumbnailPath - Caminho relativo da thumbnail
 * @returns {string} URL completa da thumbnail
 */
export const buildThumbnailUrl = (thumbnailPath) => {
  return buildImageUrl(thumbnailPath);
};

/**
 * Constrói a URL completa para um avatar
 * @param {string} avatarPath - Caminho relativo do avatar
 * @returns {string} URL completa do avatar
 */
export const buildAvatarUrl = (avatarPath) => {
  return buildImageUrl(avatarPath);
};

/**
 * Constrói a URL completa para uma galeria
 * @param {string} galleryPath - Caminho relativo da imagem da galeria
 * @returns {string} URL completa da imagem da galeria
 */
export const buildGalleryUrl = (galleryPath) => {
  return buildImageUrl(galleryPath);
};

/**
 * Constrói a URL completa para um vídeo salvo em uploads
 * Regras:
 * - Se já for http/https, retorna como está
 * - Se começar com /api/mods/uploads, retorna como está
 * - Se começar com /uploads, prefixa com /api/mods
 * - Caso contrário, tenta prefixar com API_BASE_URL
 */
export const buildVideoUrl = (videoPath) => {
  if (!videoPath) return null;
  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) return videoPath;
  if (videoPath.startsWith('/api/mods/uploads')) return videoPath;
  if (videoPath.startsWith('/uploads')) return `/api/mods${videoPath}`;
  if (videoPath.startsWith('/')) return `${API_BASE_URL}${videoPath}`;
  return `${API_BASE_URL}/${videoPath}`;
};