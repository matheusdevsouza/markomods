import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Code,
  Monitor
} from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';
import { useThemeMods } from '../../../contexts/ThemeContextMods';
import { useAuth } from '../../../contexts/AuthContextMods';

const AdminAdsPage = () => {
  const { theme } = useThemeMods();
  const { isAuthenticated, currentUser, authenticatedFetch } = useAuth();
  const { toast } = useToast();
  
  // Estados para configurações de anúncios
  const [adsConfig, setAdsConfig] = useState({
    // Meta tags do Google AdSense
    googleAdsenseEnabled: false,
    googleAdsenseAccount: 'ca-pub-8224876793145643',
    
    // Anúncios personalizados
    customAdsEnabled: false,
    
    // Anúncios por página
    modDetailPage: {
      enabled: false,
      topBanner: {
        enabled: false,
        code: '',
        type: 'google-adsense' // 'google-adsense' ou 'custom'
      }
    },
    
    modDownloadPage: {
      enabled: false,
      topBanner: {
        enabled: false,
        code: '',
        type: 'google-adsense'
      }
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Carregar configurações quando autenticado e com permissão
  useEffect(() => {
    if (isAuthenticated && ['admin','super_admin','moderator'].includes(currentUser?.role)) {
      loadAdsConfig();
    }
  }, [isAuthenticated, currentUser]);

  const loadAdsConfig = async () => {
    try {
      const response = await authenticatedFetch('/api/ads/admin/ads-config', { method: 'GET' });
      
      if (response.ok) {
        const data = await response.json();
        setAdsConfig(data.data);
      } else {
        console.error('Erro ao carregar configurações:', response.status);
        // Usar configuração padrão se não conseguir carregar
        setAdsConfig({
          googleAdsenseEnabled: false,
          googleAdsenseAccount: 'ca-pub-8224876793145643',
          customAdsEnabled: false,
          modDetailPage: {
            enabled: false,
            topBanner: {
              enabled: false,
              code: '',
              type: 'google-adsense'
            }
          },
          modDownloadPage: {
            enabled: false,
            topBanner: {
              enabled: false,
              code: '',
              type: 'google-adsense'
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de anúncios:', error);
      // Usar configuração padrão em caso de erro
      setAdsConfig({
        googleAdsenseEnabled: false,
        googleAdsenseAccount: 'ca-pub-8224876793145643',
        customAdsEnabled: false,
        modDetailPage: {
          enabled: false,
          topBanner: {
            enabled: false,
            code: '',
            type: 'google-adsense'
          }
        },
        modDownloadPage: {
          enabled: false,
          topBanner: {
            enabled: false,
            code: '',
            type: 'google-adsense'
          }
        }
      });
    }
  };

  const saveAdsConfig = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/ads/admin/ads-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adsConfig)
      });
      
      if (response.ok) {
        toast({
          title: 'Configurações salvas!',
          description: 'As configurações de anúncios foram atualizadas com sucesso.',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as configurações de anúncios.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (path, value) => {
    setAdsConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const getAdStatus = (pageConfig) => {
    if (!pageConfig.enabled) return { status: 'disabled', text: 'Desabilitado', color: 'bg-gray-500' };
    if (!pageConfig.topBanner.enabled) return { status: 'no-ad', text: 'Sem anúncio', color: 'bg-yellow-500' };
    if (!pageConfig.topBanner.code.trim()) return { status: 'no-code', text: 'Sem código', color: 'bg-orange-500' };
    return { status: 'active', text: 'Ativo', color: 'bg-green-500' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 sm:space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary" />
            Gerenciar Anúncios
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Configure anúncios do Google AdSense e anúncios personalizados
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3 sm:space-y-0">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="text-sm sm:text-base">{previewMode ? 'Sair do Preview' : 'Preview'}</span>
          </Button>
          
          <Button
            onClick={saveAdsConfig}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="text-sm sm:text-base">Salvar Configurações</span>
          </Button>
        </div>
      </div>

      {/* Configurações Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Code className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
            Configurações Globais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Google AdSense */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold">Google AdSense</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Meta tags do Google AdSense para todo o site
                </p>
              </div>
              <Switch
                checked={adsConfig.googleAdsenseEnabled}
                onCheckedChange={(checked) => updateConfig('googleAdsenseEnabled', checked)}
              />
            </div>
            
            {adsConfig.googleAdsenseEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    ID da Conta Google AdSense
                  </label>
                  <Input
                    value={adsConfig.googleAdsenseAccount}
                    onChange={(e) => updateConfig('googleAdsenseAccount', e.target.value)}
                    placeholder="ca-pub-XXXXXXXXXX"
                    className="font-mono text-sm sm:text-base"
                  />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs sm:text-sm min-w-0 flex-1">
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        Meta tag que será adicionada:
                      </p>
                      <code className="block mt-2 text-xs bg-white dark:bg-gray-800 p-2 rounded border break-all">
                        {`<meta name="google-adsense-account" content="${adsConfig.googleAdsenseAccount}">`}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Anúncios Personalizados */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold">Anúncios Personalizados</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Permite adicionar códigos de anúncio personalizados
                </p>
              </div>
              <Switch
                checked={adsConfig.customAdsEnabled}
                onCheckedChange={(checked) => updateConfig('customAdsEnabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anúncios por Página */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Página de Detalhes do Mod */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                <span className="text-base sm:text-lg">Página de Detalhes do Mod</span>
              </div>
              <Badge className={`${getAdStatus(adsConfig.modDetailPage).color} text-xs`}>
                {getAdStatus(adsConfig.modDetailPage).text}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">Habilitar anúncios</span>
              <Switch
                checked={adsConfig.modDetailPage.enabled}
                onCheckedChange={(checked) => updateConfig('modDetailPage.enabled', checked)}
              />
            </div>
            
            {adsConfig.modDetailPage.enabled && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Banner Superior</span>
                  <Switch
                    checked={adsConfig.modDetailPage.topBanner.enabled}
                    onCheckedChange={(checked) => updateConfig('modDetailPage.topBanner.enabled', checked)}
                  />
                </div>
                
                {adsConfig.modDetailPage.topBanner.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">
                        Código do Anúncio
                      </label>
                      <Textarea
                        value={adsConfig.modDetailPage.topBanner.code}
                        onChange={(e) => updateConfig('modDetailPage.topBanner.code', e.target.value)}
                        placeholder="Cole aqui o código do anúncio..."
                        className="font-mono text-xs sm:text-sm"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="mod-detail-google"
                        name="mod-detail-type"
                        checked={adsConfig.modDetailPage.topBanner.type === 'google-adsense'}
                        onChange={() => updateConfig('modDetailPage.topBanner.type', 'google-adsense')}
                        className="text-primary"
                      />
                      <label htmlFor="mod-detail-google" className="text-xs sm:text-sm">
                        Google AdSense
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="mod-detail-custom"
                        name="mod-detail-type"
                        checked={adsConfig.modDetailPage.topBanner.type === 'custom'}
                        onChange={() => updateConfig('modDetailPage.topBanner.type', 'custom')}
                        className="text-primary"
                      />
                      <label htmlFor="mod-detail-custom" className="text-xs sm:text-sm">
                        Personalizado
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Página de Download do Mod */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                <span className="text-base sm:text-lg">Página de Download do Mod</span>
              </div>
              <Badge className={`${getAdStatus(adsConfig.modDownloadPage).color} text-xs`}>
                {getAdStatus(adsConfig.modDownloadPage).text}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">Habilitar anúncios</span>
              <Switch
                checked={adsConfig.modDownloadPage.enabled}
                onCheckedChange={(checked) => updateConfig('modDownloadPage.enabled', checked)}
              />
            </div>
            
            {adsConfig.modDownloadPage.enabled && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Banner Superior</span>
                  <Switch
                    checked={adsConfig.modDownloadPage.topBanner.enabled}
                    onCheckedChange={(checked) => updateConfig('modDownloadPage.topBanner.enabled', checked)}
                  />
                </div>
                
                {adsConfig.modDownloadPage.topBanner.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">
                        Código do Anúncio
                      </label>
                      <Textarea
                        value={adsConfig.modDownloadPage.topBanner.code}
                        onChange={(e) => updateConfig('modDownloadPage.topBanner.code', e.target.value)}
                        placeholder="Cole aqui o código do anúncio..."
                        className="font-mono text-xs sm:text-sm"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="mod-download-google"
                        name="mod-download-type"
                        checked={adsConfig.modDownloadPage.topBanner.type === 'google-adsense'}
                        onChange={() => updateConfig('modDownloadPage.topBanner.type', 'google-adsense')}
                        className="text-primary"
                      />
                      <label htmlFor="mod-download-google" className="text-xs sm:text-sm">
                        Google AdSense
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="mod-download-custom"
                        name="mod-download-type"
                        checked={adsConfig.modDownloadPage.topBanner.type === 'custom'}
                        onChange={() => updateConfig('modDownloadPage.topBanner.type', 'custom')}
                        className="text-primary"
                      />
                      <label htmlFor="mod-download-custom" className="text-xs sm:text-sm">
                        Personalizado
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-primary" />
              Preview dos Anúncios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Visualização de como os anúncios aparecerão nas páginas:
              </div>
              
              {/* Preview Página de Detalhes */}
              {adsConfig.modDetailPage.enabled && adsConfig.modDetailPage.topBanner.enabled && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Página de Detalhes do Mod</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 text-center text-sm text-gray-500">
                    {adsConfig.modDetailPage.topBanner.code ? (
                      <div dangerouslySetInnerHTML={{ __html: adsConfig.modDetailPage.topBanner.code }} />
                    ) : (
                      'Nenhum código de anúncio configurado'
                    )}
                  </div>
                </div>
              )}
              
              {/* Preview Página de Download */}
              {adsConfig.modDownloadPage.enabled && adsConfig.modDownloadPage.topBanner.enabled && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Página de Download do Mod</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 text-center text-sm text-gray-500">
                    {adsConfig.modDownloadPage.topBanner.code ? (
                      <div dangerouslySetInnerHTML={{ __html: adsConfig.modDownloadPage.topBanner.code }} />
                    ) : (
                      'Nenhum código de anúncio configurado'
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default AdminAdsPage;
