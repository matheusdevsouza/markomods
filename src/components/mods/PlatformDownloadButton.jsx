import React from 'react';
import { Button } from '../../components/ui/button';
import { Download, Monitor, Smartphone, AlertCircle } from 'lucide-react';
import { usePlatform } from '../../hooks/usePlatform';

const PlatformDownloadButton = ({ mod, className = '', variant = 'default', size = 'default' }) => {
  const { platform, isMobile, isDesktop } = usePlatform();

  // Determinar qual URL de download usar
  const getDownloadUrl = () => {
    if (isMobile && mod.download_url_mobile) {
      return mod.download_url_mobile;
    }
    if (isDesktop && mod.download_url_pc) {
      return mod.download_url_pc;
    }
    // Fallback: usar PC se mobile não estiver disponível, ou vice-versa
    if (mod.download_url_pc) {
      return mod.download_url_pc;
    }
    if (mod.download_url_mobile) {
      return mod.download_url_mobile;
    }
    return null;
  };

  // Determinar o texto do botão
  const getButtonText = () => {
    if (isMobile && mod.download_url_mobile) {
      return '';
    }
    if (isDesktop && mod.download_url_pc) {
      return '';
    }
    if (mod.download_url_pc && mod.download_url_mobile) {
      return '';
    }
    if (mod.download_url_pc) {
      return '';
    }
    if (mod.download_url_mobile) {
      return '';
    }
    return '';
  };

  // Determinar o ícone
  const getIcon = () => {
    if (isMobile && mod.download_url_mobile) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (isDesktop && mod.download_url_pc) {
      return <Monitor className="h-4 w-4" />;
    }
    if (mod.download_url_pc && mod.download_url_mobile) {
      return <Download className="h-4 w-4" />;
    }
    if (mod.download_url_pc) {
      return <Monitor className="h-4 w-4" />;
    }
    if (mod.download_url_mobile) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  // Determinar se o botão deve estar desabilitado
  const isDisabled = !getDownloadUrl();

  // Determinar a variante do botão
  const getButtonVariant = () => {
    if (isDisabled) {
      return 'outline';
    }
    if (isMobile && mod.download_url_mobile) {
      return 'default';
    }
    if (isDesktop && mod.download_url_pc) {
      return 'default';
    }
    return variant;
  };

  // Função para lidar com o download
  const handleDownload = () => {
    const downloadUrl = getDownloadUrl();
    if (downloadUrl) {
      // Abrir em nova aba para downloads
      window.open(downloadUrl, '_blank');
      
      // Opcional: registrar o download
      // Aqui você pode adicionar lógica para registrar o download no backend
    }
  };

  // Determinar a cor baseada na plataforma
  const getButtonClassName = () => {
    let baseClasses = className;
    
    if (isMobile && mod.download_url_mobile) {
      baseClasses += ' bg-green-600 hover:bg-green-700 text-white';
    } else if (isDesktop && mod.download_url_pc) {
      baseClasses += ' bg-blue-600 hover:bg-blue-700 text-white';
    } else if (isDisabled) {
      baseClasses += ' text-muted-foreground cursor-not-allowed';
    }
    
    return baseClasses;
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDisabled}
      variant={getButtonVariant()}
      size={size}
      className={getButtonClassName()}
      title={getDownloadUrl() ? `Baixar para ${platform}` : 'Download não disponível para esta plataforma'}
    >
      {getIcon()}
    </Button>
  );
};

export default PlatformDownloadButton;
