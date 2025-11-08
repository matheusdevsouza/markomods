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
      title: getTranslation('faq.whatIsMarkoMods.title', 'O que é esta plataforma?'),
      content: getTranslation('faq.whatIsMarkoMods.content', 'Esta é uma plataforma dedicada a mods para Minecraft, onde você pode descobrir, baixar e compartilhar mods incríveis. Nossa missão é facilitar o acesso a mods de qualidade e criar uma comunidade vibrante de jogadores e desenvolvedores.'),
      category: 'geral',
      icon: HelpCircle
    },
    {
      id: 'how-to-start',
      title: getTranslation('faq.howToStart.title', 'Como começar a usar a plataforma?'),
      content: getTranslation('faq.howToStart.content', 'Para começar é muito simples:\n\n1) Crie uma conta gratuita\n2) Explore nossa biblioteca de mods\n3) Baixe os mods que te interessam\n4) Instale seguindo nossas instruções\n\nTudo é gratuito e fácil de usar!'),
      category: 'geral',
      icon: Zap
    },
    {
      id: 'is-free',
      title: getTranslation('faq.isFree.title', 'A plataforma é gratuita?'),
      content: getTranslation('faq.isFree.content', 'Sim! Nossa plataforma é completamente gratuita. Você pode criar uma conta, baixar mods, favoritar e usar todas as funcionalidades sem custo algum.'),
      category: 'geral',
      icon: Shield
    },

    {
      id: 'how-to-register',
      title: getTranslation('faq.howToRegister.title', 'Como me registrar?'),
      content: getTranslation('faq.howToRegister.content', 'Clique no botão "Registrar" localizado no canto superior direito da página. Preencha o formulário com seu nome de usuário, email e senha. Após confirmar seu email através do link enviado, você terá acesso completo a todas as funcionalidades da plataforma.'),
      category: 'conta',
      icon: User
    },
    {
      id: 'reset-password',
      title: getTranslation('faq.resetPassword.title', 'Como redefinir minha senha?'),
      content: getTranslation('faq.resetPassword.content', 'Na página de login, clique em "Esqueci minha senha". Digite seu email cadastrado e você receberá um link para redefinir sua senha. Siga as instruções enviadas por email para criar uma nova senha segura.'),
      category: 'conta',
      icon: Settings
    },
    {
      id: 'update-profile',
      title: getTranslation('faq.updateProfile.title', 'Como atualizar meu perfil?'),
      content: getTranslation('faq.updateProfile.content', 'Acesse seu dashboard clicando no seu avatar no canto superior direito. Na seção "Perfil", você pode atualizar suas informações pessoais, foto de perfil, nome de exibição e outras preferências da sua conta.'),
      category: 'conta',
      icon: User
    },

    {
      id: 'how-to-download',
      title: getTranslation('faq.howToDownload.title', 'Como baixar mods?'),
      content: getTranslation('faq.howToDownload.content', 'Navegue pela nossa biblioteca de mods, encontre os que te interessam e clique no botão "Baixar". É necessário estar logado para realizar downloads. Após o download, siga as instruções de instalação específicas de cada mod.'),
      category: 'mods',
      icon: Download
    },
    {
      id: 'how-to-install',
      title: getTranslation('faq.howToInstall.title', 'Como instalar mods?'),
      content: getTranslation('faq.howToInstall.content', 'A instalação varia dependendo do mod e do mod loader utilizado (Forge, Fabric, etc.).\n\nPassos gerais:\n\n1) Instale o mod loader apropriado\n2) Baixe o mod desejado\n3) Coloque o arquivo .jar na pasta "mods" do seu Minecraft\n\nCada mod pode ter instruções específicas na sua página de detalhes.'),
      category: 'mods',
      icon: Package
    },
    {
      id: 'favorite-mods',
      title: getTranslation('faq.favoriteMods.title', 'Como favoritar mods?'),
      content: getTranslation('faq.favoriteMods.content', 'Clique no ícone de coração no card do mod ou na página de detalhes. Os mods favoritados aparecerão automaticamente na sua seção "Favoritos" no dashboard, facilitando o acesso posterior.'),
      category: 'mods',
      icon: Download
    },
    {
      id: 'find-mods',
      title: getTranslation('faq.findMods.title', 'Como encontrar mods específicos?'),
      content: getTranslation('faq.findMods.content', 'Use a barra de pesquisa para buscar por nome, categoria ou palavras-chave. Você também pode utilizar os filtros disponíveis para refinar sua busca por versão do Minecraft, mod loader, popularidade ou outras categorias.'),
      category: 'mods',
      icon: Search
    },

    {
      id: 'mod-compatibility',
      title: getTranslation('faq.modCompatibility.title', 'Como verificar compatibilidade de mods?'),
      content: getTranslation('faq.modCompatibility.content', 'Cada mod possui informações detalhadas sobre compatibilidade na sua página de detalhes, incluindo versão do Minecraft necessária, mod loader requerido e dependências. Sempre verifique essas informações antes de instalar para evitar conflitos.'),
      category: 'tecnico',
      icon: Settings
    },
    {
      id: 'system-requirements',
      title: getTranslation('faq.systemRequirements.title', 'Quais são os requisitos do sistema?'),
      content: getTranslation('faq.systemRequirements.content', 'Para usar nossa plataforma, você precisa de: Minecraft Java Edition, Java 8 ou superior, conexão com internet e um navegador moderno. Para mods específicos, consulte os requisitos individuais de cada mod.'),
      category: 'tecnico',
      icon: Settings
    },
    {
      id: 'mod-issues',
      title: getTranslation('faq.modIssues.title', 'O que fazer se um mod não funcionar?'),
      content: getTranslation('faq.modIssues.content', 'Primeiro, verifique se você possui a versão correta do mod loader e do Minecraft. Confirme se todas as dependências necessárias estão instaladas. Se o problema persistir, consulte a seção de comentários do mod onde outros usuários podem ter encontrado soluções, ou entre em contato conosco para obter suporte.'),
      category: 'tecnico',
      icon: Bug
    },
    {
      id: 'mod-loader',
      title: getTranslation('faq.modLoader.title', 'Qual mod loader devo usar?'),
      content: getTranslation('faq.modLoader.content', 'A escolha do mod loader depende do mod que você deseja instalar. Forge é o mais popular e possui maior compatibilidade com a maioria dos mods. Fabric é mais moderno e oferece melhor performance. Quilt é uma alternativa moderna ao Fabric. Verifique na página de detalhes do mod qual loader é recomendado.'),
      category: 'tecnico',
      icon: Package
    },

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

  const categoryShortNames = {
    'all': getTranslation('faq.categories.short.all', 'Todas'),
    'geral': getTranslation('faq.categories.short.general', 'Geral'),
    'conta': getTranslation('faq.categories.short.account', 'Conta'),
    'mods': getTranslation('faq.categories.short.mods', 'Mods'),
    'tecnico': getTranslation('faq.categories.short.technical', 'Téc.'),
    'comunidade': getTranslation('faq.categories.short.community', 'Com.')
  };

  const categoryMap = {
    'geral': 'general',
    'conta': 'account',
    'mods': 'mods',
    'tecnico': 'technical',
    'comunidade': 'community'
  };

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
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            {getTranslation('faq.title', 'Perguntas Frequentes')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {getTranslation('faq.subtitle', 'Encontre respostas para as dúvidas mais comuns sobre nossa plataforma')}
          </p>
        </div>

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
                {categoryShortNames[category.id] || category.name}
              </span>
            </Button>
          ))}
        </div>

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
                          {getTranslation(`faq.categories.${categoryMap[item.category] || item.category}`, categories.find(cat => cat.id === item.category)?.name)}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 sm:mt-16 max-w-4xl mx-auto px-4"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{getTranslation('faq.stillNeedHelp.title', 'Não encontrou sua resposta?')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
                {getTranslation('faq.stillNeedHelp.description', 'Nossa equipe de suporte está aqui para ajudar. Entre em contato conosco através dos canais abaixo.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-sm sm:text-base w-full sm:w-auto"
                  onClick={() => window.open('mailto:mods@eumarko.com', '_blank')}
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
