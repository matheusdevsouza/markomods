import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import ModCard from '@/components/mods/ModCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Flame, 
  Clock, 
  Download, 
  Eye, 
  Star,
  Globe,
  Tag,
  User,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  Package,
  ChevronDown,
  Check
} from 'lucide-react';
import BackgroundEffects from '@/components/mods/BackgroundEffects';

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

const ModsListingPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mods, setMods] = useState([]);
  const [loadingMods, setLoadingMods] = useState(true);
  
  // Estado para contagem de addons
  const [addonsCount, setAddonsCount] = useState(0);
  
  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'grid');
  const [minecraftVersion, setMinecraftVersion] = useState(searchParams.get('version') ? searchParams.get('version').split(',') : ['all']);
  const [modLoader, setModLoader] = useState(searchParams.get('loader') ? searchParams.get('loader').split(',') : ['all']);
  const [category, setCategory] = useState(searchParams.get('category') ? searchParams.get('category').split(',') : ['all']);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    sort: true,
    version: false,
    loader: false,
    category: false
  });

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const modsPerPage = 20;

  // Buscar apenas mods públicos (content_type_id = 1)
  useEffect(() => {
    const fetchPublicMods = async () => {
      try {
        setLoadingMods(true);
        const response = await fetch('/api/mods/public');
        
        if (response.ok) {
          const data = await response.json();
          // Filtrar apenas mods (content_type_id = 1)
          const modsOnly = (data.data || []).filter(mod => mod.content_type_id === 1);
          console.log('📋 ModsListingPage: Mods públicos carregados:', modsOnly.length);
          setMods(modsOnly);
        } else {
          console.error('❌ ModsListingPage: Erro ao buscar mods públicos:', response.status);
          setMods([]);
        }
      } catch (error) {
        console.error('❌ ModsListingPage: Erro na busca:', error);
        setMods([]);
      } finally {
        setLoadingMods(false);
      }
    };

    fetchPublicMods();
  }, []);

  // Buscar contagem de addons
  useEffect(() => {
    const fetchAddonsCount = async () => {
      try {
        const response = await fetch('/api/mods/public');
        
        if (response.ok) {
          const data = await response.json();
          // Filtrar apenas addons (content_type_id = 2)
          const addonsOnly = (data.data || []).filter(addon => addon.content_type_id === 2);
          setAddonsCount(addonsOnly.length);
        } else {
          console.error('❌ ModsListingPage: Erro ao buscar contagem de addons:', response.status);
          setAddonsCount(0);
        }
      } catch (error) {
        console.error('❌ ModsListingPage: Erro na busca de addons:', error);
        setAddonsCount(0);
      }
    };

    fetchAddonsCount();
  }, []);

  // Filtros disponíveis
  const availableVersions = useMemo(() => {
    if (loadingMods) return [];
    const versions = new Set(mods.map(mod => mod.minecraft_version).filter(Boolean));
    return ['all', ...Array.from(versions).sort().reverse()];
  }, [mods, loadingMods]);

  const availableLoaders = useMemo(() => {
    if (loadingMods) return [];
    const loaders = new Set(mods.map(mod => mod.mod_loader).filter(Boolean));
    return ['all', ...Array.from(loaders).sort()];
  }, [mods, loadingMods]);

  const availableCategories = useMemo(() => {
    if (loadingMods) return [];
    const categories = new Set(mods.flatMap(mod => mod.tags || []).filter(Boolean));
    return ['all', ...Array.from(categories).sort()];
  }, [mods, loadingMods]);

  // Aplicar filtros e ordenação
  const filteredAndSortedMods = useMemo(() => {
    if (loadingMods) return [];

    let filtered = [...mods];

    // Não há mais filtro por tipo de conteúdo - todos os mods são mostrados

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(mod =>
        mod.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.full_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por versão do Minecraft
    if (!minecraftVersion.includes('all')) {
      filtered = filtered.filter(mod => minecraftVersion.includes(mod.minecraft_version));
    }

    // Filtro por loader
    if (!modLoader.includes('all')) {
      filtered = filtered.filter(mod => modLoader.includes(mod.mod_loader));
    }

    // Filtro por categoria
    if (!category.includes('all')) {
      filtered = filtered.filter(mod => mod.tags?.some(tag => category.includes(tag)));
    }

    // Ordenação
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        break;
      case 'downloads':
        filtered.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
        break;
      case 'downloads_asc':
        filtered.sort((a, b) => (a.download_count || 0) - (b.download_count || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [mods, loadingMods, searchTerm, minecraftVersion, modLoader, category, sortBy]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedMods.length / modsPerPage);
  const paginatedMods = filteredAndSortedMods.slice(
    (currentPage - 1) * modsPerPage,
    currentPage * modsPerPage
  );

  // Atualizar URL quando filtros mudarem
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (sortBy !== 'recent') params.set('sort', sortBy);
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (!minecraftVersion.includes('all')) params.set('version', minecraftVersion.join(','));
    if (!modLoader.includes('all')) params.set('loader', modLoader.join(','));
    if (!category.includes('all')) params.set('category', category.join(','));
    
    setSearchParams(params);
    setCurrentPage(1); // Reset para primeira página quando filtros mudarem
  }, [searchTerm, sortBy, viewMode, minecraftVersion, modLoader, category, setSearchParams]);

  // Aplicar filtros iniciais baseados na URL
  useEffect(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  // Os mods já foram carregados no useEffect anterior
  // Não há mais abas para filtrar

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('recent');
    setMinecraftVersion(['all']);
    setModLoader(['all']);
    setCategory(['all']);
    setCurrentPage(1);
  };



  if (loadingMods) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" 
        />
      </div>
    );
  }

          return (
    <>
      <BackgroundEffects />
      <motion.div 
        className="min-h-screen bg-background fixed inset-0 overflow-y-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
                <div className="flex w-full h-full pt-32">
           {/* Sidebar de filtros - responsiva */}
           <motion.div variants={itemVariants} className="w-80 flex-shrink-0 flex-col hidden lg:flex">
             <Card className="sticky top-4 ml-4 flex-1 mb-10">
             <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                 <Filter size={20} />
                 <span>{t('modsListing.filters.title')}</span>
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6 flex-1 flex flex-col">
               {/* Filtros expansíveis */}
               <div className="space-y-4">
                 {/* Ordenação */}
                 <div className="border border-border rounded-lg overflow-hidden">
                   <button
                     onClick={() => setExpandedFilters(prev => ({ ...prev, sort: !prev.sort }))}
                     className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors duration-200 flex items-center justify-between"
                   >
                     <div className="flex items-center space-x-2">
                       <ArrowUpDown size={16} className="text-muted-foreground" />
                       <span className="font-medium">{t('modsListing.filters.sortBy.title')}</span>
                     </div>
                     <ChevronDown 
                       size={16} 
                       className={`text-muted-foreground transition-transform duration-200 ${
                         expandedFilters.sort ? 'rotate-180' : ''
                       }`}
                     />
                   </button>
                   {expandedFilters.sort && (
                     <div className="px-4 py-3 bg-background border-t border-border">
                       <div className="space-y-2">
                         <label className="flex items-center space-x-2 cursor-pointer group">
                           <div className="relative">
                             <input
                               type="radio"
                               name="sort"
                               value="recent"
                               checked={sortBy === 'recent'}
                               onChange={(e) => setSortBy(e.target.value)}
                               className="sr-only"
                             />
                             <div className={`w-4 h-4 border-2 rounded-full transition-all duration-200 ${
                               sortBy === 'recent' 
                                 ? 'bg-primary border-primary' 
                                 : 'border-muted-foreground group-hover:border-primary/50'
                             }`}>
                               {sortBy === 'recent' && (
                                 <div className="w-2 h-2 bg-primary-foreground rounded-full m-auto mt-1"></div>
                               )}
                             </div>
                           </div>
                           <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t('modsListing.filters.sortBy.mostRecent')}</span>
                         </label>
                         <label className="flex items-center space-x-2 cursor-pointer group">
                           <div className="relative">
                             <input
                               type="radio"
                               name="sort"
                               value="oldest"
                               checked={sortBy === 'oldest'}
                               onChange={(e) => setSortBy(e.target.value)}
                               className="sr-only"
                             />
                             <div className={`w-4 h-4 border-2 rounded-full transition-all duration-200 ${
                               sortBy === 'oldest' 
                                 ? 'bg-primary border-primary' 
                                 : 'border-muted-foreground group-hover:border-primary/50'
                             }`}>
                               {sortBy === 'oldest' && (
                                 <div className="w-2 h-2 bg-primary-foreground rounded-full m-auto mt-1"></div>
                               )}
                             </div>
                           </div>
                           <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t('modsListing.filters.sortBy.oldest')}</span>
                         </label>
                         <label className="flex items-center space-x-2 cursor-pointer group">
                           <div className="relative">
                             <input
                               type="radio"
                               name="sort"
                               value="downloads"
                               checked={sortBy === 'downloads'}
                               onChange={(e) => setSortBy(e.target.value)}
                               className="sr-only"
                             />
                             <div className={`w-4 h-4 border-2 rounded-full transition-all duration-200 ${
                               sortBy === 'downloads' 
                                 ? 'bg-primary border-primary' 
                                 : 'border-muted-foreground group-hover:border-primary/50'
                             }`}>
                               {sortBy === 'downloads' && (
                                 <div className="w-2 h-2 bg-primary-foreground rounded-full m-auto mt-1"></div>
                               )}
                             </div>
                           </div>
                           <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t('modsListing.filters.sortBy.mostDownloaded')}</span>
                         </label>
                         <label className="flex items-center space-x-2 cursor-pointer group">
                           <div className="relative">
                             <input
                               type="radio"
                               name="sort"
                               value="downloads_asc"
                               checked={sortBy === 'downloads_asc'}
                               onChange={(e) => setSortBy(e.target.value)}
                               className="sr-only"
                             />
                             <div className={`w-4 h-4 border-2 rounded-full transition-all duration-200 ${
                               sortBy === 'downloads_asc' 
                                 ? 'bg-primary border-primary' 
                                 : 'border-muted-foreground group-hover:border-primary/50'
                             }`}>
                               {sortBy === 'downloads_asc' && (
                                 <div className="w-2 h-2 bg-primary-foreground rounded-full m-auto mt-1"></div>
                               )}
                             </div>
                           </div>
                           <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t('modsListing.filters.sortBy.leastDownloaded')}</span>
                         </label>
                       </div>
                                          </div>
                   )}
                 </div>

                 {/* Linha divisória */}
                 <div className="border-t border-border/50 my-4"></div>

                 {/* Versão do Minecraft */}
                 <div className="border border-border rounded-lg overflow-hidden">
                   <button
                     onClick={() => setExpandedFilters(prev => ({ ...prev, version: !prev.version }))}
                     className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors duration-200 flex items-center justify-between"
                   >
                     <div className="flex items-center space-x-2">
                       <Globe size={16} className="text-muted-foreground" />
                       <span className="font-medium">{t('modsListing.filters.gameVersion.title')}</span>
                     </div>
                     <ChevronDown 
                       size={16} 
                       className={`text-muted-foreground transition-transform duration-200 ${
                         expandedFilters.version ? 'rotate-180' : ''
                       }`}
                     />
                   </button>
                   {expandedFilters.version && (
                     <div className="px-4 py-3 bg-background border-t border-border">
                       <div className="space-y-2">
                         <label className="flex items-center space-x-2 cursor-pointer group">
                           <div className="relative">
                             <input
                               type="checkbox"
                               value="all"
                               checked={minecraftVersion.includes('all')}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setMinecraftVersion(['all']);
                                 } else {
                                   setMinecraftVersion([]);
                                 }
                               }}
                               className="sr-only"
                             />
                             <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                               minecraftVersion.includes('all') 
                                 ? 'bg-primary border-primary' 
                                 : 'border-muted-foreground group-hover:border-primary/50'
                             }`}>
                               {minecraftVersion.includes('all') && (
                                 <Check size={12} className="text-primary-foreground m-auto" />
                               )}
                             </div>
                           </div>
                           <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t('modsListing.filters.gameVersion.allVersions')}</span>
                         </label>
                         {availableVersions.slice(1).map(version => (
                           <label key={version} className="flex items-center space-x-2 cursor-pointer group">
                             <div className="relative">
                               <input
                                 type="checkbox"
                                 value={version}
                                 checked={minecraftVersion.includes(version)}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     if (minecraftVersion.includes('all')) {
                                       setMinecraftVersion([version]);
                                     } else {
                                       setMinecraftVersion([...minecraftVersion, version]);
                                     }
                                   } else {
                                     setMinecraftVersion(minecraftVersion.filter(v => v !== version));
                                   }
                                 }}
                                 className="sr-only"
                               />
                               <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                                 minecraftVersion.includes(version) 
                                   ? 'bg-primary border-primary' 
                                   : 'border-muted-foreground group-hover:border-primary/50'
                               }`}>
                                 {minecraftVersion.includes(version) && (
                                   <Check size={12} className="text-primary-foreground m-auto" />
                                 )}
                               </div>
                             </div>
                             <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{version}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Loader do Mod */}
                 <div className="border border-border rounded-lg overflow-hidden">
                   <button
                     onClick={() => setExpandedFilters(prev => ({ ...prev, loader: !prev.loader }))}
                     className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors duration-200 flex items-center justify-between"
                   >
                     <div className="flex items-center space-x-2">
                       <Tag size={16} className="text-muted-foreground" />
                       <span className="font-medium">{t('modsListing.filters.loader.title')}</span>
                     </div>
                     <ChevronDown 
                       size={16} 
                       className={`text-muted-foreground transition-transform duration-200 ${
                         expandedFilters.loader ? 'rotate-180' : ''
                       }`}
                     />
                   </button>
                   {expandedFilters.loader && (
                     <div className="px-4 py-3 bg-background border-t border-border">
                       <div className="space-y-2">
                         <label className="flex items-center space-x-2 cursor-pointer group">
                           <div className="relative">
                             <input
                               type="checkbox"
                               value="all"
                               checked={modLoader.includes('all')}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setModLoader(['all']);
                                 } else {
                                   setModLoader([]);
                                 }
                               }}
                               className="sr-only"
                             />
                             <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                               modLoader.includes('all') 
                                 ? 'bg-primary border-primary' 
                                 : 'border-muted-foreground group-hover:border-primary/50'
                             }`}>
                               {modLoader.includes('all') && (
                                 <Check size={12} className="text-primary-foreground m-auto" />
                               )}
                             </div>
                           </div>
                           <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t('modsListing.filters.loader.allLoaders')}</span>
                         </label>
                         {availableLoaders.slice(1).map(loader => (
                           <label key={loader} className="flex items-center space-x-2 cursor-pointer group">
                             <div className="relative">
                               <input
                                 type="checkbox"
                                 value={loader}
                                 checked={modLoader.includes(loader)}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     if (modLoader.includes('all')) {
                                       setModLoader([loader]);
                                     } else {
                                       setModLoader([...modLoader, loader]);
                                     }
                                   } else {
                                     setModLoader(modLoader.filter(l => l !== loader));
                                   }
                                 }}
                                 className="sr-only"
                               />
                               <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                                 modLoader.includes(loader) 
                                   ? 'bg-primary border-primary' 
                                   : 'border-muted-foreground group-hover:border-primary/50'
                               }`}>
                                 {modLoader.includes(loader) && (
                                   <Check size={12} className="text-primary-foreground m-auto" />
                                 )}
                               </div>
                             </div>
                             <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{loader}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Categoria */}
                 <div className="border border-border rounded-lg overflow-hidden">
                   <button
                     onClick={() => setExpandedFilters(prev => ({ ...prev, category: !prev.category }))}
                     className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors duration-200 flex items-center justify-between"
                   >
                     <div className="flex items-center space-x-2">
                       <Star size={16} className="text-muted-foreground" />
                       <span className="font-medium">{t('modsListing.filters.categories.title')}</span>
                     </div>
                     <ChevronDown 
                       size={16} 
                       className={`text-muted-foreground transition-transform duration-200 ${
                         expandedFilters.category ? 'rotate-180' : ''
                       }`}
                     />
                   </button>
                   {expandedFilters.category && (
                     <div className="px-4 py-3 bg-background border-t border-border">
                       <div className="space-y-2">
                         <label className="flex items-center space-x-2 cursor-pointer group">
                           <div className="relative">
                             <input
                               type="checkbox"
                               value="all"
                               checked={category.includes('all')}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setCategory(['all']);
                                 } else {
                                   setCategory([]);
                                 }
                               }}
                               className="sr-only"
                             />
                             <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                               category.includes('all') 
                                 ? 'bg-primary border-primary' 
                                 : 'border-muted-foreground group-hover:border-primary/50'
                             }`}>
                               {category.includes('all') && (
                                 <Check size={12} className="text-primary-foreground m-auto" />
                               )}
                             </div>
                           </div>
                           <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t('modsListing.filters.categories.allCategories')}</span>
                         </label>
                         {availableCategories.slice(1).map(cat => (
                           <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                             <div className="relative">
                               <input
                                 type="checkbox"
                                 value={cat}
                                 checked={category.includes(cat)}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     if (category.includes('all')) {
                                       setCategory([cat]);
                                     } else {
                                       setCategory([...category, cat]);
                                     }
                                   } else {
                                     setCategory(category.filter(c => c !== cat));
                                   }
                                 }}
                                 className="sr-only"
                               />
                               <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                                 category.includes(cat) 
                                   ? 'bg-primary border-primary' 
                                   : 'border-muted-foreground group-hover:border-primary/50'
                               }`}>
                                 {category.includes(cat) && (
                                   <Check size={12} className="text-primary-foreground m-auto" />
                                 )}
                               </div>
                             </div>
                             <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{cat}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               </div>

               {/* Botão limpar filtros - sempre no final */}
               <div className="mt-auto pt-4 border-t border-border/50">
                 <Button 
                   variant="outline" 
                   onClick={clearFilters}
                   className="w-full flex items-center justify-center space-x-2"
                 >
                   <RotateCcw size={16} />
                   <span>{t('modsListing.filters.clearFilters')}</span>
                 </Button>
               </div>
             </CardContent>
           </Card>
         </motion.div>

         {/* Área principal com header e mods */}
         <motion.div variants={itemVariants} className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8">
           {/* Header da página */}
           <div className="mb-8">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
               <div>
                 <h1 className="text-2xl sm:text-3xl lg:text-4xl font-minecraft text-primary mb-2">
                   {t('modsListing.title.mods')}
                 </h1>
                 <p className="text-sm sm:text-base text-muted-foreground">
                   {t('modsListing.results.count', { count: filteredAndSortedMods.length })}
                 </p>
               </div>
               
               {/* Controles de visualização */}
               <div className="flex items-center space-x-2">
                 {/* Botão de filtros para mobile */}
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setShowFilters(!showFilters)}
                   className="lg:hidden flex items-center space-x-2 h-8 sm:h-9"
                 >
                   <Filter size={14} className="sm:w-4 sm:h-4" />
                   <span className="hidden sm:inline">Filtros</span>
                 </Button>
                 
                 <Button
                   variant={viewMode === 'grid' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setViewMode('grid')}
                   className="flex items-center space-x-2 h-8 sm:h-9"
                 >
                   <Grid3X3 size={14} className="sm:w-4 sm:h-4" />
                   <span className="hidden sm:inline">{t('modsListing.viewOptions.grid')}</span>
                 </Button>
                 <Button
                   variant={viewMode === 'list' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setViewMode('list')}
                   className="flex items-center space-x-2 h-8 sm:h-9"
                 >
                   <List size={14} className="sm:w-4 sm:h-4" />
                   <span className="hidden sm:inline">{t('modsListing.viewOptions.list')}</span>
                 </Button>
               </div>
             </div>

             {/* Barra de busca */}
             <div className="relative w-full sm:w-80 mb-6">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
               <Input
                 placeholder={t('modsListing.search.placeholder')}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-2 sm:py-3 text-base sm:text-lg"
               />
             </div>

             {/* Navegação entre Mods e Addons */}
            <div className="mb-6">
              <div className="inline-flex space-x-1 bg-muted/30 rounded-lg p-1 w-full sm:w-auto">
                <div className="px-3 sm:px-6 py-2 rounded-md text-sm font-medium bg-primary text-white shadow-sm flex-1 sm:flex-none">
                  <div className="flex items-center justify-center space-x-2">
                    <Package size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{t('modsListing.navigation.mods')}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {mods.length}
                    </Badge>
                  </div>
                </div>
                <Link
                  to="/addons"
                  className="px-3 sm:px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50 flex-1 sm:flex-none"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Package size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{t('modsListing.navigation.addons')}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {addonsCount}
                    </Badge>
                  </div>
                </Link>
              </div>
            </div>
           </div>
          {paginatedMods.length > 0 ? (
            <>
                             {/* Grid/Lista de mods */}
               <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 max-w-none" 
                 : "space-y-3 sm:space-y-4"
               }>
                {paginatedMods.map((mod) => (
                  <ModCard 
                    key={mod.id} 
                    mod={mod} 
                    variants={itemVariants}
                    compact={viewMode === 'list'}
                    imageSize="stretched"
                  />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <motion.div variants={itemVariants} className="mt-6 sm:mt-8 flex justify-center">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">{t('modsListing.pagination.previous')}</span>
                      <span className="sm:hidden">‹</span>
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">{t('modsListing.pagination.next')}</span>
                      <span className="sm:hidden">›</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div variants={itemVariants} className="text-center py-16">
              <div className="text-muted-foreground mb-4">
                <Search size={64} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">{t('modsListing.empty.title')}</h3>
                <p className="text-muted-foreground">
                  {t('modsListing.empty.description')}
                </p>
              </div>
              <Button onClick={clearFilters} variant="outline">
                {t('modsListing.filters.clearFilters')}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal de Filtros para Mobile */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 bottom-0 bg-background border-r border-border shadow-xl overflow-y-auto">
            <div className="p-4 pb-20">
              {/* Header do modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <Filter size={20} />
                  <span>{t('modsListing.filters.title')}</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

                {/* Filtros móveis */}
                <div className="space-y-3">
                {/* Ordenação */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFilters(prev => ({ ...prev, sort: !prev.sort }))}
                    className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors duration-200 flex items-center justify-between touch-manipulation"
                  >
                    <div className="flex items-center space-x-2">
                      <ArrowUpDown size={16} className="text-muted-foreground" />
                      <span className="font-medium">{t('modsListing.filters.sortBy.title')}</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-muted-foreground transition-transform duration-200 ${
                        expandedFilters.sort ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFilters.sort && (
                    <div className="px-4 py-3 bg-background border-t border-border">
                      <div className="space-y-2">
                        {[
                          { value: 'recent', label: t('modsListing.filters.sortBy.mostRecent'), icon: Clock },
                          { value: 'oldest', label: t('modsListing.filters.sortBy.oldest'), icon: Clock },
                          { value: 'downloads', label: t('modsListing.filters.sortBy.mostDownloaded'), icon: Download },
                          { value: 'downloads_asc', label: t('modsListing.filters.sortBy.leastDownloaded'), icon: Download }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer group touch-manipulation py-2">
                            <div className="relative">
                              <input
                                type="radio"
                                name="sortBy"
                                value={option.value}
                                checked={sortBy === option.value}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                sortBy === option.value 
                                  ? 'border-primary bg-primary' 
                                  : 'border-muted-foreground/30 group-hover:border-primary/50'
                              }`}>
                                {sortBy === option.value && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </div>
                            <option.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm group-hover:text-primary transition-colors">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Versão do Minecraft */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFilters(prev => ({ ...prev, version: !prev.version }))}
                    className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors duration-200 flex items-center justify-between touch-manipulation"
                  >
                    <div className="flex items-center space-x-2">
                      <Globe size={16} className="text-muted-foreground" />
                      <span className="font-medium">{t('modsListing.filters.gameVersion.title')}</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-muted-foreground transition-transform duration-200 ${
                        expandedFilters.version ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFilters.version && (
                    <div className="px-4 py-3 bg-background border-t border-border">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableVersions.map((version) => (
                          <label key={version} className="flex items-center space-x-3 cursor-pointer group touch-manipulation py-2">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={minecraftVersion.includes(version)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setMinecraftVersion(prev => [...prev.filter(v => v !== 'all'), version]);
                                  } else {
                                    setMinecraftVersion(prev => prev.filter(v => v !== version));
                                  }
                                }}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                minecraftVersion.includes(version)
                                  ? 'border-primary bg-primary'
                                  : 'border-muted-foreground/30 group-hover:border-primary/50'
                              }`}>
                                {minecraftVersion.includes(version) && <Check size={12} className="text-white" />}
                              </div>
                            </div>
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {version === 'all' ? t('modsListing.filters.gameVersion.allVersions') : version}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Loader do Mod */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFilters(prev => ({ ...prev, loader: !prev.loader }))}
                    className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors duration-200 flex items-center justify-between touch-manipulation"
                  >
                    <div className="flex items-center space-x-2">
                      <Tag size={16} className="text-muted-foreground" />
                      <span className="font-medium">{t('modsListing.filters.loader.title')}</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-muted-foreground transition-transform duration-200 ${
                        expandedFilters.loader ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFilters.loader && (
                    <div className="px-4 py-3 bg-background border-t border-border">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableLoaders.map((loader) => (
                          <label key={loader} className="flex items-center space-x-3 cursor-pointer group touch-manipulation py-2">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={modLoader.includes(loader)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setModLoader(prev => [...prev.filter(l => l !== 'all'), loader]);
                                  } else {
                                    setModLoader(prev => prev.filter(l => l !== loader));
                                  }
                                }}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                modLoader.includes(loader)
                                  ? 'border-primary bg-primary'
                                  : 'border-muted-foreground/30 group-hover:border-primary/50'
                              }`}>
                                {modLoader.includes(loader) && <Check size={12} className="text-white" />}
                              </div>
                            </div>
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {loader === 'all' ? t('modsListing.filters.loader.allLoaders') : loader}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Categoria */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFilters(prev => ({ ...prev, category: !prev.category }))}
                    className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors duration-200 flex items-center justify-between touch-manipulation"
                  >
                    <div className="flex items-center space-x-2">
                      <Star size={16} className="text-muted-foreground" />
                      <span className="font-medium">{t('modsListing.filters.categories.title')}</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-muted-foreground transition-transform duration-200 ${
                        expandedFilters.category ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFilters.category && (
                    <div className="px-4 py-3 bg-background border-t border-border">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableCategories.map((cat) => (
                          <label key={cat} className="flex items-center space-x-3 cursor-pointer group touch-manipulation py-2">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={category.includes(cat)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCategory(prev => [...prev.filter(c => c !== 'all'), cat]);
                                  } else {
                                    setCategory(prev => prev.filter(c => c !== cat));
                                  }
                                }}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                category.includes(cat)
                                  ? 'border-primary bg-primary'
                                  : 'border-muted-foreground/30 group-hover:border-primary/50'
                              }`}>
                                {category.includes(cat) && <Check size={12} className="text-white" />}
                              </div>
                            </div>
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {cat === 'all' ? t('modsListing.filters.categories.allCategories') : cat}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões de ação fixos */}
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 space-y-3">
                  <Button 
                    onClick={() => setShowFilters(false)}
                    className="w-full h-12 text-base font-medium"
                  >
                    Aplicar Filtros
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center space-x-2 h-10 text-sm"
                  >
                    <RotateCcw size={16} />
                    <span>{t('modsListing.filters.clearFilters')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
    </>
  );
};

export default ModsListingPage;
