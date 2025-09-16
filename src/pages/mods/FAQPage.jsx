import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  MessageCircle,
  Mail,
  BookOpen,
  User,
  Download,
  Settings,
  Shield,
  Bug,
  Zap,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';

const FAQPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Função para obter tradução com fallback
  const getTranslation = (key, fallback = '') => {
    try {
      return t(key) || fallback;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return fallback;
    }
  };

  // FAQ completo com todas as categorias
  const faqItems = [
    // GERAL
    {
      id: 'what-is-markomods',
      title: getTranslation('contact.faq.whatIsEuMarkoMods.title', 'O que é o Eu, Marko! Mods?'),
      content: getTranslation('contact.faq.whatIsEuMarkoMods.content', 'O Eu, Marko! Mods é nossa plataforma dedicada nossos mods para Minecraft, onde você pode descobrir, baixar e compartilhar todos nossos mods já feitos. Nossa missão é facilitar o seu acesso aos nossos mods e criar uma comunidade vibrante de jogadores.'),
      category: 'geral',
      icon: HelpCircle
    },
    {
      id: 'how-to-start',
      title: getTranslation('faq.howToStart.title', 'Como começar a usar o Eu, Marko! Mods?'),
      content: getTranslation('faq.howToStart.content', 'Para começar:\n\n1) Crie uma conta gratuita\n2) Explore nossa biblioteca de mods\n3) Baixe mods que te interessam\n4) Instale seguindo nossas instruções\n\nÉ simples e gratuito!'),
      category: 'geral',
      icon: Zap
    },
    {
      id: 'is-free',
      title: getTranslation('faq.isFree.title', 'O Eu, Marko! Mods é gratuito?'),
      content: getTranslation('faq.isFree.content', 'Sim! O Eu, Marko! Mods é completamente gratuito. Você pode criar uma conta, baixar mods, favoritar e usar todas as funcionalidades sem custo algum.'),
      category: 'geral',
      icon: Shield
    },

    // CONTA
    {
      id: 'how-to-register',
      title: getTranslation('faq.howToRegister.title', 'Como me registrar?'),
      content: getTranslation('faq.howToRegister.content', 'Clique em "Registrar" no canto superior direito, preencha o formulário com seu nome, email e senha. Após confirmar seu email, você terá acesso completo à plataforma.'),
      category: 'conta',
      icon: User
    },
    {
      id: 'reset-password',
      title: getTranslation('faq.resetPassword.title', 'Como redefinir minha senha?'),
      content: getTranslation('faq.resetPassword.content', 'Na página de login, clique em "Esqueci minha senha". Digite seu email e você receberá um link para redefinir sua senha. Siga as instruções no email.'),
      category: 'conta',
      icon: Settings
    },
    {
      id: 'update-profile',
      title: getTranslation('faq.updateProfile.title', 'Como atualizar meu perfil?'),
      content: getTranslation('faq.updateProfile.content', 'Acesse seu dashboard clicando no seu avatar. Na seção "Perfil", você pode atualizar suas informações pessoais, foto e preferências.'),
      category: 'conta',
      icon: User
    },

    // MODS
    {
      id: 'how-to-download',
      title: getTranslation('faq.howToDownload.title', 'Como baixar mods?'),
      content: getTranslation('faq.howToDownload.content', 'Navegue pela biblioteca, encontre mods que te interessam e clique em "Baixar". Você precisa estar logado. Após o download, siga as instruções de instalação.'),
      category: 'mods',
      icon: Download
    },
    {
      id: 'how-to-install',
      title: getTranslation('faq.howToInstall.title', 'Como instalar mods?'),
      content: getTranslation('faq.howToInstall.content', 'A instalação varia por mod e mod loader (Forge, Fabric, etc.).\n\nGeralmente:\n\n1) Instale o mod loader apropriado\n2) Baixe o mod\n3) Coloque o arquivo .jar na pasta "mods" do Minecraft'),
      category: 'mods',
      icon: Package
    },
    {
      id: 'favorite-mods',
      title: getTranslation('faq.favoriteMods.title', 'Como favoritar mods?'),
      content: getTranslation('faq.favoriteMods.content', 'Clique no ícone de coração no card do mod ou na página de detalhes. Mods favoritados aparecem na sua seção "Favoritos" no dashboard.'),
      category: 'mods',
      icon: Download
    },
    {
      id: 'find-mods',
      title: getTranslation('faq.findMods.title', 'Como encontrar mods específicos?'),
      content: getTranslation('faq.findMods.content', 'Use nossa barra de pesquisa para buscar por nome, categoria ou palavras-chave. Você também pode filtrar por versão do Minecraft, mod loader ou popularidade.'),
      category: 'mods',
      icon: Search
    },

    // TÉCNICO
    {
      id: 'mod-compatibility',
      title: getTranslation('faq.modCompatibility.title', 'Como verificar compatibilidade?'),
      content: getTranslation('faq.modCompatibility.content', 'Cada mod tem informações detalhadas sobre compatibilidade, incluindo versão do Minecraft, mod loader necessário e dependências. Sempre verifique antes de instalar.'),
      category: 'tecnico',
      icon: Settings
    },
    {
      id: 'system-requirements',
      title: getTranslation('faq.systemRequirements.title', 'Quais são os requisitos do sistema?'),
      content: getTranslation('faq.systemRequirements.content', 'Para usar o Eu, Marko! Mods: Minecraft Java Edition, Java 8 ou superior, conexão com internet e navegador moderno. Para mods específicos, consulte os requisitos individuais.'),
      category: 'tecnico',
      icon: Settings
    },
    {
      id: 'mod-issues',
      title: getTranslation('faq.modIssues.title', 'O que fazer se um mod não funcionar?'),
      content: getTranslation('faq.modIssues.content', 'Primeiro, verifique se você tem a versão correta do mod loader e do Minecraft. Confirme se todas as dependências estão instaladas. Se o problema persistir, consulte os comentários do mod ou entre em contato.'),
      category: 'tecnico',
      icon: Bug
    },
    {
      id: 'mod-loader',
      title: getTranslation('faq.modLoader.title', 'Qual mod loader usar?'),
      content: getTranslation('faq.modLoader.content', 'A escolha depende do mod. Forge é o mais popular e compatível com a maioria dos mods. Fabric é mais moderno e performático. Quilt é uma alternativa ao Fabric. Verifique qual o recomendado para o mod desejado.'),
      category: 'tecnico',
      icon: Package
    },

    // COMUNIDADE
    {
      id: 'community-guidelines',
      title: getTranslation('faq.communityGuidelines.title', 'Quais são as diretrizes da comunidade?'),
      content: getTranslation('faq.communityGuidelines.content', 'Nossa comunidade valoriza respeito, colaboração e criatividade. Seja respeitoso com outros usuários, compartilhe conteúdo apropriado, dê crédito aos criadores e ajude outros membros.'),
      category: 'comunidade',
      icon: Shield
    },
    {
      id: 'report-mod',
      title: getTranslation('faq.reportMod.title', 'Como reportar um mod problemático?'),
      content: getTranslation('faq.reportMod.content', 'Use o botão "Reportar" na página do mod. Nossa equipe de moderação analisará o caso e tomará as medidas apropriadas.'),
      category: 'comunidade',
      icon: Bug
    },
  ];

  const categories = [
    { id: 'all', name: getTranslation('faq.categories.all', 'Todas'), icon: HelpCircle },
    { id: 'geral', name: getTranslation('faq.categories.general', 'Geral'), icon: HelpCircle },
    { id: 'conta', name: getTranslation('faq.categories.account', 'Conta'), icon: User },
    { id: 'mods', name: getTranslation('faq.categories.mods', 'Mods'), icon: Package },
    { id: 'tecnico', name: getTranslation('faq.categories.technical', 'Técnico'), icon: Settings },
    { id: 'comunidade', name: getTranslation('faq.categories.community', 'Comunidade'), icon: Shield }
  ];

  const handleFaqToggle = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const filteredFaqItems = faqItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen"
    >
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-4 sm:mb-6"
          >
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-minecraft text-primary mb-3 sm:mb-4">
            {getTranslation('faq.title', 'Perguntas Frequentes')}
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {getTranslation('faq.subtitle', 'Encontre respostas para as dúvidas mais comuns sobre o Eu, Marko! Mods')}
          </p>
        </div>

        {/* Barra de pesquisa */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder={getTranslation('faq.searchPlaceholder', 'Pesquisar nas perguntas frequentes...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-12 text-sm sm:text-base lg:text-lg"
            />
          </div>
        </div>

        {/* Filtros de categoria */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8 px-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <category.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">
                {category.name === 'Todas' ? 'Todas' :
                 category.name === 'Geral' ? 'Geral' :
                 category.name === 'Conta' ? 'Conta' :
                 category.name === 'Mods' ? 'Mods' :
                 category.name === 'Técnico' ? 'Téc.' :
                 category.name === 'Comunidade' ? 'Com.' : category.name}
              </span>
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 px-4">
          {filteredFaqItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div
                  className="p-4 sm:p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleFaqToggle(item.id)}
                >
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold leading-tight">{item.title}</h3>
                        </div>
                        <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full w-fit">
                          {categories.find(cat => cat.id === item.category)?.name}
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
                      <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                        {item.content}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Container de contato */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 sm:mt-16 w-full px-4"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 w-full">
            <CardContent className="p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{getTranslation('faq.stillNeedHelp.title', 'Não encontrou sua resposta?')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
                {getTranslation('faq.stillNeedHelp.description', 'Nossa equipe de suporte está aqui para ajudar. Entre em contato conosco através dos canais abaixo.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => window.open('mailto:contato@eumarko.com', '_blank')}
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {getTranslation('faq.stillNeedHelp.email', 'Enviar Email')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => window.open('https://eumarko.com/discord', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {getTranslation('faq.stillNeedHelp.discord', 'Discord')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FAQPage;
