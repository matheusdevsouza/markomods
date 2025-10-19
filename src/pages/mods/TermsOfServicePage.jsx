import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ArrowLeft, 
  Shield, 
  Users, 
  AlertTriangle, 
  Scale, 
  Mail, 
  Calendar,
  CheckCircle,
  Globe,
  Lock,
  Eye
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const TermsOfServicePage = () => {
  const terms = [
    {
      id: 1,
      title: 'Aceitação dos Termos',
      icon: CheckCircle,
      color: 'bg-green-500',
      content: 'Ao acessar e usar a plataforma "Eu, Marko!", você concorda em seguir estes Termos de Uso. Se você não concorda com estes termos, não use o site.',
      details: [
        'Usar o site significa que você aceita os termos automaticamente',
        'Estes termos se aplicam a todos os usuários',
        'Você precisa aceitar para usar a plataforma'
      ]
    },
    {
      id: 2,
      title: 'Uso do Site',
      icon: Globe,
      color: 'bg-blue-500',
      content: 'Você concorda em usar o site apenas para fins legais e de acordo com estes termos. Não deve usar o site de forma que possa prejudicar ou danificar o funcionamento.',
      details: [
        'Use apenas para fins legais',
        'Não pode danificar ou sobrecarregar o sistema',
        'Respeite outros usuários da plataforma',
        'Não interfira no funcionamento do site'
      ]
    },
    {
      id: 3,
      title: 'Conteúdo do Usuário',
      icon: Users,
      color: 'bg-purple-500',
      content: 'Se você enviar comentários ou outro conteúdo, você nos dá permissão para usar, reproduzir e distribuir esse conteúdo.',
      details: [
        'Permissão mundial e não exclusiva',
        'Podemos modificar e adaptar o conteúdo',
        'Você continua sendo dono do seu conteúdo',
        'O conteúdo não pode violar direitos de outras pessoas'
      ]
    },
    {
      id: 4,
      title: 'Propriedade Intelectual',
      icon: Lock,
      color: 'bg-orange-500',
      content: 'O site e todos os mods disponíveis aqui pertencem ao Marko! São criações originais feitas com muito carinho.',
      details: [
        'O site pertence ao Eu, Marko!',
        'Todos os mods são criações originais do Marko',
        'Cada mod é feito pensando na diversão dos jogadores',
        'Respeitamos os direitos do Minecraft e Mojang'
      ]
    },
    {
      id: 5,
      title: 'Isenção de Garantias',
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      content: 'Nossos mods são feitos com muito carinho, mas não podemos garantir que funcionarão perfeitamente em todos os casos.',
      details: [
        'Testamos todos os mods antes de disponibilizar',
        'Mas cada computador é diferente',
        'Você usa os mods por sua conta e risco',
        'Se der problema, nos avise que tentamos ajudar!'
      ]
    },
    {
      id: 6,
      title: 'Limitação de Responsabilidade',
      icon: Shield,
      color: 'bg-red-500',
      content: 'Se algo der errado com seus mods ou computador, não podemos ser responsáveis pelos danos.',
      details: [
        'Não somos responsáveis por danos no seu computador',
        'Não somos responsáveis por perda de dados',
        'Não somos responsáveis por problemas com outros mods',
        'Você assume todos os riscos ao usar nossos mods'
      ]
    },
    {
      id: 7,
      title: 'Alterações nos Termos',
      icon: Scale,
      color: 'bg-indigo-500',
      content: 'Podemos mudar estes termos quando necessário. Se você continuar usando o site, significa que aceita as mudanças.',
      details: [
        'Podemos atualizar os termos quando precisar',
        'Avisaremos sobre mudanças importantes',
        'Continuar usando = aceitar as mudanças',
        'Mudanças podem acontecer a qualquer momento'
      ]
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen py-8 sm:py-12"
    >
      <div className="container mx-auto px-4">
        <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-4 sm:mb-6">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
      </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-minecraft text-primary mb-3 sm:mb-4">
            Termos de Uso
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            As regras para usar nossa plataforma de mods do Marko
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          <motion.div variants={itemVariants}>
            <Card className="minecraft-card bg-transparent border-primary/20 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  Introdução
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Olá! Estes termos explicam como você pode usar nossa plataforma de mods.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  Estes termos explicam como você pode usar a plataforma "Eu, Marko!" para baixar e usar nossos mods incríveis. 
                  Ao usar nosso site, você concorda em seguir estas regras. 
                  Se você não concorda com alguma coisa, é só não usar o site.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {terms.map((term) => (
            <motion.div key={term.id} variants={itemVariants}>
              <Card className="minecraft-card bg-transparent border-border/50 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                    <term.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    {term.id}. {term.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {term.content}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3">
                    {term.details.map((detail, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div variants={itemVariants}>
            <Card className="minecraft-card bg-transparent border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  8. Contato
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Tem alguma dúvida sobre estes termos? Entre em contato conosco!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                    <Mail className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="mailto:mods@eumarko.com" className="text-primary hover:text-primary/80">
                        mods@eumarko.com 
                      </a>
                    </p>
                  </div>
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                    <Globe className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">Website</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="https://eumarko.com" className="text-primary hover:text-primary/80">
                        eumarko.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong>Responsável:</strong> Eu, Marko!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <div className="text-center p-4 bg-card/50 rounded-lg border border-border/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Última atualização:</span>
              </div>
              <p className="text-muted-foreground">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsOfServicePage;