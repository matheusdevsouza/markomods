import React from 'react';
import { buildThumbnailUrl } from '@/utils/urls';

const ImageDebug = ({ mod }) => {
  if (!mod) return null;

  const thumbnailUrl = buildThumbnailUrl(mod.thumbnail_url);
  const thumbnailUrlAlt = buildThumbnailUrl(mod.thumbnail);

  return (
    <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-lg mb-4">
      <h3 className="text-red-400 font-bold mb-2">🔍 Debug de Imagem</h3>
      <div className="text-xs space-y-1 text-red-300">
        <div><strong>Mod ID:</strong> {mod.id}</div>
        <div><strong>Mod Title:</strong> {mod.title || mod.name}</div>
        <div><strong>mod.thumbnail:</strong> {mod.thumbnail || 'null'}</div>
        <div><strong>mod.thumbnail_url:</strong> {mod.thumbnail_url || 'null'}</div>
        <div><strong>buildThumbnailUrl(mod.thumbnail):</strong> {thumbnailUrl || 'null'}</div>
        <div><strong>buildThumbnailUrl(mod.thumbnail_url):</strong> {thumbnailUrlAlt || 'null'}</div>
        <div><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'não definido'}</div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div>
          <strong className="text-red-400">Teste 1 (mod.thumbnail):</strong>
          {mod.thumbnail && (
            <img 
              src={thumbnailUrl} 
              alt="Debug 1" 
              className="w-20 h-20 object-cover border border-red-500"
              onError={(e) => {
                console.error('❌ Erro na imagem 1:', e.target.src);
                e.target.style.border = '2px solid red';
              }}
              onLoad={() => console.log('✅ Imagem 1 carregou:', thumbnailUrl)}
            />
          )}
        </div>
        
        <div>
          <strong className="text-red-400">Teste 2 (mod.thumbnail_url):</strong>
          {mod.thumbnail_url && (
            <img 
              src={thumbnailUrlAlt} 
              alt="Debug 2" 
              className="w-20 h-20 object-cover border border-red-500"
              onError={(e) => {
                console.error('❌ Erro na imagem 2:', e.target.src);
                e.target.style.border = '2px solid red';
              }}
              onLoad={() => console.log('✅ Imagem 2 carregou:', thumbnailUrlAlt)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDebug;
