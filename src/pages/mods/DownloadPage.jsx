import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextMods';
import { useThemeMods } from '../../contexts/ThemeContextMods';
import { useTranslation } from '../../hooks/useTranslation';
import { buildThumbnailUrl } from '../../utils/urls';
import { 
  Download, 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import GoogleAdSense from '../../components/ads/GoogleAdSense';
import GoogleAdsenseMeta from '../../components/ads/GoogleAdsenseMeta';

const DownloadPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { theme } = useThemeMods();
  const { t } = useTranslation();

  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const [pageLoaded, setPageLoaded] = useState(false);

  const getCardClasses = () => {
    return theme === 'light'
      ? 'bg-white/90 border-gray-200/50 shadow-lg'
      : 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm';
  };

  const getTextClasses = () => {
    return theme === 'light'
      ? 'text-gray-900' 
      : 'text-white';
  };

  const getSubtextClasses = () => {
    return theme === 'light'
      ? 'text-gray-600' 
      : 'text-gray-300';
  };

  const getButtonClasses = () => {
    return theme === 'light'
      ? 'bg-primary hover:bg-primary/90 text-white'
      : 'bg-primary hover:bg-primary/90 text-white';
  };

  useEffect(() => {
    if (mod) {
      const timer = setTimeout(() => {
        setPageLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mod]);

  useEffect(() => {
    if (slug) {
      fetchModBySlug(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (countdown > 0 && !downloadStarted) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !downloadStarted) {
      setDownloadStarted(true);
    }
  }, [countdown, downloadStarted]);

  const fetchModBySlug = async (slug) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/mods/public/${slug}`, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setMod(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar mod');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!mod) return;

    console.log('Iniciando download para mod:', mod);
    setIsDownloading(true);

    try {
      const downloadUrl = mod.download_url_pc || mod.download_url_mobile;
      console.log('URL de download:', downloadUrl);
      
      if (downloadUrl) {

        const token = localStorage.getItem('authToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('Fazendo requisição para:', `/api/mods/${mod.id}/download`);
        try {
          const response = await fetch(`/api/mods/${mod.id}/download`, {
            method: 'POST',
            headers
          });

          console.log('Resposta da API:', response.status, response.ok);

          if (response.ok) {
            const data = await response.json();
            console.log('Dados recebidos:', data);
            
            setMod(prev => ({
              ...prev,
              download_count: (prev.download_count || 0) + 1
            }));
            
            try {
              const historyKey = 'userDownloadHistory';
              const raw = localStorage.getItem(historyKey);
              const list = raw ? JSON.parse(raw) : [];
              const entry = {
                modId: mod.id,
                id: mod.id,
                name: mod.title || mod.name,
                title: mod.title || mod.name,
                thumbnail_url: mod.thumbnail_url,
                minecraft_version: mod.minecraft_version,
                short_description: mod.short_description,
                tags: mod.tags || [],
                saved_at: new Date().toISOString()
              };
              const dedup = [entry, ...list.filter(i => (i.modId || i.id) !== mod.id)].slice(0, 20);
              localStorage.setItem(historyKey, JSON.stringify(dedup));
              localStorage.setItem('downloadsUpdated', String(Date.now()));

              const totalKey = 'userDownloadTotalLocal';
              const prev = parseInt(localStorage.getItem(totalKey) || '0', 10);
              localStorage.setItem(totalKey, String(prev + 1));
            } catch {}

            if (data.data.download_url.startsWith('/download/')) {
              console.log('Arquivo local detectado, iniciando download direto');
              const directDownloadUrl = `http://localhost:3001${data.data.download_url}`;
              console.log('URL de download direto:', directDownloadUrl);
              
              const link = document.createElement('a');
              link.href = directDownloadUrl;
              const urlParams = new URLSearchParams(data.data.download_url.split('?')[1]);
              const modName = urlParams.get('modName') || data.data.mod_name || mod.title;
              const modLoader = urlParams.get('modLoader') || '';
              const minecraftVersion = urlParams.get('minecraftVersion') || '';
              const modVersion = urlParams.get('modVersion') || '';
              const fileExtension = data.data.download_url.includes('.mcpack') ? '.mcpack' : 
                                   data.data.download_url.includes('.mcaddon') ? '.mcaddon' :
                                   data.data.download_url.includes('.jar') ? '.jar' : '.zip';
              
              let downloadFilename;
              if (modLoader && minecraftVersion && modVersion) {
                downloadFilename = `${modName}-${modLoader}-${minecraftVersion}-${modVersion}${fileExtension}`;
              } else if (minecraftVersion && modVersion) {
                downloadFilename = `${modName}-${minecraftVersion}-${modVersion}${fileExtension}`;
              } else {
                downloadFilename = `${modName}${fileExtension}`;
              }
              
              link.download = downloadFilename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              toast.success('Download iniciado!');
            } else {
              console.log('URL externa detectada, abrindo em nova aba');
              window.open(data.data.download_url, '_blank', 'noopener,noreferrer');
              toast.success(t('downloadPage.linkOpened'));
            }
          } else {
            console.error('Erro na resposta da API:', response.status);
            const errorData = await response.json();
            console.error('Dados do erro:', errorData);
            toast.error('Erro ao processar download');
          }
        } catch (error) {
          console.error('Erro na requisição:', error);
          toast.error('Erro de conexão');
        }
      } else {
        console.log('Nenhuma URL de download disponível');
        toast.error(t('downloadPage.error.downloadNotAvailable'));
      }
    } catch (error) {
      console.error('Erro geral:', error);
      toast.error(t('downloadPage.toast.downloadError'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSkipCountdown = () => {
    setCountdown(0);
    setDownloadStarted(true);
  };

  if (error || !mod) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/30">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-red-500">
                {error || t('downloadPage.error.modNotFound')}
              </h1>
              <p className={`text-xl max-w-2xl mx-auto ${getSubtextClasses()}`}>
                {error ? 
                  `${t('downloadPage.error.loadError')}: ${error}` : 
                  t('downloadPage.error.modNotFound')
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/mods">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar aos Mods
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GoogleAdsenseMeta />
      
      <div className="w-full px-4 py-6 mb-8">
        <GoogleAdSense 
          position="TOP_BANNER"
          adFormat="auto"
          fullWidthResponsive={true}
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-6">
        <div className={`rounded-xl p-8 transition-all duration-1000 ease-out delay-200 ${getCardClasses()} ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="text-center space-y-6">
            {!downloadStarted ? (
              <>
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center border border-primary/50">
                    <Clock className="w-12 h-12 text-primary animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className={`text-2xl font-bold ${getTextClasses()}`}>
                    {t('downloadPage.preparingDownload')}
                  </h2>
                  <p className={`text-lg ${getSubtextClasses()}`}>
                    {t('downloadPage.downloadWillStart')}
                  </p>
                  
                  <div className="flex justify-center">
                    <div className="text-6xl font-bold text-primary bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center border-2 border-primary/30">
                      {countdown}
                    </div>
                  </div>
                  
                  
                </div>
                

              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center border border-green-500/50">
                    {isDownloading ? (
                      <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                    ) : (
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className={`text-2xl font-bold ${getTextClasses()}`}>
                    {countdown > 0 
                      ? t('downloadPage.preparingDownload') 
                      : isDownloading 
                        ? t('downloadPage.preparingDownload')
                        : t('downloadPage.downloadReady')
                    }
                  </h2>
                  <p className={`text-lg ${getSubtextClasses()}`}>
                    {countdown > 0
                      ? `${t('downloadPage.downloadWillStart')} ${countdown} ${countdown === 1 ? 'segundo' : 'segundos'}...`
                      : isDownloading 
                        ? t('downloadPage.preparingDownload')
                        : t('downloadPage.clickToDownload')
                    }
                  </p>
                   
                   {!isDownloading && countdown === 0 && (
                     <div className="space-y-6">
                       <div className="flex justify-center">
                         <Button 
                           onClick={handleDownload}
                           className="bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-purple-600 hover:to-purple-700 text-white px-12 py-5 text-xl h-auto transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 rounded-2xl font-bold"
                         >
                           <Download className="h-6 w-6 mr-3" />
                           {t('downloadPage.downloadNow')}
                         </Button>
                       </div>
                       
                       <div className="flex justify-center">
                         <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                           <span>ou</span>
                         </div>
                       </div>
                       
                       <div className="flex justify-center gap-3">
                         <Link to={`/mods/${mod.slug}`}>
                           <Button 
                             variant="outline" 
                             size="sm"
                             className="border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                           >
                             <ArrowLeft className="h-4 w-4 mr-2" />
                             {t('downloadPage.backToMod')}
                           </Button>
                         </Link>
                         <Link to="/mods">
                           <Button 
                             variant="ghost" 
                             size="sm"
                             className="text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                           >
                             {t('downloadPage.exploreOtherMods')}
                           </Button>
                         </Link>
                       </div>
                     </div>
                   )}
                 </div>
              </>
            )}
          </div>
        </div>

        <div className={`rounded-xl p-6 transition-all duration-1000 ease-out delay-300 ${getCardClasses()} ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-4">
            <h3 className={`text-xl font-bold flex items-center ${getTextClasses()}`}>
              <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              {t('downloadPage.modInformation')}
            </h3>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.title')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>{mod.title || mod.name}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.author')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>{mod.author_display_name || mod.author_name || mod.author || t('downloadPage.unknown')}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.version')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>{mod.version || t('downloadPage.notAvailable')}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.minecraft')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>{mod.minecraft_version || t('downloadPage.notAvailable')}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.loader')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>
                     {mod.mod_loader === 'padrao' || mod.mod_loader === 'padrão' ? 'Padrão' : 
                      mod.mod_loader === 'forge' ? 'Forge' : 
                      mod.mod_loader === 'fabric' ? 'Fabric' : 
                      mod.mod_loader || t('downloadPage.notAvailable')}
                   </span>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.views')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>{mod.view_count || mod.views || 0}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.downloads')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>{mod.download_count || 0}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.size')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>{mod.file_size || t('downloadPage.notAvailable')}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.type')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>
                     {mod.content_type_id === 2 ? t('downloadPage.addonType') : t('downloadPage.modType')}
                   </span>
                 </div>
                 <div className="flex justify-between">
                   <span className={getSubtextClasses()}>{t('downloadPage.date')}</span>
                   <span className={`font-medium ${getTextClasses()}`}>
                     {mod.created_at ? new Date(mod.created_at).toLocaleDateString('pt-BR') : t('downloadPage.notAvailable')}
                   </span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
