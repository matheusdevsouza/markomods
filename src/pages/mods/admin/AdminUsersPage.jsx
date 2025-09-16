import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeMods } from '../../../contexts/ThemeContextMods';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Shield,
  User,
  Mail,
  Calendar,
  Activity,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Eye,
  UserCheck,
  UserX,
  Crown,
  ShieldCheck,
  UserCog,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminUsersPage = () => {
  const { theme } = useThemeMods();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [isBanning, setIsBanning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    display_name: '',
    email: '',
    role: '',
    is_verified: false
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Buscar usuários reais do banco de dados
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.data || []);
          setFilteredUsers(data.data || []);
        } else {
          console.error('Erro na resposta:', response.status, response.statusText);
          try {
            const errorData = await response.json();
            console.error('Detalhes do erro:', errorData);
          } catch (e) {
            console.error('Não foi possível ler detalhes do erro');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrar usuários baseado na busca e filtros
  useEffect(() => {
    let filtered = users;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'verified') {
        filtered = filtered.filter(user => user.is_verified);
      } else if (selectedStatus === 'unverified') {
        filtered = filtered.filter(user => !user.is_verified);
      } else if (selectedStatus === 'banned') {
        filtered = filtered.filter(user => user.is_banned);
      } else if (selectedStatus === 'active') {
        filtered = filtered.filter(user => !user.is_banned);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const getRoleConfig = (role) => {
    const roleConfigs = {
      'super_admin': { 
        label: 'Super Admin', 
        icon: Crown, 
        className: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600',
        iconColor: 'text-purple-400'
      },
      'admin': { 
        label: 'Admin', 
        icon: ShieldCheck, 
        className: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600',
        iconColor: 'text-blue-400'
      },
      'moderator': { 
        label: 'Moderador', 
        icon: Shield, 
        className: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600',
        iconColor: 'text-purple-400'
      },
      'member': { 
        label: 'Membro', 
        icon: User, 
        className: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-600',
        iconColor: 'text-gray-400'
      }
    };

    return roleConfigs[role] || roleConfigs.member;
  };

  const getStatusConfig = (user) => {
    if (user.is_banned) {
      return {
        label: 'Banido',
        icon: UserX,
        className: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500',
        iconColor: 'text-red-400',
        reason: user.ban_reason
      };
    }
    if (user.is_verified) {
      return {
        label: 'Verificado',
        icon: UserCheck,
        className: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500',
        iconColor: 'text-green-400'
      };
    }
    return {
      label: 'Não Verificado',
      icon: AlertTriangle,
      className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 border-gray-400',
      iconColor: 'text-gray-300'
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleBanUser = async (userId, ban, reason = '') => {
    setIsBanning(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/${userId}/ban`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          is_banned: ban,
          ban_reason: reason || 'Banimento administrativo'
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Atualizar lista de usuários
        setUsers(prev => prev.map(user => 
          user.id === userId ? { 
            ...user, 
            is_banned: ban,
            ban_reason: ban ? reason : null,
            banned_at: ban ? new Date().toISOString() : null
          } : user
        ));
        
        // Fechar modal se estiver aberto
        if (banModalOpen) {
          setBanModalOpen(false);
          setSelectedUser(null);
          setBanReason('');
        }
        
        // Mostrar toast de sucesso
        toast({
          title: ban ? 'Usuário banido' : 'Usuário desbanido',
          description: result.message,
          variant: ban ? 'destructive' : 'default'
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao alterar status do usuário',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status do usuário: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setIsBanning(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    setIsEditing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Atualizar lista de usuários
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id ? { ...user, ...editForm } : user
        ));
        
        setEditModalOpen(false);
        setSelectedUser(null);
        setEditForm({ username: '', display_name: '', email: '', role: '', is_verified: false });
        
        toast({
          title: 'Usuário atualizado',
          description: 'Informações do usuário foram atualizadas com sucesso',
          variant: 'default'
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao atualizar usuário',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar usuário: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setIsEditing(false);
    }
  };

  const openBanModal = (user) => {
    if (user.role === 'admin' || user.role === 'super_admin') {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível banir administradores',
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedUser(user);
    setBanReason('');
    setBanModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || '',
      display_name: user.display_name || '',
      email: user.email || '',
      role: user.role || 'member',
      is_verified: user.is_verified || false
    });
    setEditModalOpen(true);
  };

  const confirmBan = () => {
    if (selectedUser && banReason.trim()) {
      handleBanUser(selectedUser.id, true, banReason.trim());
    }
  };

  const handleUnban = (user) => {
    if (user.role === 'admin' || user.role === 'super_admin') {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível alterar status de administradores',
        variant: 'destructive'
      });
      return;
    }
    
    handleBanUser(user.id, false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remover usuário da lista local
        setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
        
        setDeleteModalOpen(false);
        setSelectedUser(null);
        
        toast({
          title: 'Usuário deletado',
          description: 'Usuário foi deletado permanentemente da plataforma',
          variant: 'default'
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao deletar usuário',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar usuário: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (user) => {
    if (user.role === 'admin' || user.role === 'super_admin') {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível deletar contas de administradores',
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-minecraft text-primary mb-2">
            Gerenciar Usuários
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie todos os usuários da plataforma Eu, Marko! Mods
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Filtros e Busca */}
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
              <label className="text-xs sm:text-sm font-medium">Buscar Usuários</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Cargo</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background text-sm sm:text-base"
              >
                <option value="all">Todos os Cargos</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderador</option>
                <option value="member">Membro</option>
              </select>
            </div>
            
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="text-xs sm:text-sm font-medium">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background text-sm sm:text-base"
              >
                <option value="all">Todos os Status</option>
                <option value="verified">Verificados</option>
                <option value="unverified">Não Verificados</option>
                <option value="banned">Banidos</option>
                <option value="active">Ativos</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total de usuários: {filteredUsers.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card className="minecraft-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
            Usuários da Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-lg">Nenhum usuário encontrado com os filtros atuais</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => {
                const roleConfig = getRoleConfig(user.role);
                const statusConfig = getStatusConfig(user);
                const RoleIcon = roleConfig.icon;
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative p-4 sm:p-6 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-300">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-base sm:text-lg font-bold">
                            {user.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                              {user.display_name || user.username}
                            </h3>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              <Badge className={`${roleConfig.className} text-xs`}>
                                <RoleIcon className={`h-3 w-3 mr-1 ${roleConfig.iconColor}`} />
                                <span className="hidden sm:inline">{roleConfig.label}</span>
                                <span className="sm:hidden">{roleConfig.label.split(' ')[0]}</span>
                              </Badge>
                              <Badge className={`${statusConfig.className} text-xs`}>
                                <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.iconColor}`} />
                                <span className="hidden sm:inline">{statusConfig.label}</span>
                                <span className="sm:hidden">{statusConfig.label.split(' ')[0]}</span>
                              </Badge>
                            </div>
                          </div>
                          
                          {statusConfig.reason && (
                            <p className="text-xs sm:text-sm text-red-400 font-medium">
                              Motivo: {statusConfig.reason}
                            </p>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{user.username}</span>
                            </span>
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                              {user.email}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{formatDate(user.created_at)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end sm:justify-start space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditModal(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Usuário
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.is_banned ? (
                              <DropdownMenuItem 
                                onClick={() => handleUnban(user)}
                                disabled={user.role === 'admin' || user.role === 'super_admin'}
                                className="text-green-600 focus:text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Desbanir Usuário
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => openBanModal(user)}
                                disabled={user.role === 'admin' || user.role === 'super_admin'}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Banir Usuário
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openDeleteModal(user)}
                              disabled={user.role === 'admin' || user.role === 'super_admin'}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Usuário
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Banimento */}
      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 text-base sm:text-lg">
              <Ban className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Banir Usuário
            </DialogTitle>
            <DialogDescription className="text-sm">
              Você está prestes a banir o usuário <strong>{selectedUser?.display_name || selectedUser?.username}</strong>.
              Esta ação pode ser revertida posteriormente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Motivo do Banimento <span className="text-red-500">*</span>
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Digite o motivo do banimento..."
                className="w-full p-2 sm:p-3 border border-border rounded-md bg-background text-foreground resize-none text-sm sm:text-base"
                rows={3}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBanModalOpen(false);
                setSelectedUser(null);
                setBanReason('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmBan}
              disabled={!banReason.trim() || isBanning}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isBanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                'Confirmar Banimento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-purple-600">
              <Edit className="h-5 w-5 mr-2" />
              Editar Usuário
            </DialogTitle>
            <DialogDescription>
              Edite as informações do usuário <strong>{selectedUser?.display_name || selectedUser?.username}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome de Usuário</label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Nome de usuário"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Nome de Exibição</label>
              <Input
                value={editForm.display_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Nome de exibição"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                type="email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cargo</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="member">Membro</option>
                <option value="moderator">Moderador</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_verified"
                checked={editForm.is_verified}
                onChange={(e) => setEditForm(prev => ({ ...prev, is_verified: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="is_verified" className="text-sm font-medium">
                Usuário Verificado
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedUser(null);
                setEditForm({ username: '', display_name: '', email: '', role: '', is_verified: false });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditUser}
              disabled={isEditing}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isEditing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Excluir Usuário
            </DialogTitle>
            <DialogDescription>
              Você está prestes a excluir permanentemente o usuário <strong>{selectedUser?.display_name || selectedUser?.username}</strong>.
              Esta ação não pode ser desfeita e todos os dados do usuário serão removidos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
            <h3 className="font-semibold text-red-400 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Aviso Importante
            </h3>
            <ul className="text-sm text-red-300 space-y-1">
              <li>• Todos os comentários do usuário serão removidos</li>
              <li>• Histórico de downloads será apagado</li>
              <li>• Favoritados do usuário serão apagados</li>
              <li>• Esta ação é irreversível</li>
            </ul>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Excluindo...
                </>
              ) : (
                'Confirmar Exclusão'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminUsersPage;