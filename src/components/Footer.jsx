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
  ExternalLink,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
const Footer = React.memo(() => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0 });
  };
  
  return (
    <motion.footer 
      className="w-full min-w-full bg-gradient-to-br from-background via-background to-muted/20 border-t border-border/50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* conteúdo principal */}
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 md:py-12">

        {/* mobile*/}
        <div className="md:hidden">
          <div className="flex justify-center mb-6">
            <div className="space-y-3 max-w-xs text-center">
              <div className="flex items-center justify-center space-x-2">
                <Link to="/">
                  <img 
                    src="/markomods-logo2.png" 
                    alt="MarkoMods Logo" 
                    className="h-8 w-auto transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer"
                  />
                </Link>
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

          {/* outras seções */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground flex items-center"><ExternalLink className="h-4 w-4 mr-2 text-primary" />{t('footer.quickLinks')}</h3>
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

              {/* redes sociais */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground flex items-center"><Globe className="h-4 w-4 mr-2 text-primary" />{t('footer.social')}</h3>
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
                    <a href="https://eumarko.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <i className="fas fa-globe h-3 w-3 mr-2 flex-shrink-0"></i>
                      {t('footer.officialSite')}
                    </a>
                  </li>
                </ul>
              </div>

              {/* suporte */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground flex items-center"><Mail className="h-4 w-4 mr-2 text-primary" />{t('footer.support')}</h3>
                <ul className="space-y-1.5">
                  <li>
                    <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.contact')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <Shield className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.aboutUs')}
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

              {/* legal */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground flex items-center"><Shield className="h-4 w-4 mr-2 text-primary" />{t('footer.legal')}</h3>
                <ul className="space-y-1.5">
                  <li>
                    <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <Shield className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.termsOfUse')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center touch-manipulation py-1">
                      <Shield className="h-3 w-3 mr-2 flex-shrink-0" />
                      {t('footer.privacyPolicy')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* desktop */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-8 lg:gap-12 xl:gap-16 2xl:gap-20 pb-12">
          <div className="space-y-4 max-w-xs text-left">
            <div className="flex items-center space-x-2">
              <Link to="/">
                <img 
                  src="/markomods-logo2.png" 
                  alt="MarkoMods Logo" 
                  className="h-10 w-auto transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer"
                />
              </Link>
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

          <div className="space-y-4 max-w-xs">
            <h3 className="text-lg font-semibold text-foreground flex items-center"><ExternalLink className="h-4 w-4 mr-2 text-primary" />{t('footer.quickLinks')}</h3>
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

          <div className="space-y-4 max-w-xs">
            <h3 className="text-lg font-semibold text-foreground flex items-center"><Globe className="h-4 w-4 mr-2 text-primary" />{t('footer.social')}</h3>
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
                <a href="https://eumarko.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <i className="fas fa-globe h-3 w-3 mr-2"></i>
                  {t('footer.officialSite')}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4 max-w-xs">
            <h3 className="text-lg font-semibold text-foreground flex items-center"><Mail className="h-4 w-4 mr-2 text-primary" />{t('footer.support')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Mail className="h-3 w-3 mr-2" />
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Shield className="h-3 w-3 mr-2" />
                  {t('footer.aboutUs')}
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

          <div className="space-y-4 max-w-xs">
            <h3 className="text-lg font-semibold text-foreground flex items-center"><Shield className="h-4 w-4 mr-2 text-primary" />{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Shield className="h-3 w-3 mr-2" />
                  {t('footer.termsOfUse')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Shield className="h-3 w-3 mr-2" />
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="w-full bg-border/50" />
        
        {/* seção inferior */}
        <div className="py-4 md:py-6 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">

          {/* copyright */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span className="text-xs md:text-sm text-muted-foreground text-center sm:text-left">© {year} {t('footer.allRightsReserved')}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleScrollToTop}
            className="h-9 md:h-8 px-3 md:px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 touch-manipulation"
            aria-label={t('footer.backToTop')}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.footer>
  );
});

export default Footer;
