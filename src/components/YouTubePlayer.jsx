import React, { useState, useEffect } from 'react';

const YouTubePlayer = ({ videoUrl, title = "Vídeo do Mod" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Função para extrair o ID do vídeo do YouTube
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // Regex para diferentes formatos de URL do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  useEffect(() => {
    if (videoId) {
      // Reset states when videoId changes
      setIsLoaded(false);
      setHasError(false);
    }
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative w-full bg-gray-800 rounded-lg shadow-lg" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium">URL de vídeo inválida</p>
              <p className="text-sm">Por favor, verifique se a URL do YouTube está correta</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // URL do embed do YouTube
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando vídeo...</p>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
            <div className="text-center text-white p-4">
              <div className="text-red-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">Erro ao carregar vídeo</p>
              <p className="text-sm text-gray-300 mb-4">O vídeo não pôde ser carregado. Isso pode ser devido a:</p>
              <ul className="text-sm text-gray-300 text-left max-w-md mx-auto">
                <li>• Bloqueio de CORS pelo YouTube</li>
                <li>• Configurações de segurança do navegador</li>
                <li>• Vídeo privado ou removido</li>
              </ul>
              <div className="mt-4">
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Assistir no YouTube
                </a>
              </div>
            </div>
          </div>
        )}

        <iframe
          src={embedUrl}
          title={title}
          className={`absolute top-0 left-0 w-full h-full rounded-lg shadow-lg transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default YouTubePlayer;
