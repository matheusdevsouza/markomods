import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  DownloadCloud, 
  BarChart3, 
  AlertCircle, 
  Shield, 
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
  const [mods, setMods] = useState([]);
  const [loadingMods, setLoadingMods] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchModsCount = async () => {
      try {
        setLoadingMods(true);
        
        console.log('🔍 AdminDashboard: Iniciando busca de contagem de mods...');
        
        const response = await fetch('/api/mods/stats/count');
        
        console.log('🔍 AdminDashboard: Resposta da rota /stats/count:', response.status, response.statusText);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ AdminDashboard: Contagem carregada:', data.data);
          
          const counts = data.data;
          setMods([{
            total: counts.total,
            published: counts.published,
            featured: counts.featured,
            draft: counts.draft,
            archived: counts.archived
          }]);
        } else {
          console.error('❌ AdminDashboard: Erro ao buscar contagem:', response.status);
          setMods([]);
        }
      } catch (error) {
        console.error('❌ AdminDashboard: Erro na busca da contagem:', error);
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
        const response = await fetch('/api/logs/recent', {
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
        console.error('Erro ao buscar atividade recente:', error);
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

  if (loadingMods) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard administrativo...</p>
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
  
  const totalDownloads = 0;
  const avgDownloadsPerMod = totalMods > 0 ? (totalDownloads / totalMods).toFixed(1) : 0;

  console.log('🔍 AdminDashboard: Estatísticas calculadas:', {
    totalMods,
    totalDownloads,
    featuredMods,
    publishedMods,
    pendingMods,
    draftMods,
    archivedMods,
    avgDownloadsPerMod,
    counts
  });


  const handleLogs = () => {
    navigate('/admin/logs');
  };

  const handleManageUsers = () => {
    navigate('/admin/users');
  };

  const handleManageMods = () => {
    navigate('/admin/mods');
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diff = now - logTime;
    
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} horas atrás`;
    return logTime.toLocaleDateString('pt-BR');
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
          <h1 className="text-2xl sm:text-3xl font-minecraft text-primary flex items-center gap-2 sm:gap-3 flex-wrap mb-2">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
            Dashboard Administrativo
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
            <p className="text-sm sm:text-base text-muted-foreground">
              Bem-vindo, {currentUser?.display_name || currentUser?.username}!
            </p>
            <Badge variant="outline" className="w-fit sm:ml-2">
              <Shield className="h-3 w-3 mr-1" />
              {currentUser?.role === 'super_admin' ? 'Super Administrador' : 'Administrador'}
            </Badge>
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
          title="Mods Publicados" 
          value={publishedMods} 
          icon={Eye} 
          color="text-green-500" 
          description={`${pendingMods} pendentes`}
        />
        <StatCard 
          title="Média Downloads/Mod" 
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