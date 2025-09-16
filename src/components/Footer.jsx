import React from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Gamepad2, 
  Download, 
  Shield, 
  Mail, 
  ArrowUp,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = React.memo(() => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <motion.footer 
      className="w-full min-w-full bg-gradient-to-br from-background via-background to-muted/20 border-t border-border/50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Conteúdo Principal */}
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 md:py-12">
        {/* Layout Mobile: Seção Sobre centralizada + outras seções com background */}
        <div className="md:hidden">
          {/* Seção Sobre - Centralizada */}
          <div className="flex justify-center mb-6">
            <div className="space-y-3 max-w-xs text-center">
              <div className="flex items-center justify-center space-x-2">
                <h3 className="text-base font-minecraft text-primary">{t('footer.brandName')}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('footer.brandDescription')}
              </p>
              <div className="flex justify-center space-x-2">
                <a href="https://www.youtube.com/@eumarko" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 p-0 hover:bg-red-500/20 group transition-all duration-300 rounded-md touch-manipulation">
                  <i className="fab fa-youtube text-lg text-muted-foreground group-hover:text-red-500 group-hover:scale-110 transition-all duration-300"></i>
                </a>
                <a href="https://www.tiktok.com/@eumarko_" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 p-0 hover:bg-pink-500/20 group transition-all duration-300 rounded-md touch-manipulation">
                  <i className="fab fa-tiktok text-lg text-muted-foreground group-hover:text-pink-500 group-hover:scale-110 transition-all duration-300"></i>
                </a>
                <a href="https://www.instagram.com/eumarko.ofc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 p-0 hover:bg-purple-500/20 group transition-all duration-300 rounded-md touch-manipulation">
                  <i className="fab fa-instagram text-lg text-muted-foreground group-hover:text-purple-500 group-hover:scale-110 transition-all duration-300"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Outras seções com background conjunto */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Links Rápidos */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">{t('footer.quickLinks')}</h3>
                <ul className="space-y-1.5">
                  <li>
                    <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.home')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/mods" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <Gamepad2 className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.exploreMods')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/favorites" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <Heart className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.favorites')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/downloads" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <Download className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.downloads')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">Redes Sociais</h3>
                <ul className="space-y-1.5">
                  <li>
                    <a href="https://www.youtube.com/@eumarko" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-red-500 transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <i className="fab fa-youtube h-3 w-3 mr-2 flex-shrink-0"></i>
                      YouTube
                    </a>
                  </li>
                  <li>
                    <a href="https://www.tiktok.com/@eumarko_" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-pink-500 transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <i className="fab fa-tiktok h-3 w-3 mr-2 flex-shrink-0"></i>
                      TikTok
                    </a>
                  </li>
                  <li>
                    <a href="https://www.instagram.com/eumarko.ofc" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-purple-500 transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <i className="fab fa-instagram h-3 w-3 mr-2 flex-shrink-0"></i>
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a href="https://eumarko.com/pt" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <i className="fas fa-globe h-3 w-3 mr-2 flex-shrink-0"></i>
                      Site Oficial
                    </a>
                  </li>
                </ul>
              </div>

              {/* Suporte */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">{t('footer.support')}</h3>
                <ul className="space-y-1.5">
                  <li>
                    <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.contact')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <Shield className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.faq')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Desktop: Grid tradicional */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-8 lg:gap-12 xl:gap-16 2xl:gap-20">
          
          {/* Seção 1: Sobre */}
          <div className="space-y-4 max-w-xs text-left">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-minecraft text-primary">{t('footer.brandName')}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.brandDescription')}
            </p>
            <div className="flex space-x-3">
              <a href="https://www.youtube.com/@eumarko" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-red-500/20 group transition-all duration-300 rounded-md">
                <i className="fab fa-youtube text-lg text-muted-foreground group-hover:text-red-500 group-hover:scale-110 transition-all duration-300"></i>
              </a>
              <a href="https://www.tiktok.com/@eumarko_" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-pink-500/20 group transition-all duration-300 rounded-md">
                <i className="fab fa-tiktok text-lg text-muted-foreground group-hover:text-pink-500 group-hover:scale-110 transition-all duration-300"></i>
              </a>
              <a href="https://www.instagram.com/eumarko.ofc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-purple-500/20 group transition-all duration-300 rounded-md">
                <i className="fab fa-instagram text-lg text-muted-foreground group-hover:text-purple-500 group-hover:scale-110 transition-all duration-300"></i>
              </a>
            </div>
          </div>

          {/* Seção 2: Links Rápidos */}
          <div className="space-y-4 max-w-xs">
            <h3 className="text-lg font-semibold text-foreground">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link to="/mods" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Gamepad2 className="h-3 w-3 mr-2" />
                  {t('footer.exploreMods')}
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Heart className="h-3 w-3 mr-2" />
                  {t('footer.favorites')}
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Download className="h-3 w-3 mr-2" />
                  {t('footer.downloads')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Seção 3: Redes Sociais */}
          <div className="space-y-4 max-w-xs">
            <h3 className="text-lg font-semibold text-foreground">Redes Sociais</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.youtube.com/@eumarko" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-red-500 transition-colors duration-200 flex items-center">
                  <i className="fab fa-youtube h-3 w-3 mr-2"></i>
                  YouTube
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@eumarko_" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-pink-500 transition-colors duration-200 flex items-center">
                  <i className="fab fa-tiktok h-3 w-3 mr-2"></i>
                  TikTok
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/eumarko.ofc" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-purple-500 transition-colors duration-200 flex items-center">
                  <i className="fab fa-instagram h-3 w-3 mr-2"></i>
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://eumarko.com/pt" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <i className="fas fa-globe h-3 w-3 mr-2"></i>
                  Site Oficial
                </a>
              </li>
            </ul>
          </div>

          {/* Seção 4: Suporte */}
          <div className="space-y-4 max-w-xs">
            <h3 className="text-lg font-semibold text-foreground">{t('footer.support')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Mail className="h-3 w-3 mr-2" />
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Shield className="h-3 w-3 mr-2" />
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <Separator className="w-full bg-border/50" />
        
        {/* Seção Inferior */}
        <div className="py-4 md:py-6 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span className="text-xs md:text-sm text-muted-foreground text-center sm:text-left">© {year} {t('footer.allRightsReserved')}</span>
          </div>

          {/* Botão Voltar ao Topo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="h-9 md:h-8 px-3 md:px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 touch-manipulation"
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            <span className="text-xs md:text-sm">{t('footer.backToTop')}</span>
          </Button>
        </div>
      </div>
    </motion.footer>
  );
});

export default Footer;
