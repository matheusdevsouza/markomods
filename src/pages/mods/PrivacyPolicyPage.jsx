import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-4 sm:mb-6">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-minecraft text-primary mb-3 sm:mb-4">
            Política de Privacidade
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Entenda como coletamos, usamos e protegemos suas informações pessoais
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
            <Card className="minecraft-card bg-transparent border-border/50 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  1. Informações que Coletamos
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Coletamos informações que você nos dá diretamente e informações que coletamos automaticamente quando você usa nossos serviços.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    1.1 Informações que você nos fornece:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Dados de conta:</span> Nome de usuário, endereço de e-mail, senha e informações de perfil
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Comentários:</span> Comentários e avaliações que você deixa nos mods
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Comunicações:</span> Emails que você nos envia para contato
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4 text-accent" />
                    1.2 Informações coletadas automaticamente:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Dados de uso:</span> Downloads realizados e mods favoritados
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Informações técnicas:</span> Endereço IP, tipo de navegador, sistema operacional
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Cookies:</span> Utilizamos cookies para melhorar sua experiência e analisar o uso do site
                      </div>
                    </div>
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
                  2. Como Utilizamos suas Informações
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Utilizamos suas informações para fornecer e melhorar nossos serviços
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'Fornecer acesso aos mods e funcionalidades do site',
                    'Processar downloads e gerenciar sua conta de usuário',
                    'Permitir comentários e avaliações nos mods',
                    'Manter histórico de downloads e favoritos',
                    'Garantir a segurança da plataforma',
                    'Responder a emails de contato'
                  ].map((item, index) => (
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
                  3. Compartilhamento de Informações
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Não vendemos suas informações pessoais. Compartilhamos apenas nas situações descritas abaixo.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Comentários públicos</h3>
                    <p className="text-xs text-muted-foreground">Seus comentários nos mods são visíveis para outros usuários</p>
                  </div>
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Obrigações legais</h3>
                    <p className="text-xs text-muted-foreground">Quando exigido por lei ou para proteger direitos</p>
                  </div>
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30">
                    <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Consentimento</h3>
                    <p className="text-xs text-muted-foreground">Quando você nos dá permissão explícita</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="minecraft-card bg-transparent border-border/50 hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  4. Segurança dos Dados
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    'Criptografia SSL/TLS para transmissão de dados',
                    'Senhas criptografadas com hash seguro',
                    'Acesso restrito aos dados pessoais',
                    'Monitoramento regular de segurança',
                    'Backups seguros dos dados',
                    'Auditorias de segurança periódicas'
                  ].map((item, index) => (
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
                  5. Cookies e Tecnologias Similares
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Utilizamos cookies para melhorar sua experiência e analisar o uso do site
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4">
                  {[
                    { type: 'Cookies essenciais', desc: 'Necessários para o funcionamento básico do site', color: 'bg-red-500' },
                    { type: 'Cookies de funcionalidade', desc: 'Para lembrar suas preferências', color: 'bg-blue-500' },
                    { type: 'Cookies analíticos', desc: 'Para entender como você usa nosso site', color: 'bg-green-500' },
                    { type: 'Cookies de marketing', desc: 'Para personalizar anúncios (quando aplicável)', color: 'bg-purple-500' }
                  ].map((cookie, index) => (
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
                    Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
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
                  6. Seus Direitos
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Você tem direitos sobre suas informações pessoais conforme a LGPD
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { right: 'Acesso', desc: 'Ver quais dados temos sobre você' },
                    { right: 'Correção', desc: 'Corrigir informações incorretas no seu perfil' },
                    { right: 'Exclusão', desc: 'Solicitar a remoção de sua conta e dados' },
                    { right: 'Download', desc: 'Baixar seus dados em formato legível' },
                    { right: 'Oposição', desc: 'Se opor ao uso de seus dados' },
                    { right: 'Contato', desc: 'Entrar em contato para exercer seus direitos' }
                  ].map((item, index) => (
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
                  7. Contato
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                    <Mail className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href="mailto:contact@eumarko.com" className="text-primary hover:text-primary/80">
                        contact@eumarko.com
                      </a>
                    </p>
                  </div>
                  <div className="text-center p-4 bg-transparent rounded-lg border border-border/30 hover:bg-primary/10 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                    <Globe className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors duration-300">Site</h3>
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

export default PrivacyPolicyPage;