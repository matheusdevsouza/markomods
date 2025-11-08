import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
  
  const terms = [
    {
      id: 1,
      titleKey: 'terms.section1.title',
      icon: CheckCircle,
      color: 'bg-green-500',
      contentKey: 'terms.section1.content',
      detailsKey: 'terms.section1.details'
    },
    {
      id: 2,
      titleKey: 'terms.section2.title',
      icon: Globe,
      color: 'bg-blue-500',
      contentKey: 'terms.section2.content',
      detailsKey: 'terms.section2.details'
    },
    {
      id: 3,
      titleKey: 'terms.section3.title',
      icon: Users,
      color: 'bg-purple-500',
      contentKey: 'terms.section3.content',
      detailsKey: 'terms.section3.details'
    },
    {
      id: 4,
      titleKey: 'terms.section4.title',
      icon: Lock,
      color: 'bg-orange-500',
      contentKey: 'terms.section4.content',
      detailsKey: 'terms.section4.details'
    },
    {
      id: 5,
      titleKey: 'terms.section5.title',
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      contentKey: 'terms.section5.content',
      detailsKey: 'terms.section5.details'
    },
    {
      id: 6,
      titleKey: 'terms.section6.title',
      icon: Shield,
      color: 'bg-red-500',
      contentKey: 'terms.section6.content',
      detailsKey: 'terms.section6.details'
    },
    {
      id: 7,
      titleKey: 'terms.section7.title',
      icon: Scale,
      color: 'bg-indigo-500',
      contentKey: 'terms.section7.content',
      detailsKey: 'terms.section7.details'
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
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
              <FileText className="h-10 w-10 text-white" />
      </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            {t('terms.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('terms.subtitle')}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          <motion.div variants={itemVariants}>
            <Card className="minecraft-card bg-transparent border-primary/20 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  {t('terms.introduction.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('terms.introduction.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  {t('terms.introduction.content')}
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
                    {term.id}. {t(term.titleKey)}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {t(term.contentKey)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3">
                    {(t(term.detailsKey, { returnObjects: true }) || []).map((detail, index) => (
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
                  8. {t('terms.contact.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('terms.contact.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                    <Mail className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">{t('terms.contact.email')}</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="mailto:mods@eumarko.com" className="text-primary hover:text-primary/80">
                        mods@eumarko.com 
                      </a>
                    </p>
                  </div>
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                    <Globe className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">{t('terms.contact.website')}</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="https://eumarko.com" className="text-primary hover:text-primary/80">
                        eumarko.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('terms.contact.responsible')}:</strong> {t('terms.contact.responsibleName')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <div className="text-center p-4 bg-card/50 rounded-lg border border-border/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">{t('terms.lastUpdate')}:</span>
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