
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ModCard from '@/components/mods/ModCard';
import { Button } from '@/components/ui/button';
import PaginationControls from '@/components/ui/PaginationControls';
import { Flame, ArrowRight, History, DownloadCloud, Package } from 'lucide-react';
import { buildThumbnailUrl } from '@/utils/urls';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContextMods';
import EditableBanner from '@/components/admin/EditableBanner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const SectionTitle = ({ title, icon: Icon, viewAllLink }) => {
  const { t } = useTranslation();
  
  return (
    <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-minecraft text-primary flex items-center">
        {Icon && <Icon size={28} className="mr-3 text-accent" />}
        {title}
      </h2>
      {viewAllLink && (
        <Button variant="link" asChild className="text-primary hover:underline font-minecraft text-sm">
          <Link to={viewAllLink}>{t('home.viewAll')} <ArrowRight size={16} className="ml-1" /></Link>
        </Button>
      )}
    </motion.div>
  );
};

const AdPlaceholder = ({ isAdmin, hasAd }) => {
  const { t } = useTranslation();
  
  // Se não for admin, mostra espaço invisível grande
  if (!isAdmin) {
    return (
      <div className="my-16" aria-hidden="true"></div>
    );
  }
  
  // Se for admin mas não há anúncio, mostra placeholder pequeno
  if (!hasAd) {
    return (
      <motion.div 
        variants={itemVariants}
        className="my-8 p-3 bg-card/30 border border-dashed border-muted-foreground/30 rounded-lg text-center text-muted-foreground/60"
      >
        <p className="font-minecraft text-xs">{t('home.adAreaEmpty')}</p>
        <p className="text-xs opacity-60">{t('home.addAdToSeparateSections')}</p>
      </motion.div>
    );
  }
  
  // Se há anúncio, mostra normalmente
  return (
    <motion.div 
      variants={itemVariants}
      className="my-8 p-4 bg-card/50 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground"
    >
      <p className="font-minecraft text-sm">{t('home.adArea')}</p>
      <p className="text-xs">{t('home.googleAdsOrSponsor')}</p>
      <div className="mt-2 aspect-video bg-muted/30 max-w-xs mx-auto flex items-center justify-center">
        <span className="text-xs">728x90 ou 300x250</span>
      </div>
    </motion.div>
  );
};

const ModsCarousel = ({ mods }) => {
  const { t } = useTranslation();
  
  // Basic placeholder for carousel - a real carousel would need a library or more complex logic
  if (!mods || mods.length === 0) return null;
  const featuredMod = mods[0]; // Just show the first "featured" mod

  return (
    <motion.div 
      variants={itemVariants} 
      className="relative rounded-lg overflow-hidden shadow-2xl mb-12 border-2 border-primary/30 group"
    >
              <img 
          src={featuredMod.gallery_urls?.[0] || buildThumbnailUrl(featuredMod.thumbnail_url) || '/placeholder-images/default-gallery-1.jpg'}
          alt={`Banner para ${featuredMod.name}`}
          className="w-full h-64 md:h-96 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
        <span className="block font-minecraft text-xs text-accent mb-1">{t('home.modOfTheWeek')}</span>
        <h1 className="text-3xl md:text-5xl font-minecraft mb-2 md:mb-4 line-clamp-2">{featuredMod.name}</h1>
        <p className="text-sm md:text-base text-gray-300 line-clamp-2 mb-4 md:mb-6 max-w-xl">{featuredMod.short_description}</p>
        <Button size="lg" asChild className="minecraft-btn bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link to={`/mod/${featuredMod.id}`}>
            <DownloadCloud size={20} className="mr-2" /> {t('home.viewMod')}
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};


const HomePage = () => {
  const [mods, setMods] = useState([]);
  const [loadingMods, setLoadingMods] = useState(true);
  const [latestModsPage, setLatestModsPage] = useState(1);
  const [popularModsPage, setPopularModsPage] = useState(1);
  const [bannerUrl, setBannerUrl] = useState('/src/assets/images/markomods-banner.png');
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  
  // Simular verificação de admin (em produção, isso viria do contexto de autenticação)
  const isAdmin = false; // Mude para true para testar como admin
  const hasAd = false; // Mude para true para simular anúncio ativo

  // Buscar apenas mods públicos (não rascunhos)
  useEffect(() => {
    const fetchPublicMods = async () => {
      try {
        setLoadingMods(true);
        const response = await fetch('/api/mods/public');
        
        if (response.ok) {
          const data = await response.json();
          setMods(data.data || []);
        } else {
          setMods([]);
        }
      } catch (error) {
        setMods([]);
      } finally {
        setLoadingMods(false);
      }
    };

    fetchPublicMods();
  }, []);

  // Carregar configuração do banner
  useEffect(() => {
    const fetchBannerConfig = async () => {
      try {
        const response = await fetch('/api/admin/banner/public-config');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.banner_url) {
            setBannerUrl(data.banner_url);
          }
        }
      } catch (error) {
        // Em caso de erro, manter a URL padrão
      }
    };

    fetchBannerConfig();
  }, []);

  if (loadingMods) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  const featuredMods = mods.filter(mod => mod.is_featured).slice(0, 1); // For carousel
  
  // Últimos mods com paginação
  const allLatestMods = [...mods].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const modsPerPage = 4;
  const totalLatestPages = Math.ceil(allLatestMods.length / modsPerPage);
  const latestMods = allLatestMods.slice((latestModsPage - 1) * modsPerPage, latestModsPage * modsPerPage);
  
  // Mods mais baixados com paginação
  const allPopularMods = [...mods].sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
  const totalPopularPages = Math.ceil(allPopularMods.length / modsPerPage);
  const mostDownloadedMods = allPopularMods.slice((popularModsPage - 1) * modsPerPage, popularModsPage * modsPerPage);

  const totalDownloadsAllMods = mods.reduce((sum, mod) => sum + (mod.download_count || 0), 0);

  // Função para lidar com mudanças de página
  const handleLatestModsPageChange = (newPage) => {
    setLatestModsPage(newPage);
  };

  const handlePopularModsPageChange = (newPage) => {
    setPopularModsPage(newPage);
  };

  const handleBannerUpdate = (newBannerUrl) => {
    setBannerUrl(newBannerUrl);
  };

  return (
    <motion.div 
      className="space-y-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ModsCarousel mods={featuredMods} />

      {/* Banner da Plataforma */}
      <EditableBanner
        bannerUrl={bannerUrl}
        onBannerUpdate={handleBannerUpdate}
        className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-primary/30 group bg-gradient-to-r from-primary/5 to-purple-600/5"
      >
        <motion.div variants={itemVariants}>
          <img 
            src={bannerUrl} 
            alt="Banner da Plataforma Eu Marko Mods"
            className="w-full h-32 md:h-48 lg:h-56 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-purple-600/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-4 right-4">
            <div className="bg-primary/20 backdrop-blur-sm rounded-full px-3 py-1 border border-primary/30">
              <span className="text-xs font-semibold text-white flex items-center gap-1">
                <Package size={12} />
                MODS
              </span>
            </div>
          </div>
        </motion.div>
      </EditableBanner>

      <motion.div variants={itemVariants} className="text-center p-6 bg-card/70 rounded-lg shadow-md border border-border">
        <h3 className="font-minecraft text-2xl text-primary mb-2">{t('home.totalDownloadsOnPlatform')}</h3>
        <p className="text-5xl font-bold text-accent animate-pulse">{totalDownloadsAllMods.toLocaleString('pt-BR')}</p>
      </motion.div>

      <section>
        <SectionTitle title={t('home.latestModsAdded')} icon={History} viewAllLink="/mods?sort=recent" />
        {latestMods.length > 0 ? (
          <>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" variants={containerVariants}>
              {latestMods.map((mod) => <ModCard key={mod.id} mod={mod} variants={itemVariants} imageSize="stretched" />)}
            </motion.div>
            
            {/* Navegação por páginas - só aparece se houver mais de 4 mods */}
            {allLatestMods.length > 4 && (
              <motion.div 
                variants={itemVariants} 
                className="mt-8"
              >
                <PaginationControls
                  currentPage={latestModsPage}
                  totalPages={totalLatestPages}
                  onPageChange={handleLatestModsPageChange}
                  showPageNumbers={true}
                />
              </motion.div>
            )}
          </>
        ) : (
          <motion.p variants={itemVariants} className="text-muted-foreground text-center py-4">{t('home.noRecentModsFound')}</motion.p>
        )}
      </section>

      <AdPlaceholder isAdmin={isAdmin} hasAd={hasAd} />

      <section>
        <SectionTitle title={t('home.mostDownloadedMods')} icon={Flame} viewAllLink="/mods?sort=downloads" />
         {mostDownloadedMods.length > 0 ? (
          <>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" variants={containerVariants}>
              {mostDownloadedMods.map((mod) => <ModCard key={mod.id} mod={mod} variants={itemVariants} imageSize="stretched" />)}
            </motion.div>
            
            {/* Navegação por páginas - só aparece se houver mais de 4 mods */}
            {allPopularMods.length > 4 && (
              <motion.div 
                variants={itemVariants} 
                className="mt-8"
              >
                <PaginationControls
                  currentPage={popularModsPage}
                  totalPages={totalPopularPages}
                  onPageChange={handlePopularModsPageChange}
                  showPageNumbers={true}
                />
              </motion.div>
            )}
          </>
        ) : (
          <motion.p variants={itemVariants} className="text-muted-foreground text-center py-4">{t('home.noPopularModsFound')}</motion.p>
        )}
      </section>
    </motion.div>
  );
};

export default HomePage;
