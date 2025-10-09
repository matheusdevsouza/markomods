
import { API_BASE_URL } from '../config/api.js';
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    return imagePath;
  }
  if (imagePath.startsWith('/')) {
    const fullUrl = `${API_BASE_URL}${imagePath}`;
    return fullUrl;
  }
  const fullUrl = `${API_BASE_URL}/${imagePath}`;
  return fullUrl;
};
export const buildThumbnailUrl = (thumbnailPath) => {
  return buildImageUrl(thumbnailPath);
};
export const buildAvatarUrl = (avatarPath) => {
  return buildImageUrl(avatarPath);
};
export const buildGalleryUrl = (galleryPath) => {
  return buildImageUrl(galleryPath);
};
export const buildVideoUrl = (videoPath) => {
  if (!videoPath) return null;
  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) return videoPath;
  if (videoPath.startsWith('/api/mods/uploads')) return videoPath;
  if (videoPath.startsWith('/uploads')) return `/api/mods${videoPath}`;
  if (videoPath.startsWith('/')) return `${API_BASE_URL}${videoPath}`;
  return `${API_BASE_URL}/${videoPath}`;
};