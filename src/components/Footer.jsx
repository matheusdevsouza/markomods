import React from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Gamepad2, 
  Download, 
  Users, 
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
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-8 lg:gap-12 xl:gap-16 2xl:gap-20 py-12 justify-items-start">
          
          {/* Seção 1: Sobre */}
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-minecraft text-primary">{t('footer.brandName')}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.brandDescription')}
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/20 group transition-all duration-300">
                <i className="fab fa-youtube text-lg text-muted-foreground group-hover:text-red-500 group-hover:scale-110 transition-all duration-300"></i>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-pink-500/20 group transition-all duration-300">
                <i className="fab fa-tiktok text-lg text-muted-foreground group-hover:text-pink-500 group-hover:scale-110 transition-all duration-300"></i>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-500/20 group transition-all duration-300">
                <i className="fab fa-instagram text-lg text-muted-foreground group-hover:text-purple-500 group-hover:scale-110 transition-all duration-300"></i>
              </Button>
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

          {/* Seção 3: Comunidade */}
          <div className="space-y-4 max-w-xs">
            <h3 className="text-lg font-semibold text-foreground">{t('footer.community')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/guidelines" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Shield className="h-3 w-3 mr-2" />
                  {t('footer.guidelines')}
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  <Users className="h-3 w-3 mr-2" />
                  {t('footer.partners')}
                </Link>
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
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-sm text-muted-foreground">© {year} {t('footer.allRightsReserved')}</span>
          </div>

          {/* Botão Voltar ao Topo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="h-8 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            {t('footer.backToTop')}
          </Button>
        </div>
      </div>
    </motion.footer>
  );
});

export default Footer;