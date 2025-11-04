import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  ArrowLeft, 
  Copy,
  Check,
  Globe,
  Shield,
  Gift,
  Coins,
  Sparkles,
  Users,
  Coffee,
  MessageSquare,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

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

const DonatePage = () => {
  const [copied, setCopied] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  React.useEffect(() => {
    setPageLoaded(true);
  }, []);

  const handleFaqToggle = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const renderAnswerWithLinks = (answer) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = answer.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-purple-600 underline font-medium transition-colors"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const livepixUrl = 'https://livepix.gg/eumarko';
  const qrPrimary = '/assets/images/qr-marko.jpg';
  const qrFallback = '/qr%20marko.jpg';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(livepixUrl);
    setCopied(true);
    toast.success('Link do LivePix copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    {
      icon: Heart,
      title: 'Ajude a Manter o Site',
      description: 'Suas doações ajudam a manter o site e a continuar criando mods incríveis!'
    },
    {
      icon: Gift,
      title: 'Suporte ao Desenvolvimento',
      description: 'Apoie o desenvolvimento de novos mods.'
    },
    {
      icon: Sparkles,
      title: 'Espia de Futuros Mods',
      description: 'Receba spoilers de mods em desenvolvimento e participe de enquetes para decidir o próximo mod!'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Tenha acesso a um canal exclusivo para doadores em nosso Discord.'
    }
  ];

  const faqs = [
    {
      id: 1,
      question: 'Como funciona a doação?',
      answer: 'Você pode doar qualquer valor através do LivePix. Basta acessar o link https://livepix.gg/eumarko ou escanear o QR Code disponível na página.'
    },
    {
      id: 2,
      question: 'É seguro doar?',
      answer: 'Sim! O LivePix é uma plataforma segura e confiável. Todas as transações são processadas de forma segura e protegida.'
    },
    {
      id: 3,
      question: 'Posso doar qualquer valor?',
      answer: 'Sim! Não há valor mínimo ou máximo. Qualquer contribuição é muito bem-vinda e apreciada!'
    },
    {
      id: 4,
      question: 'Vou receber algo em troca?',
      answer: 'Cada doador recebe nossa gratidão eterna! Também pode ter acesso a funcionalidades especiais.'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              Apoie a plataforma de mods!
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Sua contribuição ajuda a manter o site, criar novos mods e continuar inovando para você!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                        <Coins className="h-6 w-6 text-primary" />
                        Doar pelo LivePix
                      </CardTitle>
                      <CardDescription>
                        Abra o link ou escaneie o QR Code
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-primary/30">
                      <img
                        src={qrPrimary}
                        alt="QR Code LivePix"
                        className="w-64 h-64"
                        onError={(e) => { e.currentTarget.src = qrFallback; }}
                      />
                    </div>
                    
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground text-center mb-3">
                        Escaneie com o app do seu banco ou clique no link abaixo
                      </p>
                      <div className="relative">
                        <a 
                          href={livepixUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block group"
                        >
                          <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 hover:from-primary/20 hover:to-purple-600/20 rounded-lg p-4 font-mono text-sm break-all text-primary hover:text-primary/80 transition-all duration-200 border border-primary/20 group-hover:border-primary/40">
                            {livepixUrl}
                          </div>
                        </a>
                        <Button
                          onClick={copyToClipboard}
                          className="absolute top-2 right-2"
                          size="sm"
                          variant="outline"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    <Gift className="h-6 w-6 text-primary" />
                    Por que doar?
                  </CardTitle>
                  <CardDescription>
                    Veja como sua contribuição faz diferença
                  </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                   {benefits.map((benefit, index) => (
                     <motion.div
                       key={index}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.3 + index * 0.1 }}
                       className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                     >
                       <div className="flex-shrink-0 flex items-start pt-0.5">
                         <div className="p-2 rounded-lg bg-primary/10">
                           <benefit.icon className="h-5 w-5 text-primary" />
                         </div>
                       </div>
                       <div>
                         <h3 className="font-semibold mb-1">{benefit.title}</h3>
                         <p className="text-sm text-muted-foreground">{benefit.description}</p>
                       </div>
                     </motion.div>
                   ))}
                 </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl mb-4 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Perguntas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + faq.id * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <div
                        className="p-4 sm:p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleFaqToggle(faq.id)}
                      >
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold leading-tight">{faq.question}</h3>
                          </div>
                          <div className="flex-shrink-0">
                            {expandedFaq === faq.id ? (
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ 
                            height: expandedFaq === faq.id ? 'auto' : 0,
                            opacity: expandedFaq === faq.id ? 1 : 0
                          }}
                          transition={{ 
                            duration: 0.3,
                            ease: 'easeInOut'
                          }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                              {renderAnswerWithLinks(faq.answer)}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <div className="p-8 rounded-xl bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20">
              <Coffee className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Muito Obrigado!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Cada contribuição, não importa o valor, nos ajuda a continuar criando conteúdos incríveis para vocês. 
                Sua doação faz toda a diferença! ❤️
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Suas doações ajudam a manter o site 100% gratuito para todos</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonatePage;

