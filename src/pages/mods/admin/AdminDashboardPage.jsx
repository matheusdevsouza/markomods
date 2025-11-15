import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Package, 
  DownloadCloud, 
  BarChart3, 
  AlertCircle, 
  Activity,
  TrendingUp,
  Eye,
  Star,
  Clock,
  Database,
  Server,
  Globe,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextMods';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import RoleBadge from '@/components/mods/RoleBadge';

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="minecraft-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-minecraft uppercase text-muted-foreground">{title}</CardTitle>
        <div className={`p-1.5 sm:p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{value}</div>
        {description && <p className="text-xs text-muted-foreground mb-2">{description}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

const QuickActionCard = ({ title, description, icon: Icon, action, variant = "default" }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card className="minecraft-card cursor-pointer hover:shadow-lg transition-all duration-300" onClick={action}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`p-2 sm:p-3 rounded-lg bg-${variant === "default" ? "primary" : variant}/10`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${variant === "default" ? "primary" : variant}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const AdminDashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [mods, setMods] = useState([]);
  const [loadingMods, setLoadingMods] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchModsCount = async () => {
      try {
        setLoadingMods(true);
        
        const response = await fetch('/api/mods/stats/count');

        if (response.ok) {
          const data = await response.json();
          const counts = data.data || {};
          const avgDownloads = counts.avgDownloadsPerMod !== null && counts.avgDownloadsPerMod !== undefined
            ? parseFloat(counts.avgDownloadsPerMod)
            : 0;
          
          setMods([{
            total: counts.total || 0,
            published: counts.published || 0,
            featured: counts.featured || 0,
            draft: counts.draft || 0,
            archived: counts.archived || 0,
            totalDownloads: counts.totalDownloads || 0,
            avgDownloadsPerMod: avgDownloads
          }]);
        } else {
          setMods([]);
        }
      } catch (error) {
        setMods([]);
      } finally {
        setLoadingMods(false);
      }
    };

    fetchModsCount();
  }, [currentUser]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/logs/recent?roleFilter=admin', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRecentActivity(data.data || []);
        }
      } catch (error) {
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchRecentActivity();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">❌</div>
          <p className="text-muted-foreground">Usuário não autenticado</p>
          <p className="text-sm text-muted-foreground">Faça login para acessar o dashboard</p>
        </div>
      </div>
    );
  }


  const counts = mods[0] || {};
  const totalMods = counts.total || 0;
  const publishedMods = counts.published || 0;
  const featuredMods = counts.featured || 0;
  const draftMods = counts.draft || 0;
  const archivedMods = counts.archived || 0;
  const pendingMods = draftMods;
  
  const totalDownloads = counts.totalDownloads !== null && counts.totalDownloads !== undefined 
    ? parseInt(counts.totalDownloads) 
    : 0;
  const avgDownloadsPerMod = counts.avgDownloadsPerMod !== null && counts.avgDownloadsPerMod !== undefined 
    ? parseFloat(counts.avgDownloadsPerMod).toFixed(1) 
    : '0.0';

  const handleLogs = () => {
    if (!hasPermission('view_logs')) {
      toast.error('Acesso Negado', {
        description: 'Você não tem permissão para acessar "Visualizar Logs". Entre em contato com um administrador se precisar desta funcionalidade.',
        duration: 5000,
      });
      return;
    }
    navigate('/admin/logs');
  };

  const handleManageUsers = () => {
    if (!hasPermission('manage_users')) {
      toast.error('Acesso Negado', {
        description: 'Você não tem permissão para acessar "Gerenciar Usuários". Entre em contato com um administrador se precisar desta funcionalidade.',
        duration: 5000,
      });
      return;
    }
    navigate('/admin/users');
  };

  const handleManageMods = () => {
    if (!hasPermission('view_mods')) {
      toast.error('Acesso Negado', {
        description: 'Você não tem permissão para acessar "Visualizar Mods". Entre em contato com um administrador se precisar desta funcionalidade.',
        duration: 5000,
      });
      return;
    }
    navigate('/admin/mods');
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Data inválida';
    
    const now = new Date();
    let logTime;
    
    if (typeof timestamp === 'string') {
      if (timestamp.includes('T') && !timestamp.includes('Z') && !timestamp.includes('+')) {
        logTime = new Date(timestamp + 'Z');
      } else {
        logTime = new Date(timestamp);
      }
    } else {
      logTime = new Date(timestamp);
    }
    
    if (isNaN(logTime.getTime())) {
      return 'Data inválida';
    }
    
    const diff = now.getTime() - logTime.getTime();
    
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} min atrás`;
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    }
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    }
    
    return logTime.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'success':
        return <Star className="h-3 w-3 text-green-500" />;
      case 'info':
        return <Info className="h-3 w-3 text-blue-500" />;
      default:
        return <Info className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 sm:space-y-8 p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent flex items-center gap-3">
            <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            Dashboard Administrativo
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
            <p className="text-lg md:text-xl text-muted-foreground">
              Bem-vindo, <strong>{currentUser?.display_name || currentUser?.username}</strong>!
            </p>
            {currentUser?.role && ['admin', 'supervisor', 'moderator'].includes(currentUser.role) && (
              <div className="w-fit sm:ml-2">
                <RoleBadge role={currentUser.role} className="w-fit" />
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogs}
            className="hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300 w-full sm:w-auto"
          >
            <Activity className="h-4 w-4 mr-2" />
            Logs
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total de Mods" 
          value={totalMods} 
          icon={Package} 
          color="text-purple-500" 
          description={`${featuredMods} em destaque`}
        />
        <StatCard 
          title="Total de Downloads" 
          value={totalDownloads.toLocaleString('pt-BR')} 
          icon={DownloadCloud} 
          color="text-blue-500" 
          description="Downloads de todos os mods"
        />
        <StatCard 
          title="MODS PUBLICADOS" 
          value={publishedMods} 
          icon={Eye} 
          color="text-green-500" 
          description={`${pendingMods} pendentes`}
        />
        <StatCard 
          title="MÉDIA DOWNLOADS/MOD" 
          value={avgDownloadsPerMod} 
          icon={BarChart3} 
          color="text-yellow-500" 
          description="Média geral"
        />
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-minecraft text-primary mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <QuickActionCard
            title="Gerenciar Usuários"
            description="Ver, editar e gerenciar usuários da plataforma"
            icon={Users}
            action={handleManageUsers}
            variant="blue"
          />
          <QuickActionCard
            title="Gerenciar Mods"
            description="Editar, publicar e configurar mods do Marko"
            icon={Package}
            action={handleManageMods}
            variant="green"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-minecraft text-primary mb-4">Atividade Recente</h2>
        <Card className="minecraft-card">
          <CardContent className="p-3 sm:p-4">
            {loadingActivity ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando atividade recente...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start sm:items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      {getLevelIcon(activity.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        por {activity.display_name || activity.username || 'Sistema'} • {formatTimestamp(activity.created_at)}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground mt-1 italic break-words">
                          {activity.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;