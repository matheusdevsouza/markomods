import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShieldX, 
  AlertTriangle, 
  Mail, 
  MessageCircle, 
  Home,
  LogOut,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextMods';
import { useNavigate } from 'react-router-dom';

const BannedPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [banInfo, setBanInfo] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!currentUser.is_banned) {
      navigate('/');
      return;
    }

    setBanInfo({
      reason: currentUser.ban_reason || 'Banimento administrativo',
      bannedAt: currentUser.banned_at || new Date().toISOString(),
      username: currentUser.username,
      displayName: currentUser.display_name
    });
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleContactSupport = () => {
    window.open('mailto:mods@eumarko.com?subject=Apelação de Banimento', '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser || !currentUser.is_banned) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900/20 via-gray-900 to-red-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="minecraft-card border-red-500/30 bg-red-500/5">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4"
            >
              <ShieldX className="w-10 h-10 text-red-400" />
            </motion.div>
            
            <CardTitle className="text-3xl font-minecraft text-red-400 mb-2">
              Conta Suspensa
            </CardTitle>
            
            <p className="text-muted-foreground text-lg">
              Sua conta foi permanentemente banida da plataforma Eu, Marko!
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <h3 className="font-semibold text-foreground mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                Informações da Conta
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Usuário:</strong> {banInfo?.displayName || banInfo?.username}</p>
                <p><strong>Username:</strong> @{banInfo?.username}</p>
                <p><strong>Data do Banimento:</strong> {formatDate(banInfo?.bannedAt)}</p>
              </div>
            </div>

            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
              <h3 className="font-semibold text-red-400 mb-2 flex items-center">
                <ShieldX className="w-4 h-4 mr-2" />
                Motivo do Banimento
              </h3>
              <p className="text-red-300 leading-relaxed">
                {banInfo?.reason}
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-orange-400" />
                Restrições Aplicadas
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Acesso à plataforma completamente bloqueado
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Todos os seus comentários foram ocultados
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Impossibilidade de postar novos comentários
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Download de mods bloqueado
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Upload de mods bloqueado
                </li>
              </ul>
            </div>

            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h3 className="font-semibold text-blue-400 mb-2 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Processo de Apelação
              </h3>
              <p className="text-blue-300 text-sm leading-relaxed mb-4">
                Se você acredita que este banimento foi aplicado incorretamente, 
                você pode entrar em contato conosco para solicitar uma revisão do caso.
              </p>
              <Button
                onClick={handleContactSupport}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contatar Suporte
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Fazer Logout
              </Button>
              
              <Button
                onClick={() => window.open('/', '_blank')}
                variant="outline"
                className="flex-1 border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
              >
                <Home className="w-4 h-4 mr-2" />
                Ver Site (Sem Login)
              </Button>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          <p>Eu, Marko! - Plataforma de Mods para Minecraft</p>
          <p className="mt-1">Para suporte, entre em contato: mods@eumarko.com</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BannedPage;

