import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Shield,
  Crown,
  UserCog,
  Settings,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Lock,
  CheckSquare,
  Square,
  Save,
  X,
  Edit3
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../../../contexts/AuthContextMods';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { usePermissions } from '../../../hooks/usePermissions';

const AdminAdministratorsPage = () => {
  const { currentUser } = useAuth();
  const { hasPermission, loading: permissionsLoading, refetch: refetchPermissions } = usePermissions();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [administrators, setAdministrators] = useState([]);
  const [filteredAdministrators, setFilteredAdministrators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [isChangingRole, setIsChangingRole] = useState(false);
  
  const [superAdminModalOpen, setSuperAdminModalOpen] = useState(false);
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  
  const [permissions, setPermissions] = useState({});
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState('');
  const [rolePermissions, setRolePermissions] = useState({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [hoveredRole, setHoveredRole] = useState(null);

  const allPermissions = {
    'access_admin_panel': 'Acessar Painel Administrativo',
    'view_changelogs': 'Ver Changelogs',
    'manage_changelogs': 'Gerenciar Changelogs (criar/editar/deletar)',
    'view_comments': 'Ver Comentários',
    'manage_comments': 'Gerenciar Comentários (aprovar/rejeitar)',
    'view_logs': 'Ver Logs',
    'export_logs': 'Exportar Logs',
    'clear_logs': 'Limpar Logs Antigos',
    'view_mods': 'Ver Mods',
    'manage_mods': 'Gerenciar Mods (criar/editar/deletar)',
    'view_users': 'Ver Usuários',
    'manage_users': 'Gerenciar Usuários (editar/banir/deletar)',
    'manage_banner': 'Gerenciar Banner',
    'create_comment_replies': 'Criar Respostas de Comentários',
    'manage_administrators': 'Gerenciar Administradores',
    'manage_permissions': 'Gerenciar Permissões'
  };

  useEffect(() => {
    if (!permissionsLoading && currentUser) {
      if (currentUser.role !== 'admin' && !hasPermission('manage_administrators')) {
        toast({
          title: 'Acesso Negado',
          description: 'Você não tem permissão para acessar esta página. Entre em contato com um administrador se precisar desta funcionalidade.',
          variant: 'destructive'
        });
        navigate('/admin');
      }
    }
  }, [currentUser, hasPermission, permissionsLoading, navigate, toast]);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || hasPermission('manage_administrators'))) {
      fetchAdministrators();
      fetchPermissions();
    }
  }, [currentUser, hasPermission]);

  useEffect(() => {
    filterAdministrators();
  }, [administrators, searchTerm, selectedRole]);

  const fetchAdministrators = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/administrators', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdministrators(data.data || []);
        setFilteredAdministrators(data.data || []);
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar administradores',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar administradores:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar administradores',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/administrators/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const permsMap = {};
        data.data.forEach(item => {
          permsMap[item.role] = item.permissions;
        });
        setPermissions(permsMap);
      }
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
    }
  };

  const filterAdministrators = () => {
    let filtered = [...administrators];

    if (searchTerm) {
      filtered = filtered.filter(admin => 
        admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(admin => admin.role === selectedRole);
    }

    setFilteredAdministrators(filtered);
  };

  const handleRoleChangeClick = (admin) => {
    setSelectedAdmin(admin);
    setNewRole(admin.role);
    
    if (admin.role !== 'admin') {
      setRoleChangeModalOpen(true);
    } else {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível alterar o cargo de um Admin',
        variant: 'destructive'
      });
    }
  };

  const handleRoleChange = async () => {
    if (!selectedAdmin || !newRole) return;

    if (newRole === 'admin' && selectedAdmin.role !== 'admin') {
      setRoleChangeModalOpen(false);
      setSuperAdminModalOpen(true);
      return;
    }

    await changeRole(selectedAdmin.id, newRole);
  };

  const changeRole = async (userId, role, password = null) => {
    try {
      setIsChangingRole(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/administrators/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newRole: role, password })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: data.message || 'Cargo alterado com sucesso'
        });
        setRoleChangeModalOpen(false);
        setSuperAdminModalOpen(false);
        setSuperAdminPassword('');
        setSelectedAdmin(null);
        setNewRole('');
        fetchAdministrators();
      } else {
        toast({
          title: 'Erro',
          description: data.message || 'Erro ao alterar cargo',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao alterar cargo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar cargo',
        variant: 'destructive'
      });
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleSuperAdminConfirm = async () => {
    const trimmedPassword = superAdminPassword.trim();
    
    if (!trimmedPassword) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira a senha de confirmação',
        variant: 'destructive'
      });
      return;
    }

    await changeRole(selectedAdmin.id, 'admin', trimmedPassword);
  };

  const handlePermissionsClick = (role) => {
    setSelectedRoleForPermissions(role);
    setRolePermissions({ ...permissions[role] });
    setPermissionsModalOpen(true);
  };

  const togglePermission = (permission) => {
    setRolePermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setIsSavingPermissions(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/administrators/permissions/${selectedRoleForPermissions}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions: rolePermissions })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Permissões atualizadas com sucesso'
        });
        setPermissionsModalOpen(false);
        fetchPermissions();
        if (refetchPermissions) {
          await refetchPermissions();
        }
      } else {
        toast({
          title: 'Erro',
          description: data.message || 'Erro ao atualizar permissões',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar permissões',
        variant: 'destructive'
      });
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'admin': { 
        label: 'Admin', 
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', 
        hoverColor: 'hover:bg-purple-500/30',
        icon: Crown 
      },
      'supervisor': { 
        label: 'Supervisor', 
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', 
        hoverColor: 'hover:bg-blue-500/30',
        icon: Shield 
      },
      'moderator': { 
        label: 'Moderador', 
        color: 'bg-green-500/20 text-green-400 border-green-500/50', 
        hoverColor: 'hover:bg-green-500/30',
        icon: UserCog 
      }
    };

    const config = roleConfig[role] || roleConfig.moderator;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} ${config.hoverColor} border flex items-center gap-1 transition-colors cursor-default`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRoleLabel = (role) => {
    const labels = {
      'admin': 'Admin',
      'supervisor': 'Supervisor',
      'moderator': 'Moderador',
      'member': 'Membro'
    };
    return labels[role] || role;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent flex items-center gap-3">
          <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          Administradores
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">Gerencie os administradores do sistema e suas permissões</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              >
                <option value="all">Todos os cargos</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="moderator">Moderador</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configurar Permissões por Cargo
          </CardTitle>
          <CardDescription>
            Clique em um cargo para configurar suas permissões no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['moderator', 'supervisor', 'admin'].map((role) => {
              const roleConfig = {
                'admin': { 
                  label: 'Admin', 
                  color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', 
                  hoverBorder: 'hover:border-purple-500',
                  hoverBg: 'bg-purple-500/20 hover:bg-purple-500/30',
                  icon: Crown 
                },
                'supervisor': { 
                  label: 'Supervisor', 
                  color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', 
                  hoverBorder: 'hover:border-blue-500',
                  hoverBg: 'bg-blue-500/20 hover:bg-blue-500/30',
                  icon: Shield 
                },
                'moderator': { 
                  label: 'Moderador', 
                  color: 'bg-green-500/20 text-green-400 border-green-500/50', 
                  hoverBorder: 'hover:border-green-500',
                  hoverBg: 'bg-green-500/20 hover:bg-green-500/30',
                  icon: UserCog 
                }
              };
              
              const config = roleConfig[role];
              const Icon = config.icon;
              const isDisabled = role === 'admin';
              const isHovered = hoveredRole === role;
              
              return (
                <motion.div
                  key={role}
                  className="relative group"
                  onMouseEnter={() => !isDisabled && setHoveredRole(role)}
                  onMouseLeave={() => setHoveredRole(null)}
                  onClick={() => !isDisabled && handlePermissionsClick(role)}
                >
                  <motion.div
                    className={`
                      border rounded-lg p-4 transition-all relative
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : `cursor-pointer ${config.hoverBorder} hover:bg-muted/50`}
                      ${config.color}
                    `}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">{config.label}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {administrators.filter(a => a.role === role).length} {administrators.filter(a => a.role === role).length === 1 ? 'usuário' : 'usuários'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {!isDisabled && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: isHovered ? 1 : 0,
                          scale: isHovered ? 1 : 0.8
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.button
                          className={`p-3 ${config.hoverBg} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-auto`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePermissionsClick(role);
                          }}
                        >
                          <Edit3 size={20} />
                        </motion.button>
                      </motion.div>
                    )}
                    
                    {!isDisabled && (
                      <motion.div
                        className="absolute inset-0 bg-black/60 dark:bg-black/70 rounded-lg z-10 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 w-full max-w-full overflow-x-hidden sm:overflow-visible">
        {filteredAdministrators.map((admin) => (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-full"
          >
            <Card className="w-full max-w-full overflow-hidden sm:overflow-visible">
              <CardContent className="pt-6 w-full max-w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full min-w-0">
                  <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0 flex-1">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={getAvatarUrl(admin.avatar_url)} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {admin.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate text-base sm:text-lg min-w-0">
                          {admin.display_name || admin.username}
                        </h3>
                        <div className="flex-shrink-0 self-start sm:self-center">
                          {getRoleBadge(admin.role)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate min-w-0">
                        {admin.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criado em: {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
                    {currentUser?.id !== admin.id && (() => {
                      const roleConfig = {
                        'admin': { icon: Crown },
                        'supervisor': { icon: Shield },
                        'moderator': { icon: UserCog }
                      };
                      const config = roleConfig[admin.role] || roleConfig.moderator;
                      const RoleIcon = config.icon;
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChangeClick(admin)}
                          disabled={admin.role === 'admin'}
                          className="w-full sm:w-auto"
                        >
                          <RoleIcon className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Alterar Cargo</span>
                          <span className="sm:hidden">Cargo</span>
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={roleChangeModalOpen} onOpenChange={setRoleChangeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Cargo</DialogTitle>
            <DialogDescription>
              Alterando cargo de {selectedAdmin?.display_name || selectedAdmin?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cargo Atual</label>
              <p className="text-sm text-muted-foreground">{getRoleLabel(selectedAdmin?.role)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Novo Cargo</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
              >
                <option value="member">Membro</option>
                <option value="moderator">Moderador</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRoleChange} disabled={isChangingRole}>
              {isChangingRole ? 'Alterando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={superAdminModalOpen} onOpenChange={setSuperAdminModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-400">
              <Crown className="h-5 w-5" />
              Promover para Admin
            </DialogTitle>
            <DialogDescription>
              Esta é uma ação irreversível. Uma vez promovido, não será possível rebaixar este usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-400 mb-1">Atenção!</p>
                  <p className="text-sm text-muted-foreground">
                    Ao promover <strong>{selectedAdmin?.display_name || selectedAdmin?.username}</strong> para <strong>Admin</strong>,
                    ele terá acesso total ao sistema e não poderá ser rebaixado.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Senha de Confirmação</label>
              <Input
                type="password"
                placeholder="Digite a senha especial"
                value={superAdminPassword}
                onChange={(e) => setSuperAdminPassword(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Senha especial necessária para promover para Admin
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSuperAdminModalOpen(false);
              setSuperAdminPassword('');
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSuperAdminConfirm} 
              disabled={isChangingRole || !superAdminPassword}
            >
              {isChangingRole ? 'Promovendo...' : 'Confirmar Promoção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Permissões - {getRoleLabel(selectedRoleForPermissions)}</DialogTitle>
            <DialogDescription>
              Selecione as permissões que este cargo terá no sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(allPermissions).map(([key, label]) => (
              <div 
                key={key} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => togglePermission(key)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {rolePermissions[key] ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                  <label className="text-sm font-medium cursor-pointer flex-1">
                    {label}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePermission(key);
                  }}
                >
                  {rolePermissions[key] ? 'Desabilitar' : 'Habilitar'}
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePermissions} disabled={isSavingPermissions}>
              <Save className="h-4 w-4 mr-2" />
              {isSavingPermissions ? 'Salvando...' : 'Salvar Permissões'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdministratorsPage;

