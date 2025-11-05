import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Shield, 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Lock, 
  Eye, 
  Database, 
  Users, 
  Globe,
  CheckCircle,
  AlertCircle,
  Info,
  FileText
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

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            {t('privacy.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('privacy.subtitle')}
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
            <Card className="minecraft-card bg-transparent border-border/50 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  1. {t('privacy.section1.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('privacy.section1.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    1.1 {t('privacy.section1.subsection1.title')}
                  </h3>
                  <div className="space-y-2">
                    {(t('privacy.section1.subsection1.items', { returnObjects: true }) || []).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{item.label}:</span> {item.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4 text-accent" />
                    1.2 {t('privacy.section1.subsection2.title')}
                  </h3>
                  <div className="space-y-2">
                    {(t('privacy.section1.subsection2.items', { returnObjects: true }) || []).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{item.label}:</span> {item.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="minecraft-card bg-transparent border-border/50 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  2. {t('privacy.section2.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('privacy.section2.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(t('privacy.section2.items', { returnObjects: true }) || []).map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="minecraft-card bg-transparent border-border/50 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  3. {t('privacy.section3.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('privacy.section3.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(t('privacy.section3.items', { returnObjects: true }) || []).map((item, index) => {
                    const icons = [Users, Shield, CheckCircle];
                    const Icon = icons[index];
                    return (
                      <div key={index} className="text-center p-4 bg-transparent rounded-lg border border-border/30">
                        <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="minecraft-card bg-transparent border-border/50 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  4. {t('privacy.section4.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('privacy.section4.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(t('privacy.section4.items', { returnObjects: true }) || []).map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-transparent rounded-lg border border-border/30">
                      <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="minecraft-card bg-transparent border-border/50 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  5. {t('privacy.section5.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('privacy.section5.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4">
                  {(t('privacy.section5.items', { returnObjects: true }) || []).map((cookie, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-transparent rounded-lg border border-border/30">
                      <div className={`w-3 h-3 rounded-full ${cookie.color} mt-1.5 flex-shrink-0`}></div>
                      <div>
                        <h3 className="font-semibold text-sm">{cookie.type}</h3>
                        <p className="text-xs text-muted-foreground">{cookie.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <Info className="w-4 h-4 inline mr-1" />
                    {t('privacy.section5.manageCookies')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="minecraft-card bg-transparent border-border/50 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  6. {t('privacy.section6.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('privacy.section6.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(t('privacy.section6.items', { returnObjects: true }) || []).map((item, index) => (
                    <div key={index} className="p-3 bg-transparent rounded-lg border border-border/30">
                      <h3 className="font-semibold text-sm text-primary mb-1">{item.right}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
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
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  7. {t('privacy.section7.title')}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('privacy.section7.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                    <Mail className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">{t('privacy.section7.email')}</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="mailto:contact@eumarko.com" className="text-primary hover:text-primary/80">
                        contact@eumarko.com
                      </a>
                    </p>
                  </div>
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                    <Globe className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">{t('privacy.section7.website')}</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="https://eumarko.com" className="text-primary hover:text-primary/80">
                        eumarko.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('privacy.section7.responsible')}:</strong> {t('privacy.section7.responsibleName')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <div className="text-center p-4 bg-card/50 rounded-lg border border-border/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">{t('privacy.lastUpdate')}:</span>
              </div>
              <p className="text-muted-foreground">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicyPage;