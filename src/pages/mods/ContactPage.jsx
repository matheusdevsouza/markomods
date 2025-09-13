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

  // Função para obter tradução com fallback
  const getTranslation = (key, fallback = '') => {
    try {
      return t(key) || fallback;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return fallback;
    }
  };

  // FAQ - Perguntas Frequentes (5 principais)
  const faqItems = [
    {
      id: 'what-is-markomods',
      title: getTranslation('contact.faq.whatIsEuMarkoMods.title', 'O que é o Eu, Marko! Mods?'),
      content: getTranslation('contact.faq.whatIsEuMarkoMods.content', 'O Eu, Marko! Mods é nossa plataforma dedicada nossos mods para Minecraft, onde você pode descobrir, baixar e compartilhar todos nossos mods já feitos. Nossa missão é facilitar o seu acesso aos nossos mods e criar uma comunidade vibrante de jogadores.'),
      category: 'Geral'
    },
    {
      id: 'how-to-download',
      title: getTranslation('contact.faq.howToDownload.title', 'Como baixar mods?'),
      content: getTranslation('contact.faq.howToDownload.content', 'Navegue pela nossa biblioteca de mods, encontre o que você gosta e clique no botão "Baixar". Você precisa estar logado para baixar mods. Após o download, siga as instruções de instalação específicas de cada mod.'),
      category: 'Mods'
    },
    {
      id: 'how-to-install',
      title: getTranslation('contact.faq.howToInstall.title', 'Como instalar mods?'),
      content: getTranslation('contact.faq.howToInstall.content', 'A instalação varia dependendo do mod e do mod loader (Forge, Fabric, etc.). Geralmente, você precisa: 1) Instalar o mod loader apropriado, 2) Baixar o mod, 3) Colocar o arquivo .jar na pasta "mods" do seu Minecraft.'),
      category: 'Mods'
    },
    {
      id: 'how-to-register',
      title: getTranslation('contact.faq.howToRegister.title', 'Como me registrar?'),
      content: getTranslation('contact.faq.howToRegister.content', 'Para se registrar, clique no botão "Registrar" no canto superior direito da página. Preencha o formulário com seu nome de usuário, email e senha. Após confirmar seu email, você terá acesso completo à plataforma.'),
      category: 'Conta'
    },
    {
      id: 'mod-issues',
      title: getTranslation('contact.faq.modIssues.title', 'O que fazer se um mod não funcionar?'),
      content: getTranslation('contact.faq.modIssues.content', 'Primeiro, verifique se você tem a versão correta do mod loader e do Minecraft. Confirme se todas as dependências estão instaladas. Se o problema persistir, consulte a seção de comentários do mod ou entre em contato conosco.'),
      category: 'Técnico'
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
      value: 'contato@eumarko.com',
      icon: Mail,
      color: 'bg-purple-500',
      action: 'mailto:contato@eumarko.com'
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
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6"
          >
            <MessageSquare className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-minecraft text-primary mb-4">
            {getTranslation('contact.title', 'Entre em Contato')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {getTranslation('contact.subtitle', 'Tem alguma dúvida ou sugestão? Entre em contato conosco!')}
          </p>
        </div>

        {/* FAQ e Contatos - Layout em duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-12">
          {/* FAQ - Lado Esquerdo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  {getTranslation('contact.faq.title', 'Perguntas Frequentes')}
                </CardTitle>
                <CardDescription>
                  {getTranslation('contact.faq.subtitle', 'Encontre respostas para as dúvidas mais comuns')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div
                      className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleFaqToggle(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        {expandedFaq === item.id ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
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
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-muted-foreground leading-relaxed">
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

          {/* Outras Formas de Contato - Lado Direito */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Phone className="w-6 h-6 text-primary" />
                  {getTranslation('contact.info.title', 'Outras Formas de Contato')}
                </CardTitle>
                <CardDescription>
                  {getTranslation('contact.info.description', 'Escolha a forma mais conveniente para você')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`inline-flex p-3 rounded-full ${method.color}`}>
                            {typeof method.icon === 'function' ? <method.icon /> : <method.icon className="w-6 h-6 text-white" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{method.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(method.action, '_blank')}
                              className="w-full"
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

            {/* Informações Adicionais */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">
                  {getTranslation('contact.additional.title', 'Informações Importantes')}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{getTranslation('contact.additional.responseTime', 'Respondemos em até 24 horas')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{getTranslation('contact.additional.support', 'Suporte técnico gratuito')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{getTranslation('contact.additional.community', 'Comunidade ativa no Discord')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Container "Ainda está com dúvidas?" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 w-full"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 w-full">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">{getTranslation('contact.stillNeedHelp.title', 'Ainda está com dúvidas?')}</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {getTranslation('contact.stillNeedHelp.description', 'Nossa equipe de suporte está aqui para ajudar. Entre em contato conosco através dos canais acima ou consulte nossa documentação completa.')}
              </p>
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.open('mailto:contato@eumarko.com', '_blank')}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
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
