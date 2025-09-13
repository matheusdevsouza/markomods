import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Calendar, 
  Clock, 
  Package,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { useMods } from '@/contexts/ModsContext';
import { useAuth } from '@/contexts/AuthContextMods';
import { useDownloads } from '@/contexts/DownloadsContext';
import { useToast } from '@/components/ui/use-toast';
import { buildThumbnailUrl } from '@/utils/urls';
import { useTranslation } from '@/hooks/useTranslation';
import PaginationControls from '@/components/ui/PaginationControls';

const DownloadsPage = () => {
  const { mods, loadingMods } = useMods();
  const { currentUser, isAuthenticated } = useAuth();
  const { downloadHistory, totalDownloads, loading, fetchDownloadHistory } = useDownloads();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 downloads por página
  
  // Estados para controle de exibição
  const [hasAnyDownloads, setHasAnyDownloads] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  // Buscar downloads quando filtros mudarem (com debounce para busca)
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const timeoutId = setTimeout(() => {
        fetchDownloadHistory({
          limit: itemsPerPage.toString(),
          page: currentPage.toString(),
          search: searchTerm,
          period: selectedPeriod,
          type: selectedType
        });
      }, searchTerm ? 500 : 0); // Debounce de 500ms para busca
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, searchTerm, selectedPeriod, selectedType, itemsPerPage, isAuthenticated, currentUser]);

  // Verificar se há downloads e filtros aplicados
  useEffect(() => {
    if (downloadHistory.length > 0) {
      setHasAnyDownloads(true);
    }
    
    const hasFilters = searchTerm !== '' || selectedPeriod !== 'all' || selectedType !== 'all';
    setIsFiltered(hasFilters);
  }, [downloadHistory, searchTerm, selectedPeriod, selectedType]);

  if (loading || loadingMods) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('downloads.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="text-center py-12">
        <Download size={64} className="mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-2xl font-minecraft text-primary mb-2">{t('downloads.restrictedAccess')}</h2>
        <p className="text-muted-foreground mb-6">{t('downloads.loginRequired')}</p>
        <Button asChild className="minecraft-btn">
          <Link to="/login">{t('downloads.login')}</Link>
        </Button>
      </div>
    );
  }

  // Filtrar downloads baseado na busca, período e tipo (agora os filtros são aplicados no backend)
  const filteredDownloads = downloadHistory;

  // Lógica de paginação
  const totalPages = Math.ceil(filteredDownloads.length / itemsPerPage);
  const paginatedDownloads = filteredDownloads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Funções para paginação
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };


  const resetFilters = () => {
    setSearchTerm('');
    setSelectedPeriod('all');
    setSelectedType('all');
    setCurrentPage(1);
  };

  const periods = [
    { value: 'all', label: t('downloads.filters.periods.all') },
    { value: 'today', label: t('downloads.filters.periods.today') },
    { value: 'week', label: t('downloads.filters.periods.week') },
    { value: 'month', label: t('downloads.filters.periods.month') }
  ];

  const types = [
    { value: 'all', label: t('downloads.filters.types.all') },
    { value: 'public', label: t('downloads.filters.types.public') },
    { value: 'premium', label: t('downloads.filters.types.premium') }
  ];

  const getTotalDownloads = () => {
    // Sempre usar a contagem do contexto, que vem do banco de dados
    return totalDownloads;
  };

  // Remover o return early - sempre mostrar o container principal

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-minecraft text-primary mb-4">
          <Download className="inline-block mr-3 text-blue-500" />
          {t('downloads.title')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('downloads.subtitle')}
        </p>
      </div>

      {/* Estatísticas */}
      <Card className="minecraft-card">
        <CardContent className="p-6 text-center">
          <Download className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-foreground">{getTotalDownloads()}</div>
          <p className="text-sm text-muted-foreground">Total de Downloads</p>
        </CardContent>
      </Card>

      {/* Filtros e Busca */}
      <Card className="minecraft-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar nos seus downloads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Filtro de Período */}
            <div className="w-full lg:w-48">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por período" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Tipo */}
            <div className="w-full lg:w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão Limpar */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-500 group"
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Downloads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-minecraft text-primary">
            Seus Downloads ({totalDownloads})
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDownloadHistory({
                limit: itemsPerPage.toString(),
                page: currentPage.toString(),
                search: searchTerm,
                period: selectedPeriod,
                type: selectedType
              })}
              className="hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-500 group"
            >
              <RefreshCw size={16} className="mr-2 group-hover:text-blue-500" />
              Atualizar
            </Button>
          </div>
        </div>

        {filteredDownloads.length === 0 ? (
          <Card className="minecraft-card">
            <CardContent className="p-12 text-center">
              {!hasAnyDownloads ? (
                // Usuário não tem nenhum download
                <>
                  <Download size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('downloads.empty.title')}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('downloads.empty.description')}
                  </p>
                  <Button asChild className="minecraft-btn">
                    <Link to="/">
                      <Package size={16} className="mr-2" />
                      {t('downloads.empty.exploreMods')}
                    </Link>
                  </Button>
                </>
              ) : (
                // Usuário tem downloads, mas filtros não retornaram resultados
                <>
                  <Search size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-muted-foreground mb-6">
                    {isFiltered 
                      ? 'Tente ajustar os filtros para encontrar seus downloads'
                      : 'Não há downloads para exibir no momento'
                    }
                  </p>
                  {isFiltered && (
                    <Button 
                      onClick={resetFilters}
                      className="minecraft-btn bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Filter size={16} className="mr-2" />
                      Limpar Filtros
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedDownloads.map((download, index) => (
                <motion.div
                  key={download.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="minecraft-card hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Imagem do Mod */}
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                          {download.thumbnail_url ? (
                            <img
                              src={buildThumbnailUrl(download.thumbnail_url)}
                              alt={download.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={24} className="text-muted-foreground/50" />
                            </div>
                          )}
                        </div>

                        {/* Informações do Mod */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                                  {download.name}
                                </h3>
                                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                                  {download.minecraft_version || 'N/A'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {download.short_description || 'Sem descrição disponível'}
                              </p>
                            </div>
                          </div>

                          {/* Metadados do Download */}
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-2" />
                              <span>{download.downloaded_at ? new Date(download.downloaded_at).toLocaleDateString('pt-BR') : 'Data não disponível'}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-2" />
                              <span>{download.downloaded_at ? new Date(download.downloaded_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hora não disponível'}</span>
                            </div>
                            <div className="flex items-center">
                              <Download size={14} className="mr-2" />
                              <span>Download concluído</span>
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col gap-2 lg:flex-shrink-0">
                          <Button asChild className="minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link to={`/mods/${download.modId}`}>
                              <ExternalLink size={16} className="mr-2" />
                              Ver Mod
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="minecraft-btn">
                            <Link to={`/mods/${download.modId}`}>
                              <Download size={16} className="mr-2" />
                              Baixar Novamente
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Paginação */}
            {/* Controles de Paginação */}
            {filteredDownloads.length > itemsPerPage && (
              <div className="mt-8">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="justify-center"
                />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default DownloadsPage;
