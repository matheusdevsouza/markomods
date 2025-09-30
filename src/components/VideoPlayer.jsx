import React, { useEffect, useRef, useState } from 'react';

// Player de vídeo com controles customizados, estilizado no contexto do site
// Props: src (obrigatório), type (opcional), poster (opcional), className (opcional)
const VideoPlayer = ({ src, type, poster, className = '' }) => {
  const videoRef = useRef(null);
  const bgVideoRef = useRef(null);
  const progressRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (secs) => {
    if (!isFinite(secs)) return '0:00';
    const t = Math.max(0, Math.floor(secs));
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolume = (val) => {
    const v = Math.min(1, Math.max(0, Number(val)));
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    video.muted = v === 0;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      // Speaker off
      return (
        <svg className="h-4 w-4 text-white/90" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 10v4h4l5 5V5L7 10H3zM16.5 12l2.25-2.25 1.25 1.25L17.75 13.25 20 15.5l-1.25 1.25L16.5 14.5l-2.25 2.25-1.25-1.25L15.25 13.25 13 11l1.25-1.25L16.5 12z" />
        </svg>
      );
    }
    if (volume < 0.5) {
      // Speaker low
      return (
        <svg className="h-4 w-4 text-white/90" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 10v4h4l5 5V5L7 10H3z" />
          <path d="M16 12a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 16 12z" />
        </svg>
      );
    }
    // Speaker high
    return (
      <svg className="h-4 w-4 text-white/90" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 10v4h4l5 5V5L7 10H3z" />
        <path d="M16 12a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 16 12z" />
        <path d="M18 12a6 6 0 0 0-3-5.2v10.4A6 6 0 0 0 18 12z" />
      </svg>
    );
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
  };

  const handleRate = (rate) => {
    const r = Number(rate) || 1;
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = r;
    setPlaybackRate(r);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Hotkeys
  useEffect(() => {
    const onKey = (e) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      switch (e.key.toLowerCase()) {
        case ' ': // espaço
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'arrowright':
          videoRef.current.currentTime = Math.min(duration, currentTime + 5);
          break;
        case 'arrowleft':
          videoRef.current.currentTime = Math.max(0, currentTime - 5);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case '+':
        case '=':
          handleRate(Math.min(2, playbackRate + 0.25));
          break;
        case '-':
          handleRate(Math.max(0.25, playbackRate - 0.25));
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentTime, duration, playbackRate]);

  // Listeners do vídeo
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(v.currentTime);
    const onLoaded = () => {
      setDuration(v.duration || 0);
      setVolume(v.volume);
      setIsMuted(v.muted);
      setPlaybackRate(v.playbackRate);
    };
    const onProgress = () => {
      try {
        if (v.buffered.length > 0) {
          const end = v.buffered.end(v.buffered.length - 1);
          setBuffered(Math.min(1, end / (v.duration || 1)));
        }
      } catch {}
    };
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('progress', onProgress);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('progress', onProgress);
    };
  }, []);

  // Sincronizar vídeo de fundo (blur) para preencher laterais
  useEffect(() => {
    const v = videoRef.current;
    const bg = bgVideoRef.current;
    if (!v || !bg) return;

    const syncTime = () => {
      try {
        if (Math.abs((bg.currentTime || 0) - (v.currentTime || 0)) > 0.2) {
          bg.currentTime = v.currentTime || 0;
        }
      } catch {}
    };

    const onPlay = () => {
      try { bg.muted = true; bg.play().catch(() => {}); } catch {}
    };
    const onPause = () => { try { bg.pause(); } catch {} };
    const onSeeked = () => syncTime();
    const onTimeUpdate = () => syncTime();

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('seeked', onSeeked);
    v.addEventListener('timeupdate', onTimeUpdate);
    // start with paused background aligned at 0
    syncTime();
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('seeked', onSeeked);
      v.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = buffered * 100;

  return (
    <div ref={containerRef} className={`group relative w-full h-full bg-black/80 rounded-lg overflow-hidden ${className}`}>
      {/* Camada de preenchimento (blur) */}
      <video
        ref={bgVideoRef}
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl brightness-[.45] z-0"
        src={src}
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      />
      {/* Vídeo principal acima do background */}
      <video ref={videoRef} className="relative z-10 w-full h-full object-contain" src={src} {...(type ? { type } : {})} poster={poster} preload="metadata" />

      {/* Overlay: escurecer e aplicar blur quando pausado */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } bg-black/50 backdrop-blur-md`}
        style={{ zIndex: 20 }}
      />

      {/* Controles */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" style={{ zIndex: 40 }}>
        {/* Barra de progresso */}
        <div ref={progressRef} className="relative h-2 sm:h-2.5 bg-white/10 rounded-full cursor-pointer select-none mb-3" onClick={handleSeek}>
          <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full" style={{ width: `${bufferedPercent}%` }} />
          <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
          <div className="absolute -top-1.5 h-5 w-5 bg-primary border-2 border-white/20 rounded-full shadow-md" style={{ left: `calc(${progressPercent}% - 10px)` }} />
        </div>

        {/* Linha de ações */}
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? (
                // Ícone pause amigável
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5zm7 0a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V5z" />
                </svg>
              ) : (
                // Ícone play amigável
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.14v13.72c0 .8.86 1.3 1.56.9l10.12-6.86c.67-.4.67-1.4 0-1.8L9.56 4.24A1.05 1.05 0 0 0 8 5.14z" />
                </svg>
              )}
            </button>
            <div className="text-xs sm:text-sm tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Volume */}
            <button onClick={toggleMute} className="h-8 w-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center" title={isMuted || volume===0 ? 'Ativar som' : 'Silenciar'}>
              {getVolumeIcon()}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolume(e.target.value)}
              className="w-20 sm:w-28 accent-primary"
            />

            {/* Velocidade */}
            <div className="relative">
              <select
                value={playbackRate}
                onChange={(e) => handleRate(e.target.value)}
                className="appearance-none bg-black/40 text-white border border-white/10 hover:bg-black/50 backdrop-blur px-3 py-1.5 pr-8 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                title="Velocidade"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(r => (
                  <option key={r} value={r} className="bg-neutral-900 text-white">{r}x</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/80">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.2l3.71-2.97a.75.75 0 111.04 1.08l-4.24 3.4a.75.75 0 01-.94 0l-4.24-3.4a.75.75 0 01-.02-1.06z"/></svg>
              </span>
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="h-8 w-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center" title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
              {isFullscreen ? (
                // Ícone compress (menor e discreto)
                <svg className="h-3.5 w-3.5 text-white/90" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3H7v4H3v2h6V3zm8 0h-2v6h6V7h-4V3zM3 15v2h4v4h2v-6H3zm18 0h-6v6h2v-4h4v-2z"/></svg>
              ) : (
                // Ícone expand (menor e discreto)
                <svg className="h-3.5 w-3.5 text-white/90" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5H5v4H3V3h6v2zm12 4h-2V5h-4V3h6v6zM5 15H3v6h6v-2H5v-4zm16 6h-6v-2h4v-4h2v6z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Botão Play central para estado pausado (UX) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary to-purple-600/90 flex items-center justify-center border-2 border-white/20 shadow-[0_10px_40px_rgba(124,58,237,0.45)] hover:scale-105 transition"
          title="Reproduzir"
          style={{ zIndex: 50 }}
        >
          <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72c0 .8.86 1.3 1.56.9l10.12-6.86c.67-.4.67-1.4 0-1.8L9.56 4.24A1.05 1.05 0 0 0 8 5.14z"/></svg>
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;


