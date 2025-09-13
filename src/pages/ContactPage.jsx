import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Youtube, Instagram, MessageCircle, Download, UserCircle as UserIcon } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const iconMapContact = {
  email: Mail,
  youtube: Youtube,
  tiktok: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 0 .17.01.24.02.04.01.08.01.12.02.39.03.77.07 1.14.13.28.05.55.1.81.17.09.02.18.04.27.06.02.01.03.01.05.01.14.04.28.08.41.13a3.49 3.49 0 011.07.57c.24.17.46.37.66.59.21.22.39.46.55.71.17.25.31.52.43.8.07.15.13.3.18.44.05.15.08.3.11.45.03.16.05.32.07.48.01.09.02.18.03.27.01.11.01.22.01.33L24 6.15v5.58c-.01.1-.01.19-.02.29-.01.11-.02.22-.04.33-.03.15-.06.3-.09.44-.04.16-.09.31-.14.46-.06.18-.12.35-.2.52-.08.17-.17.33-.26.49-.18.33-.39.63-.63.91-.24.28-.5.53-.79.75-.29.22-.6.42-.92.59-.24.13-.48.24-.73.34a6.2 6.2 0 01-3.16.52c-.01 0-.02.01-.03.01H16.23v-3.03c.48-.05.95-.12 1.41-.23.45-.1.88-.24 1.3-.41.41-.17.8-.38 1.17-.62.36-.24.7-.52.99-.84.29-.32.55-.68.77-1.07.22-.39.4-.82.53-1.28.03-.09.06-.19.08-.28.02-.1.03-.19.04-.29.01-.1.01-.19.01-.29V7.65c-.01-.41-.06-.81-.15-1.21-.09-.4-.23-.78-.41-1.15-.18-.37-.4-.71-.67-1.02-.27-.31-.58-.59-.91-.82-.33-.23-.69-.43-1.06-.59a3.2 3.2 0 00-1.12-.35c-.1-.02-.19-.03-.29-.04-.1-.01-.19-.01-.29-.01-.33 0-.66 0-1 .01h-.01c-.01 0-.01 0-.02 0a5.42 5.42 0 00-1.9.23c-.58.16-1.13.4-1.62.7-.49.3-.93.66-1.31 1.07-.38.41-.7 .88-1.03 1.33l-.01.01c-1.29 1.85-1.16 4.71.42 6.12 1.16 1.03 2.93.96 4.26-.26l.01-.01c.11-.09.2-.19.3-.3.11-.11.21-.22.31-.34l.01-.01c.02-.02.04-.04.06-.06.06-.07.12-.14.18-.21.02-.02.03-.04.05-.06.13-.16.25-.32.36-.49.11-.17.2-.34.29-.52.09-.18.16-.36.22-.55.06-.19.11-.38.14-.58.03-.2.05-.4.06-.6.01-.21.01-.42.01-.63V5.4c0-.01 0-.02 0-.03l-.01-.01v-.01h-.01V3.2H12.5c-.02.01-.03.01-.05.01l-.01-.01c-.39.06-.78.15-1.15.28-.37.13-.73.29-1.07.48-.34.19-.67.41-.97.66-.3.25-.58.53-.82.84-.24.31-.45.65-.63.99-.18.34-.33.7-.46 1.06-.13.36-.23.74-.31 1.12l-.01.02c0 .01-.01.02-.01.03v.01c0 .01 0 .01 0 .02v.01c-.06.55-.09 1.1-.09 1.66 0 .23.01.45.02.68l.01.01c.01.08.01.16.02.24v.01c.02.12.03.24.05.36l.01.01c.02.1.04.19.06.29.02.1.04.19.07.29.18.69.5 1.34 1.02 2.09l.01.01c.17.25.36.49.55.73.2.24.41.48.63.71.22.23.45.45.69.66.24.21.49.41.74.6.25.19.51.37.78.53.27.16.54.31.82.45.28.14.56.27.84.39.28.12.57.23.86.33.29.1.58.19.87.27l.01.01c1.11.28 2.3.29 3.42-.06V18.4c-1.18.31-2.42.24-3.54-.17a3.65 3.65 0 01-2.08-1.33c-.3-.36-.56-.75-.78-1.18-.22-.43-.39-.89-.51-1.36a4.5 4.5 0 01-.14-1.84c.09-.69.34-1.35.71-1.94.37-.6.86-1.12 1.42-1.52.56-.4 1.18-.71 1.82-.91.64-.2 1.3-.28 1.96-.26.32.01.63.04.94.09l.01.01c.01 0 .01 0 .02 0h.01c.2.03.4.08.59.13.19.05.38.11.57.18.19.07.37.15.55.24.18.09.35.19.52.3.17.11.33.22.49.34.16.12.31.25.46.39.15.14.29.28.42.44.13.16.25.32.37.49.12.17.22.34.32.52.1.18.19.37.27.56.08.19.15.38.21.58.06.2.11.4.15.6.04.2.07.4.09.61v0c.01.1.02.2.02.31.07 1.02-.22 2.04-.86 2.84-.64.8-1.61 1.27-2.66 1.27-.3 0-.59-.04-.88-.12-.29-.08-.57-.19-.84-.33-.27-.14-.52-.3-.76-.48s-.46-.38-.67-.59c-.21-.21-.4-.44-.57-.68-.17-.24-.32-.49-.45-.75-.13-.26-.24-.53-.33-.81-.09-.28-.16-.56-.21-.85-.05-.29-.08-.58-.09-.88-.01-.3-.01-.61.01-.91v-2.29c0-.01.01-.02.01-.03V9.58c0-.2-.01-.4-.03-.6a4.3 4.3 0 00-.09-.59c-.04-.19-.09-.38-.15-.57-.06-.19-.13-.37-.2-.55-.07-.18-.15-.36-.24-.53a3.48 3.48 0 00-1.07-1.48 3.45 3.45 0 00-1.57-.9c-.2-.07-.4-.12-.6-.17-.2-.05-.4-.08-.6-.11-.2-.03-.4-.05-.59-.06h-.01l-.02.01H6.23v12.43c0 .01 0 .02-.01.03 0 .01 0 .01-.01.02v.01c.02.33.06.66.13.98.07.32.17.64.29.95.12.31.27.61.43.9.16.29.34.58.54.85.2.27.42.53.65.78.23.25.48.48.73.7.25.22.52.43.79.62.27.19.55.37.84.54.29.17.58.32.88.46.3.14.61.27.92.38.31.11.62.21.94.29.32.08.64.15.96.2.32.05.64.08.96.09h.02c.32.01.63.01.95-.01.32-.02.63-.05.94-.1.31-.05.62-.11.92-.19.3-.08.59-.18.88-.29.29-.11.57-.24.84-.38.27-.14.54-.3.8-.47.26-.17.51-.35.75-.55.24-.20.47-.42.69-.65.22-.23.42-.47.61-.72.19-.25.37-.51.53-.78.16-.27.3-.55.43-.84a6.3 6.3 0 00.38-2.04c.01-.15.01-.3.01-.45V7.18l-.02-.01Z" /></svg>,
  instagram: Instagram,
  kwai: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 1024 1024"><path d="M512 0C229.232 0 0 229.232 0 512s229.232 512 512 512 512-229.232 512-512S794.768 0 512 0zm283.904 548.384l-106.496 49.664c-9.216 4.096-19.968.512-24.576-8.704l-64-128c-4.096-8.192-12.8-12.288-21.504-9.728l-100.352 29.696c-8.704 2.56-17.408-1.024-21.504-8.704l-64-133.12c-4.608-9.216.512-19.968 9.728-24.576l106.496-49.664c9.216-4.096 19.968-.512 24.576 8.704l64 128c4.096 8.192 12.8 12.288 21.504 9.728l100.352-29.696c8.704-2.56 17.408 1.024 21.504 8.704l64 133.12c4.608 9.216-.512 19.968-9.728 24.576z"/></svg>,
  mods_site: Download,
  discord: MessageCircle, 
  other: UserIcon,
};

const ContactPage = () => {
  const { mediaKitPublicData, loadingData } = useData();
  const socialLinks = mediaKitPublicData?.social_media_links || [];

  const emailLink = socialLinks.find(link => link.platform_key === 'email');
  const otherLinks = socialLinks.filter(link => link.platform_key !== 'email')
    .sort((a,b) => (a.display_name || a.platform_key).localeCompare(b.display_name || b.platform_key));


  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12 md:py-20"
    >
      <header className="text-center mb-12 md:mb-16">
        <motion.h1 
          className="text-4xl md:text-5xl font-extrabold gradient-text mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Entre em Contato
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Vamos conversar! Aqui estão todas as formas de me encontrar e acompanhar meu trabalho.
        </motion.p>
      </header>

      <div className="max-w-3xl mx-auto">
        {emailLink && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-10"
          >
            <Card className="glass-effect shadow-xl border-primary/30">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center">
                  <Mail className="mr-3 h-7 w-7" /> Principal Forma de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  {emailLink.display_name || emailLink.url.replace('mailto:', '')}
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white glow-on-hover">
                  <a href={`mailto:${emailLink.url.replace('mailto:', '')}?subject=Contato - Eu, Marko!`}>
                    <Mail size={20} className="mr-2" /> Enviar Email
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {otherLinks.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 gradient-text-purple-blue">
              Outras Redes
            </h2>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
              variants={{
                show: { transition: { staggerChildren: 0.1 } }
              }}
              initial="hidden"
              animate="show"
            >
              {otherLinks.map((link, index) => {
                const Icon = iconMapContact[link.platform_key] || iconMapContact.other;
                return (
                  <motion.div 
                    key={link.id || index}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="block group">
                      <Card className="glass-effect h-full hover:border-primary/50 transition-all duration-300 ease-in-out hover:shadow-primary/10">
                        <CardContent className="p-5 flex items-center space-x-4">
                          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors border border-primary/20">
                            <Icon size={24} />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                              {link.display_name || link.platform_key.charAt(0).toUpperCase() + link.platform_key.slice(1)}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-primary/80 transition-colors">
                              {link.url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}
         {!emailLink && otherLinks.length === 0 && (
            <p className="text-center text-muted-foreground">Nenhum link de contato configurado.</p>
        )}
      </div>
    </motion.div>
  );
};

export default ContactPage;