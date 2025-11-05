import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../../../hooks/useTranslation';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Database,
  Shield,
  Package,
  Calendar,
  BarChart3,
  FileText,
  Trash2,
  Eye,
  Heart,
  MessageSquare,
  Star,
  Share2,
  Upload,
  Ban,
  UserCheck,
  Settings,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

const AdminLogsPage = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchSummary();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
        setFilteredLogs(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/logs/summary?period=24h', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    }
  };

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.display_name && log.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    if (selectedResourceType !== 'all') {
      filtered = filtered.filter(log => log.resource_type === selectedResourceType);
    }

    if (dateFrom) {
      filtered = filtered.filter(log => new Date(log.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(log => new Date(log.created_at) <= new Date(dateTo));
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedLevel, selectedCategory, selectedResourceType, dateFrom, dateTo]);

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level) => {
    const variants = {
      error: 'destructive',
      warning: 'secondary',
      success: 'default',
      info: 'outline'
    };

    return (
      <Badge variant={variants[level] || 'outline'} className="capitalize">
        {level}
      </Badge>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'auth':
        return <Shield className="h-4 w-4" />;
      case 'mods':
        return <Package className="h-4 w-4" />;
      case 'users':
        return <User className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'system':
        return <Activity className="h-4 w-4" />;
      case 'comments':
        return <MessageSquare className="h-4 w-4" />;
      case 'favorites':
        return <Heart className="h-4 w-4" />;
      case 'downloads':
        return <Download className="h-4 w-4" />;
      case 'admin':
        return <Settings className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getResourceTypeIcon = (resourceType) => {
    switch (resourceType) {
      case 'mod':
        return <Package className="h-3 w-3" />;
      case 'user':
        return <User className="h-3 w-3" />;
      case 'comment':
        return <MessageSquare className="h-3 w-3" />;
      case 'file':
        return <FileText className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
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

  const handleRefresh = async () => {
    await fetchLogs();
    await fetchSummary();
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        level: selectedLevel,
        category: selectedCategory,
        search: searchTerm,
        dateFrom,
        dateTo,
        format: 'csv'
      });

      const response = await fetch(`/api/logs/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('all');
    setSelectedCategory('all');
    setSelectedResourceType('all');
    setDateFrom('');
    setDateTo('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Carregando logs do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-8 p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Logs do Sistema
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Monitore todas as atividades e eventos da plataforma Eu, Marko!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:space-y-0">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="hover:bg-muted/50 text-sm sm:text-base"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={handleExport}
            className="bg-primary hover:bg-primary/90 text-sm sm:text-base"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {summary && (
        <Card className="minecraft-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
              Resumo das Últimas 24 Horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-primary">{summary.total}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total de Logs</div>
              </div>
              {Object.entries(summary.byCategory).map(([category, count]) => (
                <div key={category} className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{count}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground capitalize">{category}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="minecraft-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm sm:text-base">Buscar nos Logs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por mensagem, usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level" className="text-sm sm:text-base">Nível</Label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background text-sm sm:text-base"
              >
                <option value="all">Todos os Níveis</option>
                <option value="error">Erro</option>
                <option value="warning">Aviso</option>
                <option value="success">Sucesso</option>
                <option value="info">Informação</option>
              </select>
            </div>
            
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="category" className="text-sm sm:text-base">Categoria</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background text-sm sm:text-base"
              >
                <option value="all">Todas as Categorias</option>
                <option value="auth">Autenticação</option>
                <option value="mods">Mods</option>
                <option value="users">Usuários</option>
                <option value="security">Segurança</option>
                <option value="system">Sistema</option>
                <option value="comments">{t('modDetail.comments')}</option>
                <option value="favorites">Favoritos</option>
                <option value="downloads">Downloads</option>
                <option value="admin">Administração</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full text-sm sm:text-base"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Ocultar' : 'Mostrar'} Filtros Avançados
            </Button>

            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="resourceType" className="text-sm sm:text-base">Tipo de Recurso</Label>
                  <select
                    id="resourceType"
                    value={selectedResourceType}
                    onChange={(e) => setSelectedResourceType(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background text-sm sm:text-base"
                  >
                    <option value="all">Todos os Recursos</option>
                    <option value="mod">Mod</option>
                    <option value="user">Usuário</option>
                    <option value="comment">Comentário</option>
                    <option value="file">Arquivo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="text-sm sm:text-base">Data de Início</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="text-sm sm:text-base">Data de Fim</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
              <span>Total de logs: {filteredLogs.length}</span>
              <span className="hidden sm:inline">Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
              <span className="sm:hidden">Atualizado: {new Date().toLocaleTimeString('pt-BR')}</span>
            </div>
            <Button variant="outline" onClick={clearFilters} size="sm" className="text-sm">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
            
      <Card className="minecraft-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
            Logs do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Activity className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Nenhum log encontrado com os filtros atuais</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getLevelIcon(log.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-2">
                        {getLevelBadge(log.level)}
                        <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                          {getCategoryIcon(log.category)}
                          <span className="capitalize">{log.category}</span>
                        </Badge>
                        {log.resource_type && (
                          <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                            {getResourceTypeIcon(log.resource_type)}
                            <span className="text-xs">{log.resource_type}</span>
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(log.created_at)}
                        </span>
                      </div>
                      
                      <p className="font-medium text-sm sm:text-base text-foreground mb-2">
                        {log.action}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {log.username || log.display_name || 'Sistema'}
                        </span>
                        {log.ip_address && log.ip_address !== 'N/A' && (
                          <span className="flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            {log.ip_address}
                          </span>
                        )}
                        {log.resource_id && (
                          <span className="flex items-center">
                            <Database className="h-3 w-3 mr-1" />
                            ID: {log.resource_id}
                          </span>
                        )}
                      </div>
                      
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-2 italic break-words">
                          {log.details}
                        </p>
                      )}

                      {log.metadata && (
                        <div className="mt-2 p-2 bg-muted/20 rounded text-xs">
                          <div className="font-medium mb-1">Metadados:</div>
                          <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminLogsPage;
