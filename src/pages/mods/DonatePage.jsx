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
  Gift,
  Coins,
  Sparkles,
  Coffee,
  MessageSquare,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();
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
  const qrCodeUrl = '/qr-marko.jpg';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(livepixUrl);
    setCopied(true);
    toast.success(t('donate.copySuccess'));
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    {
      icon: Heart,
      title: t('donate.benefits.1.title'),
      description: t('donate.benefits.1.desc')
    },
    {
      icon: Gift,
      title: t('donate.benefits.2.title'),
      description: t('donate.benefits.2.desc')
    },
    {
      icon: Sparkles,
      title: t('donate.benefits.4.title'),
      description: t('donate.benefits.4.desc')
    }
  ];

  const faqs = [
    {
      id: 1,
      question: t('donate.faq.q1'),
      answer: t('donate.faq.a1')
    },
    {
      id: 2,
      question: t('donate.faq.q2'),
      answer: t('donate.faq.a2')
    },
    {
      id: 3,
      question: t('donate.faq.q3'),
      answer: t('donate.faq.a3')
    },
    {
      id: 4,
      question: t('donate.faq.q4'),
      answer: t('donate.faq.a4')
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
              {t('donate.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('donate.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-20 md:items-stretch">
            <motion.div variants={itemVariants} className="flex flex-col">
              <motion.div variants={itemVariants} className="mb-6">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('common.back')}
                </Link>
              </motion.div>
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 flex flex-col flex-1">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                        <Coins className="h-6 w-6 text-primary" />
                        {t('donate.card.title')}
                      </CardTitle>
                      <CardDescription>
                        {t('donate.card.desc')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col">
                  <div className="flex flex-col items-center space-y-6 flex-1">
                    <div className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-primary/30">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code LivePix"
                        className="w-64 h-64"
                      />
                    </div>
                    
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground text-center mb-3">
                        {t('donate.qrHint')}
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

            <motion.div variants={itemVariants} className="flex flex-col md:mt-[52px]">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 flex flex-col flex-1">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    <Gift className="h-6 w-6 text-primary" />
                    {t('donate.whyDonate.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('donate.whyDonate.desc')}
                  </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4 flex-1 flex flex-col">
                   <div className="flex-1 flex flex-col justify-start">
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
                   </div>
                 </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl mb-4 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  {t('donate.faq.title')}
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
              <h3 className="text-2xl font-bold mb-2">{t('donate.thankYou.title')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('donate.thankYou.desc')}
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{t('donate.footer')}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonatePage;

