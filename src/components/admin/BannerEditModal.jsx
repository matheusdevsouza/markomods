import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Link as LinkIcon, Save, Loader2, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const BannerEditModal = ({ isOpen, onClose, currentBannerUrl, currentBannerLink, onSave }) => {
  const [bannerUrl, setBannerUrl] = useState(currentBannerUrl || '');
  const [bannerLink, setBannerLink] = useState(currentBannerLink || '');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerMode, setBannerMode] = useState('url');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setBannerUrl(currentBannerUrl || '');
      setBannerLink(currentBannerLink ? String(currentBannerLink) : '');
      setBannerFile(null);
      setBannerMode('url');
    }
  }, [isOpen, currentBannerUrl, currentBannerLink]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos de imagem.',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive'
      });
      return;
    }

    setBannerFile(file);
  };

  const handleSave = async () => {
    if (bannerMode === 'url' && !bannerUrl.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, forneça uma URL válida para o banner.',
        variant: 'destructive'
      });
      return;
    }

    if (bannerMode === 'upload' && !bannerFile) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo para upload.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    
    try {
      let finalUrl = bannerUrl;

      if (bannerMode === 'upload' && bannerFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('banner', bannerFile);
        
        const uploadResponse = await fetch('/api/admin/banner/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          finalUrl = uploadData.url;
        } else {
          throw new Error('Erro ao fazer upload');
        }
        setIsUploading(false);
      }

      const response = await fetch('/api/admin/banner/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          banner_url: finalUrl,
          banner_link: bannerLink.trim() || null
        })
      });

      if (response.ok) {
        onSave(finalUrl, bannerLink.trim() || null);
        toast({
          title: 'Sucesso',
          description: 'Banner atualizado com sucesso!'
        });
        onClose();
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar o banner. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setBannerUrl(currentBannerUrl || '');
    setBannerLink(currentBannerLink ? String(currentBannerLink) : '');
    setBannerFile(null);
    setBannerMode('url');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card border-border shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-minecraft">Editar Banner</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preview do Banner</Label>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                    {(bannerMode === 'url' ? bannerUrl : bannerFile) ? (
                      <img
                        src={bannerMode === 'url' ? bannerUrl : URL.createObjectURL(bannerFile)}
                        alt="Preview do banner"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground ${(bannerMode === 'url' ? bannerUrl : bannerFile) ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-sm">Nenhuma imagem selecionada</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mb-4">
                  <Button
                    type="button"
                    variant={bannerMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBannerMode('url')}
                    className="text-xs"
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={bannerMode === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBannerMode('upload')}
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                </div>

                {bannerMode === 'url' && (
                  <div className="space-y-2">
                    <Label htmlFor="banner-url" className="text-sm font-medium">
                      URL da Imagem
                    </Label>
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="banner-url"
                        type="url"
                        placeholder="https://exemplo.com.br/banner.jpg"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                )}

                {bannerMode === 'upload' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      <div className={`
                        border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-out
                        ${bannerFile 
                          ? 'border-green-500 bg-green-500/5' 
                          : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
                        }
                      `}>
                        
                        <div className="space-y-3">
                          {bannerFile ? (
                            <div className="space-y-3">
                              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Image className="h-8 w-8 text-green-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-600">
                                  Imagem selecionada
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {bannerFile.name}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="mx-auto w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                                <Image className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  Clique para selecionar ou arraste uma imagem
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, GIF até 5MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="banner-link" className="text-sm font-medium">
                    Link do Banner (opcional)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="banner-link"
                      type="url"
                      placeholder="https://exemplo.com.br ou deixe vazio"
                      value={bannerLink}
                      onChange={(e) => setBannerLink(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Quando preenchido, o banner será clicável e redirecionará para este link
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || isUploading || (bannerMode === 'url' ? !bannerUrl.trim() : !bannerFile)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isSaving || isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? 'Enviando...' : 'Salvando...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BannerEditModal;
