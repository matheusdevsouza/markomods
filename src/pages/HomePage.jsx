import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const HomePage = ({ mods }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.header 
        className="text-center py-8 rounded-lg bg-card/50 backdrop-blur-sm shadow-xl border border-border"
        variants={itemVariants}
      >
        <h1 className="text-5xl font-bold mb-4 gradient-text-minecraft">{t('home.hero.title')}</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          {t('home.hero.subtitle')}
        </p>
      </motion.header>

      {mods.length === 0 ? (
        <motion.div className="text-center py-10 minecraft-card p-6 rounded-lg" variants={itemVariants}>
          <img  src="/assets/empty-chest.png" alt="Baú vazio" className="mx-auto mb-4 h-32 w-32" src="https://images.unsplash.com/photo-1697499863209-3dddfd582283" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">{t('home.noModsFound')}</h2>
          <p className="text-muted-foreground">{t('home.noModsMessage')}</p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {mods.map((mod) => (
            <motion.div key={mod.id} variants={itemVariants}>
              <Card className="minecraft-card h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/30 hover:border-primary/50 group">
                <div className="relative h-48 w-full overflow-hidden">
                  <img  src={mod.thumbnailUrl} alt={mod.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" src="https://images.unsplash.com/photo-1543882501-9251a94dc7c3" />
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-gray-200">{mod.minecraftVersion}</div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-bold text-primary line-clamp-1">{mod.name}</CardTitle>
                  <CardDescription className="text-muted-foreground line-clamp-2 h-12">{mod.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('home.author')} <span className="text-foreground/90">{mod.author}</span></p>
                    <p className="text-sm text-muted-foreground mb-3">{t('home.published')} <span className="text-foreground/90">{new Date(mod.uploadDate).toLocaleDateString()}</span></p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mod.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto">
                    <Link to={`/mod/${mod.id}`} className="flex-1">
                      <Button variant="outline" className="w-full minecraft-btn border-primary text-primary hover:bg-primary/20">
                        <Eye size={16} className="mr-2" /> <span className="action-button-text">{t('home.viewDetails')}</span>
                      </Button>
                    </Link>
                    <a href={mod.downloadUrl} download className="flex-1">
                       <Button className="w-full minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Download size={16} className="mr-2" /> <span className="action-button-text">{t('home.download')}</span>
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomePage;