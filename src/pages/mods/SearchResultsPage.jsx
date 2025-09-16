
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useTranslation } from '@/hooks/useTranslation';
import ModCard from '@/components/mods/ModCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/ui/pagination';
import { 
  Search, 
  XCircle, 
  RotateCcw, 
  Filter
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const SearchResultsPage = () => {
  const { t } = useTranslation();
  
  const {
    searchResults,
    loading,
    error,
    totalResults,
    currentPage,
    totalPages,
    filters,
    sortOptions,
    featuredOptions,
    updateFilters,
    clearFilters,
    changePage
  } = useAdvancedSearch();

  const [localFilters, setLocalFilters] = useState(filters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);



  // Sincronizar filtros locais com os filtros do hook
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);



  // Atualizar filtros locais e aplicar automaticamente
  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    // Mostrar loading
    setFiltersLoading(true);
    
    // Aplicar filtros automaticamente após uma pequena pausa
    setTimeout(() => {
      updateFilters(newFilters);
      setFiltersLoading(false);
    }, 300); // 300ms de delay para evitar muitas requisições
  };

  // Resetar filtros
  const handleResetFilters = () => {
    clearFilters();
    setLocalFilters({
      q: '',
      version: 'all',
      loader: 'all',
      category: 'all',
      sort: 'relevance',
      featured: 'all',
      author: ''
    });
  };

  // Opções de versão do Minecraft (baseadas nos dados reais do banco)
  const minecraftVersions = [
    'all', '1.20.1', '1.19', '1.5.2'
  ];

  // Opções de loader (baseadas na estrutura real da tabela)
  const loaderOptions = [
    'all', 'forge', 'fabric', 'quilt', 'other'
  ];

  // Opções de categoria (baseadas nas tags únicas dos mods)
  const categoryOptions = [
    'all', 'Marko', 'Tech', 'Robot', 'Gun'
  ];

  if (loading && searchResults.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
          className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full" 
        />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4 sm:space-y-8">

      {/* Header da Busca */}
      <motion.section variants={itemVariants} className="p-4 sm:p-6 bg-card/70 rounded-lg shadow-md border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-minecraft text-primary flex items-center">
            <Search size={24} className="mr-2 sm:mr-3 text-accent"/> 
            {t('search.advancedSearch')}
          </h1>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="minecraft-btn text-sm sm:text-base w-full sm:w-auto"
          >
            <Filter size={16} className="mr-2" />
            {showAdvancedFilters ? t('search.hideFilters') : t('search.showFilters')}
          </Button>
        </div>

        {/* Formulário de Busca Principal */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Termo de Busca */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="search-term" className="block text-sm font-medium text-muted-foreground mb-1">
                {t('search.whatAreYouLookingFor')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-term"
                  type="text"
                  placeholder={t('search.modNameDescriptionTags')}
                  value={localFilters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  className="minecraft-input pl-10 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Botão de Busca */}
            <div className="flex items-end">
              <Button 
                type="button" 
                className="minecraft-btn bg-primary text-primary-foreground w-full text-sm sm:text-base"
                disabled={loading}
                onClick={() => updateFilters(localFilters)}
              >
                {loading ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                    className="w-4 h-4 border-b-2 border-white border-t-transparent rounded-full mr-2" 
                  />
                ) : (
                  <Search size={16} className="mr-2" />
                )}
                {t('search.search')}
              </Button>
            </div>
          </div>

          {/* Filtros Avançados */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"
            >
              {/* Versão do Minecraft */}
              <div>
                <label htmlFor="version-filter" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Versão Minecraft
                </label>
                <Select value={localFilters.version} onValueChange={(value) => handleFilterChange('version', value)}>
                  <SelectTrigger id="version-filter" className="minecraft-input text-sm">
                    <SelectValue placeholder="Todas as versões" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect max-h-60">
                    {minecraftVersions.map(version => (
                      <SelectItem key={version} value={version} className="font-minecraft text-xs">
                        {version === 'all' ? 'Todas as Versões' : `Minecraft ${version}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Loader */}
              <div>
                <label htmlFor="loader-filter" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Tipo de Loader
                </label>
                <Select value={localFilters.loader} onValueChange={(value) => handleFilterChange('loader', value)}>
                  <SelectTrigger id="loader-filter" className="minecraft-input text-sm">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    {loaderOptions.map(loader => (
                      <SelectItem key={loader} value={loader} className="font-minecraft text-xs">
                        {loader === 'all' ? 'Todos os Tipos' : loader.charAt(0).toUpperCase() + loader.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="category-filter" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Categoria
                </label>
                <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger id="category-filter" className="minecraft-input text-sm">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect max-h-60">
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat} value={cat} className="font-minecraft text-xs capitalize">
                        {cat === 'all' ? 'Todas as Categorias' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenação */}
              <div>
                <label htmlFor="sort-order" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Ordenar Por
                </label>
                <Select value={localFilters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                  <SelectTrigger id="sort-order" className="minecraft-input text-sm">
                    <SelectValue placeholder="Relevância" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="font-minecraft text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros Adicionais */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label htmlFor="featured-filter" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Destaque
                </label>
                <Select value={localFilters.featured} onValueChange={(value) => handleFilterChange('featured', value)}>
                  <SelectTrigger id="featured-filter" className="minecraft-input text-sm">
                    <SelectValue placeholder="Todos os mods" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    {featuredOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="font-minecraft text-xs">
                        {option.value === 'all' ? 'Todos os Mods' : option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Autor */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label htmlFor="author-filter" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  {t('modDetail.author')}
                </label>
                <Input
                  id="author-filter"
                  type="text"
                  placeholder="Nome do autor..."
                  value={localFilters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  className="minecraft-input text-sm sm:text-base"
                />
              </div>
            </motion.div>
          )}


        </div>
      </motion.section>

      {/* Resultados da Busca */}
      <motion.section variants={itemVariants}>
        {/* Header dos Resultados */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <h2 className="text-xl sm:text-2xl font-minecraft text-foreground">
              {t('search.searchResults')}
            </h2>
            {totalResults > 0 && (
              <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
                {totalResults} mod{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          

          
          {/* Filtros Ativos */}
          {Object.entries(filters).some(([key, value]) => value && value !== 'all') && (
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3">
              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Filtros ativos:</span>
                {filtersLoading && (
                  <div className="flex items-center space-x-1 text-xs text-primary">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                      className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full" 
                    />
                    <span>Aplicando...</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => {
                    if (value && value !== 'all') {
                      // Mapear chaves para nomes mais amigáveis
                      const keyLabels = {
                        'q': 'Busca',
                        'version': 'Versão',
                        'loader': 'Loader',
                        'category': 'Categoria',
                        'sort': 'Ordenação',
                        'featured': 'Destaque',
                        'author': 'Autor'
                      };
                      
                      const displayKey = keyLabels[key] || key;
                      let displayValue = value;
                      
                      // Melhorar a exibição de alguns valores
                      if (key === 'sort') {
                        const sortLabels = {
                          'relevance': 'Relevância',
                          'latest': 'Mais Recentes',
                          'downloads': 'Mais Baixados',
                          'views': 'Mais Visualizados',
                          'name_asc': 'Nome (A-Z)',
                          'name_desc': 'Nome (Z-A)',
                          'popularity': 'Popularidade'
                        };
                        displayValue = sortLabels[value] || value;
                      }
                      
                      return (
                        <Badge 
                          key={key} 
                          variant="secondary"
                          className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 cursor-pointer transition-all duration-200 group"
                          onClick={() => {
                            // Limpar filtro individual
                            const newFilters = { ...filters };
                            if (key === 'sort') {
                              newFilters[key] = 'relevance';
                            } else if (key === 'featured') {
                              newFilters[key] = 'all';
                            } else {
                              newFilters[key] = '';
                            }
                            updateFilters(newFilters);
                          }}
                          title={`Clique para remover o filtro ${displayKey}`}
                        >
                          <span className="mr-1">{displayKey}: {displayValue}</span>
                          <span className="inline-flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/20 text-primary text-xs font-bold group-hover:bg-primary/30 transition-colors">
                            ×
                          </span>
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              
              {/* Botão para limpar todos os filtros */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="px-3 sm:px-4 py-1 sm:py-1.5 h-auto text-xs font-medium border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive/90 transition-all duration-200 shadow-sm w-full sm:w-auto"
              >
                <RotateCcw size={12} className="mr-1 sm:mr-1.5" />
                Limpar Todos
              </Button>
            </div>
          )}
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <motion.div variants={itemVariants} className="text-center py-6 sm:py-10 bg-destructive/10 rounded-lg border border-destructive/20">
            <XCircle size={40} className="mx-auto text-destructive mb-3 sm:mb-4" />
            <p className="text-lg sm:text-xl text-destructive">{t('search.searchError')}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">{error}</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-2 sm:justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="minecraft-btn text-sm sm:text-base w-full sm:w-auto"
              >
                <RotateCcw size={14} className="mr-2" />
                {t('search.tryAgain')}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResetFilters} 
                className="minecraft-btn text-sm sm:text-base w-full sm:w-auto"
              >
                <Filter size={14} className="mr-2" />
                {t('search.clearFilters')}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Resultados */}
        {!error && searchResults.length > 0 ? (
          <>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" variants={containerVariants}>
              {searchResults.map(mod => (
                <ModCard key={mod.id} mod={mod} variants={itemVariants} />
              ))}
            </motion.div>

            {/* Paginação */}
            {totalPages > 1 && (
              <motion.div variants={itemVariants} className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={changePage}
                />
              </motion.div>
            )}

            {/* Dica sobre filtros */}
            {Object.entries(filters).some(([key, value]) => value && value !== 'all') && (
              <motion.div variants={itemVariants} className="mt-8 p-6 bg-muted/20 rounded-lg border border-border/30">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary text-sm">💡</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground mb-1">Como os filtros funcionam</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Os filtros são aplicados em conjunto (AND lógico). Para ver mais resultados, tente remover alguns filtros. 
                      Você pode clicar em qualquer filtro ativo para removê-lo individualmente, ou usar "Limpar Todos" para resetar tudo.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : !loading && !error && searchResults.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-10 bg-card/50 rounded-lg">
            {filters.q ? (
              <>
                <XCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">{t('search.noModsFound')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('search.tryAdjustingSearch')}
                </p>
                {Object.entries(filters).some(([key, value]) => value && value !== 'all') && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleResetFilters} 
                      className="mt-4 minecraft-btn"
                    >
                      <RotateCcw size={16} className="mr-2" />
                      {t('search.clearFilters')}
                    </Button>
                    
                    {/* Dica sobre filtros quando não há resultados */}
                    <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30 max-w-md mx-auto">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary text-xs">💡</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-medium text-foreground mb-1">Dica para encontrar mais resultados</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Muitos filtros ativos podem limitar os resultados. Tente remover alguns filtros para ver mais mods.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <Search size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">{t('search.typeToSearch')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('search.useFiltersAbove')}
                </p>
              </>
            )}
          </motion.div>
        ) : null}
      </motion.section>
    </motion.div>
  );
};

export default SearchResultsPage;
