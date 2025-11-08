import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MessageCircle, 
  ChevronDown, 
  ChevronRight,
  MessageSquare,
  Phone,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

const ContactPage = () => {
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const getTranslation = (key, fallback = '') => {
    try {
      return t(key) || fallback;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return fallback;
    }
  };

  const faqItems = [
    {
      id: 'what-is-markomods',
      title: getTranslation('contact.faq.whatIsEuMarkoMods.title', 'O que é esta plataforma?'),
      content: getTranslation('contact.faq.whatIsEuMarkoMods.content', 'Esta é uma plataforma dedicada a mods para Minecraft, onde você pode descobrir, baixar e compartilhar mods incríveis. Nossa missão é facilitar o acesso a mods de qualidade e criar uma comunidade vibrante de jogadores e desenvolvedores.'),
      category: getTranslation('contact.faq.categories.general', 'Geral')
    },
    {
      id: 'how-to-download',
      title: getTranslation('contact.faq.howToDownload.title', 'Como baixar mods?'),
      content: getTranslation('contact.faq.howToDownload.content', 'Navegue pela nossa biblioteca de mods, encontre os que te interessam e clique no botão "Baixar". É necessário estar logado para realizar downloads. Após o download, siga as instruções de instalação específicas de cada mod.'),
      category: getTranslation('contact.faq.categories.mods', 'Mods')
    },
    {
      id: 'how-to-install',
      title: getTranslation('contact.faq.howToInstall.title', 'Como instalar mods?'),
      content: getTranslation('contact.faq.howToInstall.content', 'A instalação varia dependendo do mod e do mod loader utilizado (Forge, Fabric, etc.).\n\nPassos gerais:\n\n1) Instale o mod loader apropriado\n2) Baixe o mod desejado\n3) Coloque o arquivo .jar na pasta "mods" do seu Minecraft\n\nCada mod pode ter instruções específicas na sua página de detalhes.'),
      category: getTranslation('contact.faq.categories.mods', 'Mods')
    },
    {
      id: 'how-to-register',
      title: getTranslation('contact.faq.howToRegister.title', 'Como me registrar?'),
      content: getTranslation('contact.faq.howToRegister.content', 'Clique no botão "Registrar" localizado no canto superior direito da página. Preencha o formulário com seu nome de usuário, email e senha. Após confirmar seu email através do link enviado, você terá acesso completo a todas as funcionalidades da plataforma.'),
      category: getTranslation('contact.faq.categories.account', 'Conta')
    },
    {
      id: 'mod-issues',
      title: getTranslation('contact.faq.modIssues.title', 'O que fazer se um mod não funcionar?'),
      content: getTranslation('contact.faq.modIssues.content', 'Primeiro, verifique se você possui a versão correta do mod loader e do Minecraft. Confirme se todas as dependências necessárias estão instaladas. Se o problema persistir, consulte a seção de comentários do mod onde outros usuários podem ter encontrado soluções, ou entre em contato conosco para obter suporte.'),
      category: getTranslation('contact.faq.categories.technical', 'Técnico')
    }
  ];

  const handleFaqToggle = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const contactMethods = [
    {
      id: 'email',
      title: getTranslation('contact.methods.email.title', 'Email de Suporte'),
      description: getTranslation('contact.methods.email.description', 'Envie-nos um email para suporte técnico'),
      value: 'mods@eumarko.com',
      icon: Mail,
      color: 'bg-purple-500',
      action: 'mailto:mods@eumarko.com'
    },
    {
      id: 'discord',
      title: getTranslation('contact.methods.discord.title', 'Discord'),
      description: getTranslation('contact.methods.discord.description', 'Junte-se à nossa comunidade no Discord'),
      value: getTranslation('contact.methods.discord.server', 'Discord Server'),
      icon: () => (
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
      color: 'bg-purple-500',
      action: 'https://eumarko.com/discord'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen"
    >
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            {getTranslation('contact.title', 'Entre em Contato')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {getTranslation('contact.subtitle', 'Tem alguma dúvida ou sugestão? Entre em contato conosco!')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  {getTranslation('contact.faq.title', 'Perguntas Frequentes')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {getTranslation('contact.faq.subtitle', 'Encontre respostas para as dúvidas mais comuns')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {faqItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div
                      className="p-4 sm:p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleFaqToggle(item.id)}
                    >
                      <div className="flex items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold leading-tight">{item.title}</h3>
                            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full w-fit">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedFaq === item.id ? (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                          height: expandedFaq === item.id ? 'auto' : 0,
                          opacity: expandedFaq === item.id ? 1 : 0
                        }}
                        transition={{ 
                          duration: 0.3,
                          ease: 'easeInOut'
                        }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 sm:space-y-6"
          >
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  {getTranslation('contact.info.title', 'Outras Formas de Contato')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {getTranslation('contact.info.description', 'Escolha a forma mais conveniente para você')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {contactMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                          <div className={`inline-flex p-2 sm:p-3 rounded-full ${method.color} flex-shrink-0`}>
                            {typeof method.icon === 'function' ? <method.icon /> : <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base lg:text-lg leading-tight">{method.title}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2 leading-tight">{method.description}</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(method.action, '_blank')}
                              className="w-full text-xs sm:text-sm"
                            >
                              {method.value}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3">
                  {getTranslation('contact.additional.title', 'Informações Importantes')}
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{getTranslation('contact.additional.responseTime', 'Respondemos em até 24 horas')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{getTranslation('contact.additional.support', 'Suporte técnico gratuito')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{getTranslation('contact.additional.community', 'Comunidade ativa no Discord')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 sm:mt-16 w-full"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 w-full">
            <CardContent className="p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{getTranslation('contact.stillNeedHelp.title', 'Ainda está com dúvidas?')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
                {getTranslation('contact.stillNeedHelp.description', 'Nossa equipe de suporte está aqui para ajudar. Entre em contato conosco através dos canais acima ou consulte nossa documentação completa.')}
              </p>
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => window.open('mailto:mods@eumarko.com', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {getTranslation('contact.stillNeedHelp.contactSupport', 'Contatar Suporte')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactPage;
