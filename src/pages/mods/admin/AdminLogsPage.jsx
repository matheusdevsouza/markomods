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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); 

  useEffect(() => {
    fetchLogs();
    fetchSummary();
  }, [page, limit, selectedLevel, selectedCategory, selectedResourceType, dateFrom, dateTo, searchTerm, activeTab]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        level: selectedLevel,
        category: selectedCategory,
        resourceType: selectedResourceType,
        search: searchTerm,
        roleFilter: activeTab
      });
      
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await fetch(`/api/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLogs(data.data || []);
          setFilteredLogs(data.data || []);
          setPagination(data.pagination || null);
        } else {
          console.error('Erro ao buscar logs:', data.message);
          setLogs([]);
          setFilteredLogs([]);
          setPagination(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta:', response.status, errorData);
        setLogs([]);
        setFilteredLogs([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      setLogs([]);
      setFilteredLogs([]);
      setPagination(null);
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
        if (data.success) {
          setSummary(data.data);
        } else {
          console.error('Erro ao buscar resumo:', data.message);
          setSummary(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta do resumo:', response.status, errorData);
        setSummary(null);
      }
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
      setSummary(null);
    }
  };

  useEffect(() => {
    setFilteredLogs(logs);
  }, [logs]);

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
      <Badge variant={variants[level] || 'outline'} className="capitalize text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-auto">
        {level}
      </Badge>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'auth':
        return <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'mods':
        return <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'users':
        return <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'security':
        return <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'system':
        return <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'comments':
        return <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'favorites':
        return <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'downloads':
        return <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'admin':
        return <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      default:
        return <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
    }
  };

  const getResourceTypeIcon = (resourceType) => {
    switch (resourceType) {
      case 'mod':
        return <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
      case 'user':
        return <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
      case 'comment':
        return <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
      case 'file':
        return <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
      default:
        return <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
    }
  };

  const formatResourceType = (resourceType) => {
    if (!resourceType) return '';
    switch (resourceType.toLowerCase()) {
      case 'mod':
        return 'Mods';
      case 'user':
        return 'Usuário';
      case 'comment':
        return 'Comentário';
      case 'file':
        return 'Arquivo';
      default:
        return resourceType;
    }
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
    setPage(1);
  };
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0 });
  };
  
  const handleLimitChange = (newLimit) => {
    setLimit(parseInt(newLimit));
    setPage(1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-8 p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            Logs do Sistema
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Monitore todas as atividades e eventos da plataforma Eu, Marko!
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm sm:text-base">Buscar nos Logs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por ação, usuário..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level" className="text-sm sm:text-base">Nível</Label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 border border-input rounded-md bg-background text-sm sm:text-base"
              >
                <option value="all">Todos os Níveis</option>
                <option value="error">Erro</option>
                <option value="warning">Aviso</option>
                <option value="success">Sucesso</option>
                <option value="info">Informação</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm sm:text-base">Categoria</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 border border-input rounded-md bg-background text-sm sm:text-base"
              >
                <option value="all">Todas as Categorias</option>
                <option value="auth">Autenticação</option>
                <option value="mods">Mods</option>
                <option value="users">Usuários</option>
                <option value="security">Segurança</option>
                <option value="system">Sistema</option>
                <option value="comments">Comentários</option>
                <option value="favorites">Favoritos</option>
                <option value="downloads">Downloads</option>
                <option value="admin">Administração</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resourceType" className="text-sm sm:text-base">Tipo de Recurso</Label>
              <select
                id="resourceType"
                value={selectedResourceType}
                onChange={(e) => {
                  setSelectedResourceType(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 border border-input rounded-md bg-background text-sm sm:text-base"
              >
                <option value="all">Todos os Recursos</option>
                <option value="mod">Mods</option>
                <option value="user">Usuário</option>
                <option value="comment">Comentário</option>
                <option value="file">Arquivo</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full text-sm sm:text-base"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Ocultar' : 'Mostrar'} Filtros de Data
            </Button>

            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="text-sm sm:text-base">Data de Início</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="text-sm sm:text-base">Data de Fim</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                    className="text-sm sm:text-base"
                  />
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
              <span>Total de logs: {pagination?.total || filteredLogs.length}</span>
              <span className="hidden sm:inline">Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
              <span className="sm:hidden">Atualizado: {new Date().toLocaleTimeString('pt-BR')}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="limit" className="text-xs sm:text-sm">Por página:</Label>
                <select
                  id="limit"
                  value={limit}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="p-1.5 border border-input rounded-md bg-background text-xs sm:text-sm"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <Button variant="outline" onClick={clearFilters} size="sm" className="text-sm">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Abas Redesenhado */}
      <div className="mb-6">
      <div className="w-full sm:inline-flex rounded-xl bg-muted/30 p-1 sm:p-1.5 border border-border/50 shadow-lg">
        <motion.button
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
          className={`
            relative w-full sm:w-auto px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-all duration-300
            flex items-center justify-center gap-2 sm:gap-2.5 sm:min-w-[160px]
            ${activeTab === 'all'
              ? 'text-white shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {activeTab === 'all' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <User className={`h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10 flex-shrink-0 ${activeTab === 'all' ? 'text-white' : 'text-muted-foreground'}`} />
          <span className="relative z-10 truncate">
            <span className="hidden sm:inline">Todos os Usuários</span>
            <span className="sm:hidden">Usuários</span>
          </span>
          {activeTab === 'all' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-primary rounded-full border-2 border-background"
            />
          )}
        </motion.button>
        
        <motion.button
          onClick={() => {
            setActiveTab('admin');
            setPage(1);
          }}
          className={`
            relative w-full sm:w-auto px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-all duration-300
            flex items-center justify-center gap-2 sm:gap-2.5 sm:min-w-[160px] mt-1 sm:mt-0
            ${activeTab === 'admin'
              ? 'text-white shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {activeTab === 'admin' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Shield className={`h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10 flex-shrink-0 ${activeTab === 'admin' ? 'text-white' : 'text-muted-foreground'}`} />
          <span className="relative z-10 truncate">
            <span className="hidden sm:inline">Apenas Administradores</span>
            <span className="sm:hidden">Admins</span>
          </span>
          {activeTab === 'admin' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-primary rounded-full border-2 border-background"
            />
          )}
        </motion.button>
      </div>
      </div>
            
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
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        {getLevelBadge(log.level)}
                        <Badge variant="outline" className="flex items-center gap-0.5 sm:space-x-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-auto flex-shrink-0">
                          <span className="flex-shrink-0">{getCategoryIcon(log.category)}</span>
                          <span className="capitalize whitespace-nowrap">{log.category}</span>
                        </Badge>
                        {log.resource_type && (
                          <Badge variant="outline" className="flex items-center gap-0.5 sm:space-x-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-auto flex-shrink-0">
                            <span className="flex-shrink-0">{getResourceTypeIcon(log.resource_type)}</span>
                            <span className="whitespace-nowrap">{formatResourceType(log.resource_type)}</span>
                          </Badge>
                        )}
                        <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center flex-shrink-0">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
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
          
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-border gap-4">
              <div className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} logs no total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (page <= 3) {
                    pageNum = idx + 1;
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + idx;
                  } else {
                    pageNum = page - 2 + idx;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminLogsPage;
