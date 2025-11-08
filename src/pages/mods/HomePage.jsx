
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ModCard from '@/components/mods/ModCard';
import { Button } from '@/components/ui/button';
import PaginationControls from '@/components/ui/PaginationControls';
import { Flame, ArrowRight, History, DownloadCloud, Package, Eye } from 'lucide-react';
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
    <motion.div variants={itemVariants} className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
      <h2 className="text-xl sm:text-3xl font-minecraft text-primary flex items-center flex-1 min-w-0">
        {Icon && <Icon className="h-5 w-5 sm:h-7 sm:w-7 mr-2 sm:mr-3 text-accent flex-shrink-0" />}
        <span className="break-words leading-tight">{title}</span>
      </h2>
      {viewAllLink && (
        <Button variant="link" asChild className="text-primary hover:text-primary/80 hover:underline font-minecraft text-xs sm:text-base flex-shrink-0 h-auto p-0 hover:bg-transparent whitespace-nowrap">
          <Link to={viewAllLink} className="flex items-center gap-1 sm:gap-2">
            <span className="whitespace-nowrap">{t('home.viewAll')}</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          </Link>
        </Button>
      )}
    </motion.div>
  );
};

const ModsCarousel = ({ mods }) => {
  const { t } = useTranslation();
  
  if (!mods || mods.length === 0) return null;
  const featuredMod = mods[0]; 

  return (
    <motion.div 
      variants={itemVariants} 
      className="relative rounded-lg overflow-hidden shadow-2xl mb-12 border-2 border-primary/30 group"
    >
              <img 
          src={featuredMod.gallery_urls?.[0] || buildThumbnailUrl(featuredMod.thumbnail_url) || '/placeholder-images/default-gallery-1.jpg'}
          alt={`Banner para ${featuredMod.name}`}
          className="w-full h-48 md:h-64 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60" />
      <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
        <div className="inline-flex items-center bg-primary/20 backdrop-blur-sm rounded-full px-3 py-1 border border-primary/30 mb-4">
          <span className="text-xs font-semibold text-white uppercase tracking-wide">{t('home.modOfTheWeek')}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-minecraft mb-2 md:mb-4 line-clamp-2">{featuredMod.name}</h1>
        <p className="text-sm md:text-base text-gray-300 line-clamp-2 mb-4 md:mb-6 max-w-xl">{featuredMod.short_description}</p>
        <Button asChild className="minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 h-10 shadow-lg shadow-primary/25">
          <Link to={`/mods/${featuredMod.slug}`}>
            <Eye size={16} className="mr-2" /> 
            <span className="text-sm font-medium">{t('home.viewMod')}</span>
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
  const [bannerLink, setBannerLink] = useState(null);
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  
  const isAdmin = false; 
  const hasAd = false; 

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

  useEffect(() => {
    const fetchBannerConfig = async () => {
      try {
        const response = await fetch('/api/admin/banner/public-config');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (data.banner_url) {
            setBannerUrl(data.banner_url);
            }
            setBannerLink(data.banner_link || null);
          }
        }
      } catch (error) {
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
  
  const featuredMods = mods.filter(mod => mod.is_featured).slice(0, 1);
  
  const allLatestMods = [...mods].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const modsPerPage = 4;
  const totalLatestPages = Math.ceil(allLatestMods.length / modsPerPage);
  const latestMods = allLatestMods.slice((latestModsPage - 1) * modsPerPage, latestModsPage * modsPerPage);
  
  const allPopularMods = [...mods].sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
  const totalPopularPages = Math.ceil(allPopularMods.length / modsPerPage);
  const mostDownloadedMods = allPopularMods.slice((popularModsPage - 1) * modsPerPage, popularModsPage * modsPerPage);

  const totalDownloadsAllMods = mods.reduce((sum, mod) => sum + (mod.download_count || 0), 0);

  const handleLatestModsPageChange = (newPage) => {
    setLatestModsPage(newPage);
  };

  const handlePopularModsPageChange = (newPage) => {
    setPopularModsPage(newPage);
  };

  const handleBannerUpdate = (newBannerUrl, newBannerLink) => {
    setBannerUrl(newBannerUrl);
    setBannerLink(newBannerLink);
  };

  return (
    <motion.div 
      className="space-y-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <EditableBanner
        bannerUrl={bannerUrl}
        bannerLink={bannerLink}
        onBannerUpdate={handleBannerUpdate}
        className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-primary/30 group bg-gradient-to-r from-primary/5 to-purple-600/5"
      >
        {bannerLink ? (
          <a 
            href={bannerLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <motion.div variants={itemVariants} className="cursor-pointer">
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
          </a>
        ) : (
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
        )}
      </EditableBanner>

      <motion.div variants={itemVariants} className="text-center p-6 bg-card/70 rounded-lg shadow-md border border-border">
        <h3 className="font-minecraft text-2xl text-primary mb-2">{t('home.totalDownloadsOnPlatform')}</h3>
        <p className="text-5xl font-bold text-accent animate-pulse">{totalDownloadsAllMods.toLocaleString('pt-BR')}</p>
      </motion.div>

      <ModsCarousel mods={featuredMods} />

      <section>
        <SectionTitle title={t('home.latestModsAdded')} icon={History} viewAllLink="/mods?sort=recent" />
        {latestMods.length > 0 ? (
          <>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" variants={containerVariants}>
              {latestMods.map((mod) => <ModCard key={mod.id} mod={mod} variants={itemVariants} />)}
            </motion.div>
            
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

      <section>
        <SectionTitle title={t('home.mostDownloadedMods')} icon={Flame} viewAllLink="/mods?sort=downloads" />
         {mostDownloadedMods.length > 0 ? (
          <>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" variants={containerVariants}>
              {mostDownloadedMods.map((mod) => <ModCard key={mod.id} mod={mod} variants={itemVariants} />)}
            </motion.div>
            
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
