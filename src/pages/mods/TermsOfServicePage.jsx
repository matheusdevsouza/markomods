import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto prose prose-sm sm:prose-base lg:prose-lg prose-invert 
                 prose-headings:font-minecraft prose-headings:text-primary 
                 prose-p:text-foreground/90 prose-a:text-accent prose-a:font-semibold hover:prose-a:text-accent/80
                 prose-strong:text-foreground prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-primary"
    >
      <Button variant="ghost" asChild className="inline-flex items-center text-primary hover:text-primary/80 mb-6 group minecraft-btn -ml-4 bg-background/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 px-4 py-2 rounded-lg">
        <Link to="/" className="flex items-center">
          <ArrowLeft size={18} className="mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="font-medium">Voltar</span>
        </Link>
      </Button>

      <div className="flex items-center mb-6">
        <FileText size={36} className="mr-4 text-primary" />
        <h1 className="font-minecraft text-4xl text-primary !mb-0">Termos de Uso</h1>
      </div>

      <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <h2>1. Aceitação dos Termos</h2>
      <p>Ao acessar e usar a plataforma de mods "Eu, Marko!" (o "Site"), você concorda em cumprir estes Termos de Uso ("Termos"). Se você não concorda com estes Termos, não use o Site.</p>

      <h2>2. Uso do Site</h2>
      <p>Você concorda em usar o Site apenas para fins legais e de acordo com estes Termos. Você não deve usar o Site de qualquer forma que possa danificar, desabilitar, sobrecarregar ou prejudicar o Site, ou interferir no uso de qualquer outra parte do Site.</p>
      
      <h2>3. Conteúdo do Usuário</h2>
      <p>Se você enviar comentários ou outro conteúdo para o Site ("Conteúdo do Usuário"), você concede a "Eu, Marko!" uma licença mundial, não exclusiva, isenta de royalties, para usar, reproduzir, modificar, adaptar, publicar, traduzir, criar trabalhos derivados, distribuir e exibir tal Conteúdo do Usuário.</p>
      <p>Você declara e garante que possui ou controla todos os direitos sobre o Conteúdo do Usuário e que o Conteúdo do Usuário não viola estes Termos ou os direitos de terceiros.</p>

      <h2>4. Propriedade Intelectual</h2>
      <p>O Site e seu conteúdo original (excluindo Conteúdo do Usuário), características e funcionalidades são e permanecerão propriedade exclusiva de "Eu, Marko!" e seus licenciadores. Os mods disponibilizados são de propriedade de seus respectivos criadores, e "Eu, Marko!" atua como uma plataforma de distribuição.</p>

      <h2>5. Isenção de Garantias</h2>
      <p>O Site é fornecido "COMO ESTÁ" e "CONFORME DISPONÍVEL". "Eu, Marko!" não oferece garantias, expressas ou implícitas, sobre a operação do Site ou as informações, conteúdo ou materiais incluídos no Site. Você concorda expressamente que o uso do Site é por sua conta e risco.</p>
      <p>Os mods são fornecidos por terceiros e "Eu, Marko!" não garante sua funcionalidade, segurança ou compatibilidade. Use mods por sua conta e risco.</p>

      <h2>6. Limitação de Responsabilidade</h2>
      <p>Em nenhuma circunstância "Eu, Marko!" será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou incapacidade de usar o Site ou os mods baixados através dele.</p>

      <h2>7. Alterações nos Termos</h2>
      <p>"Eu, Marko!" reserva-se o direito de modificar estes Termos a qualquer momento. Notificaremos sobre quaisquer alterações publicando os novos Termos no Site. Seu uso continuado do Site após tais alterações constitui sua aceitação dos novos Termos.</p>

      <h2>8. Contato</h2>
      <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em <a href="mailto:contato@eumarko.com">contato@eumarko.com</a>.</p>
      
    </motion.div>
  );
};

export default TermsOfServicePage;