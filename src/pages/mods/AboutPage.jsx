import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ArrowLeft, 
  Heart, 
  Gamepad2, 
  Download, 
  Shield, 
  Mail, 
  Globe, 
  Star, 
  Target,
  Calendar,
  CheckCircle,
  Award,
  TrendingUp,
  Code,
  Palette,
  Zap,
  Crown,
  Rocket,
  ExternalLink,
  MessageCircle,
  Search,
  Smartphone
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const AboutPage = () => {
  const stats = [
    { icon: Gamepad2, label: 'Mods Criados', value: '50+', color: 'text-purple-500' },
    { icon: Download, label: 'Downloads', value: '15K+', color: 'text-purple-500' },
    { icon: Users, label: 'Inscritos', value: '1M+', color: 'text-purple-500' },
    { icon: Calendar, label: 'Anos de Canal', value: '3+', color: 'text-purple-500' }
  ];

  const values = [
    {
      icon: Target,
      title: 'Mods Feitos com Carinho',
      description: 'Cada mod é criado pensando na diversão! Testamos tudo para garantir que você tenha a melhor experiência no Minecraft.',
      color: 'bg-purple-500'
    },
    {
      icon: Users,
      title: 'Para Todos os Jogadores',
      description: 'Não importa se você é iniciante ou se tem mais experiência! Nossos mods são fáceis de instalar e usar.',
      color: 'bg-purple-500'
    },
    {
      icon: Heart,
      title: 'Comunidade Unida',
      description: 'Aqui todo mundo se ajuda! Compartilhamos experiências, dicas e crescemos juntos no Minecraft.',
      color: 'bg-purple-500'
    },
    {
      icon: Zap,
      title: 'Sempre Inovando',
      description: 'Criamos mods únicos que você não encontra em outro lugar! Cada mod traz algo especial para sua aventura.',
      color: 'bg-purple-500'
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: 'O Início',
      description: 'Marko começou a criar mods para suas próprias aventuras no Minecraft, compartilhando-os com amigos próximos.',
      icon: Rocket,
      color: 'bg-purple-500'
    },
    {
      year: '2021',
      title: 'Primeira Comunidade',
      description: 'Com o crescimento do canal no YouTube, Marko começou a receber pedidos para disponibilizar seus mods publicamente.',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      year: '2022',
      title: 'Plataforma Oficial',
      description: 'Lançamento da primeira versão da plataforma Eu, Marko!, oferecendo downloads organizados e seguros.',
      icon: Code,
      color: 'bg-purple-500'
    },
    {
      year: '2023',
      title: 'Expansão',
      description: 'Adição de sistema de comentários, favoritos e melhorias significativas na experiência do usuário.',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      year: '2024',
      title: 'Hoje',
      description: 'Plataforma completa com mais de 50 mods, milhares de usuários ativos e uma comunidade vibrante.',
      icon: Crown,
      color: 'bg-yellow-500'
    }
  ];

  const features = [
    {
      icon: Gamepad2,
      title: 'Biblioteca de Mods Incríveis',
      description: 'Mais de 50 mods únicos criados pelo Marko! Cada um pensado para tornar seu Minecraft ainda mais divertido.',
      color: 'bg-purple-500'
    },
    {
      icon: Heart,
      title: 'Sistema de Favoritos',
      description: 'Marque seus mods preferidos e nunca mais perca eles! Organize sua coleção pessoal de mods.',
      color: 'bg-purple-500'
    },
    {
      icon: Download,
      title: 'Downloads Rápidos',
      description: 'Baixe seus mods em segundos! Links diretos e downloads otimizados para não perder tempo.',
      color: 'bg-purple-500'
    },
    {
      icon: MessageCircle,
      title: 'Comentários e Avaliações',
      description: 'Veja o que outros jogadores acharam dos mods! Deixe sua opinião e ajude a comunidade.',
      color: 'bg-purple-500'
    },
    {
      icon: Search,
      title: 'Busca Inteligente',
      description: 'Encontre exatamente o que você procura! Filtre por versão, tipo de mod e muito mais.',
      color: 'bg-purple-500'
    },
    {
      icon: Smartphone,
      title: 'Suporte Mobile',
      description: 'Funciona perfeitamente no celular! Baixe mods e addons para Minecraft Bedrock Edition.',
      color: 'bg-purple-500'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen py-6 sm:py-8"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
              <Users className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Sobre Nós
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A plataforma oficial de mods criados pelo Marko!
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8 sm:mb-12">
          <Card className="minecraft-card bg-transparent border-primary/20">
            <CardContent className="p-6 sm:p-8 text-center">
              <h2 className="font-minecraft text-3xl sm:text-4xl text-primary mb-4">Eu, Marko!</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-3xl mx-auto">
                Criamos esta plataforma com o objetivo de juntar todos os mods criados pelo Marko! Aqui você consegue baixar, favoritar e compartilhar nossos melhores mods!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8 sm:mb-12">
          <Card className="minecraft-card bg-transparent border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl text-center">Nossos Números</CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">Veja aqui algumas de nossas conquistas que realizamos juntos!</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-muted/20 rounded-lg border border-border/30 hover:bg-muted/30 hover:border-primary/20 hover:scale-[1.02] transition-all duration-300 group">
                    <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2 group-hover:scale-110 transition-transform duration-300`} />
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 group-hover:text-accent transition-colors duration-300">{stat.value}</div>
                    <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8 sm:mb-12">
          <Card className="minecraft-card bg-transparent border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                O <strong className="text-primary">Eu, Marko!</strong> nasceu da paixão do Marko por jogar e criar mods no Minecraft. 
                Nossa missão é facilitar o seu acesso aos nossos melhores mods, oferecendo uma plataforma segura, completa, 
                organizada e fácil de usar para toda a nossa comunidade.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Desenvolvemos essa plataforma intuitiva que torna o processo de descoberta 
                e instalação de nossos mods mais simples e divertida.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8 sm:mb-12">
          <Card className="minecraft-card bg-transparent border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                O que Oferecemos
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Descubra todas as funcionalidades que tornam nossa plataforma especial!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg hover:from-primary/10 hover:to-secondary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                    <div className="flex items-start gap-3">
                      <div className={`inline-flex p-2 rounded-full ${feature.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8 sm:mb-12">
          <Card className="minecraft-card bg-transparent border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Nossos Valores
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                O que nos motiva todos os dias a criar mods incríveis para você!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30 hover:bg-muted/30 hover:border-primary/20 hover:scale-[1.01] transition-all duration-300 group">
                    <div className={`inline-flex p-2 rounded-full ${value.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">{value.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="minecraft-card bg-transparent border-primary/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Entre em Contato
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Tem alguma dúvida, sugestão ou quer saber mais sobre nossos mods? Estamos sempre felizes em ouvir da nossa comunidade!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contato Geral
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors duration-300">Email</p>
                        <a 
                          href="mailto:contact@eumarko.com" 
                          className="text-primary hover:text-primary/80 text-sm transition-colors"
                        >
                          contact@eumarko.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                      <Globe className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors duration-300">Website</p>
                        <a 
                          href="https://eumarko.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 text-sm transition-colors flex items-center gap-1"
                        >
                          eumarko.com
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Redes Sociais
                  </h3>
                  
                  <div className="space-y-3">
                    <a 
                      href="https://www.youtube.com/@eumarko" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30 hover:bg-red-500/10 hover:border-red-500/30 hover:scale-[1.02] transition-all duration-300 group"
                    >
                      <i className="fab fa-youtube w-5 h-5 text-red-500 group-hover:text-red-600 group-hover:scale-110 transition-all duration-300 flex-shrink-0"></i>
                      <div>
                        <p className="text-sm font-medium">YouTube</p>
                        <p className="text-xs text-muted-foreground">@eumarko</p>
                      </div>
                    </a>
                    
                    <a 
                      href="https://www.tiktok.com/@eumarko_" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30 hover:bg-pink-500/10 hover:border-pink-500/30 hover:scale-[1.02] transition-all duration-300 group"
                    >
                      <i className="fab fa-tiktok w-5 h-5 text-pink-500 group-hover:text-pink-600 group-hover:scale-110 transition-all duration-300 flex-shrink-0"></i>
                      <div>
                        <p className="text-sm font-medium">TikTok</p>
                        <p className="text-xs text-muted-foreground">@eumarko_</p>
                      </div>
                    </a>
                    
                    <a 
                      href="https://www.instagram.com/eumarko.ofc" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30 hover:bg-purple-500/10 hover:border-purple-500/30 hover:scale-[1.02] transition-all duration-300 group"
                    >
                      <i className="fab fa-instagram w-5 h-5 text-purple-500 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-300 flex-shrink-0"></i>
                      <div>
                        <p className="text-sm font-medium">Instagram</p>
                        <p className="text-xs text-muted-foreground">@eumarko.ofc</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutPage;