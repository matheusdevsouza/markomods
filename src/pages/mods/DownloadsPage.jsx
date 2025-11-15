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
  Eye,
  ArrowLeft,
  Gamepad2
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  const [hasAnyDownloads, setHasAnyDownloads] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

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
      }, searchTerm ? 500 : 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, searchTerm, selectedPeriod, selectedType, itemsPerPage, isAuthenticated, currentUser]);

  useEffect(() => {
    if (downloadHistory.length > 0) {
      setHasAnyDownloads(true);
    }
    
    const hasFilters = searchTerm !== '' || selectedPeriod !== 'all' || selectedType !== 'all';
    setIsFiltered(hasFilters);
  }, [downloadHistory, searchTerm, selectedPeriod, selectedType]);


  if (!isAuthenticated || !currentUser) {
    return (
      <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
        <Download size={48} className="mx-auto mb-4 text-muted-foreground/50 sm:h-16 sm:w-16" />
        <h2 className="text-xl sm:text-2xl font-minecraft text-primary mb-2">{t('downloads.restrictedAccess')}</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{t('downloads.loginRequired')}</p>
        <Button asChild className="minecraft-btn text-sm sm:text-base w-full sm:w-auto">
          <Link to="/login">{t('downloads.login')}</Link>
        </Button>
      </div>
    );
  }

  const filteredDownloads = downloadHistory;

  const totalPages = Math.ceil(filteredDownloads.length / itemsPerPage);
  const paginatedDownloads = filteredDownloads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    return totalDownloads;
  };

  return (
    <div className="min-h-screen pt-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent flex items-center gap-3">
                  <Download className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  {t('downloads.title')}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
                  {t('downloads.subtitle')}
                </p>
              </div>
              <Button asChild variant="outline" className="text-primary hover:!text-primary hover:bg-primary/10 hover:border-primary/50 text-sm sm:text-base w-full sm:w-auto">
                <Link to="/mods">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Explorar Mods
                </Link>
              </Button>
            </div>

            <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
              <CardContent className="p-4 sm:p-6 text-center">
                <Download className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-primary">{getTotalDownloads()}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('downloads.totalDownloads')}</p>
              </CardContent>
            </Card>

            <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t('downloads.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm sm:text-base"
                    />
                    {loading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:flex-shrink-0">
                    <div className="w-full sm:w-48">
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="text-sm sm:text-base">
                          <Calendar className="h-4 w-4 mr-2" />
                          <SelectValue placeholder={t('downloads.filters.periodPlaceholder')} />
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

                    <div className="w-full sm:w-48">
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="text-sm sm:text-base">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder={t('downloads.filters.typePlaceholder')} />
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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="hover:bg-primary/10 hover:border-primary/50 hover:text-primary group text-sm sm:text-base w-full sm:w-auto"
                    >
                      {t('downloads.clearFilters')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-minecraft text-primary">
                  {t('downloads.yourDownloads', { count: totalDownloads })}
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
                    className="hover:bg-primary/10 hover:border-primary/50 hover:text-primary group text-sm sm:text-base w-full sm:w-auto"
                  >
                    <RefreshCw size={16} className="mr-2 group-hover:text-primary" />
                    {t('downloads.update')}
                  </Button>
                </div>
              </div>

              {filteredDownloads.length === 0 ? (
                <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
                  <CardContent className="p-6 sm:p-12 text-center">
                    {!hasAnyDownloads ? (
                      <>
                        <Download size={40} className="mx-auto mb-3 sm:mb-4 text-muted-foreground/50 sm:h-12 sm:w-12" />
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{t('downloads.empty.title')}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                          {t('downloads.empty.description')}
                        </p>
                        <Button asChild className="minecraft-btn text-sm sm:text-base w-full sm:w-auto">
                          <Link to="/">
                            <Package size={16} className="mr-2" />
                            {t('downloads.empty.exploreMods')}
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Search size={40} className="mx-auto mb-3 sm:mb-4 text-muted-foreground/50 sm:h-12 sm:w-12" />
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{t('downloads.noResults.title')}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                          {isFiltered 
                            ? t('downloads.noResults.filteredDescription')
                            : t('downloads.noResults.noDownloadsDescription')
                          }
                        </p>
                        {isFiltered && (
                          <Button 
                            onClick={resetFilters}
                            className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white text-sm sm:text-base w-full sm:w-auto"
                          >
                            <Filter size={16} className="mr-2" />
                            {t('downloads.clearFilters')}
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
                        <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                                {download.thumbnail_url ? (
                                  <img
                                    src={buildThumbnailUrl(download.thumbnail_url)}
                                    alt={download.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package size={20} className="text-muted-foreground/50 sm:h-6 sm:w-6" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                      <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-1">
                                        {download.name}
                                      </h3>
                                      <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 w-fit">
                                        {download.minecraft_version || t('downloads.notAvailable')}
                                      </Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                      {download.short_description || t('downloads.noDescription')}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Calendar size={12} className="mr-2 sm:h-3.5 sm:w-3.5" />
                                    <span>{download.downloaded_at ? new Date(download.downloaded_at).toLocaleDateString('pt-BR') : t('downloads.dateNotAvailable')}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock size={12} className="mr-2 sm:h-3.5 sm:w-3.5" />
                                    <span>{download.downloaded_at ? new Date(download.downloaded_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : t('downloads.timeNotAvailable')}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Download size={12} className="mr-2 sm:h-3.5 sm:w-3.5" />
                                    <span>{t('downloads.downloadCompleted')}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <Button asChild className="minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm w-full">
                                  <Link to={`/mods/${download.modSlug || download.mod_id || download.modId}`}>
                                    <ExternalLink size={14} className="mr-2 sm:h-4 sm:w-4" />
                                    {t('downloads.viewMod')}
                                  </Link>
                                </Button>
                                <Button asChild variant="outline" className="minecraft-btn text-xs sm:text-sm w-full">
                                  <Link to={`/mods/${download.modSlug || download.mod_id || download.modId}/download`}>
                                    <Download size={14} className="mr-2 sm:h-4 sm:w-4" />
                                    {t('downloads.downloadAgain')}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {filteredDownloads.length > itemsPerPage && (
                    <div className="mt-6 sm:mt-8">
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
        </div>
      </div>
    </div>
  );
};

export default DownloadsPage;
