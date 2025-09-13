import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContextMods';
import { useData } from '@/contexts/DataContext';


const SectionWrapper = ({ title, description, children, icon: Icon }) => (
  <Card className="glass-effect mb-8">
    <CardHeader>
      <CardTitle className="text-2xl text-primary flex items-center">
        {Icon && <Icon size={24} className="mr-3" />}
        {title}
      </CardTitle>
      {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const AdminUserManagementSection = () => {
  const { currentUserProfile, users: allUsersList, updateUserProfileInList, setUsers: setAllUsersList } = useAuth();
  const { fetchMediaKitData, targetProfileUsername } = useData();
  const { toast } = useToast();

  const toggleUserVerification = async (userIdToToggle, currentStatus) => {
    try {
      const updatedUsers = allUsersList.map(u => 
        u.id === userIdToToggle ? { ...u, is_verified: !currentStatus, updated_at: new Date().toISOString() } : u
      );
      setAllUsersList(updatedUsers); 
      
      if (currentUserProfile?.id === userIdToToggle) {
         const updatedSelf = updatedUsers.find(u => u.id === userIdToToggle);
         if(updatedSelf) updateUserProfileInList(updatedSelf); 
      }
      
      toast({ title: "Status de Verificação Alterado!", description: `Usuário ${!currentStatus ? 'verificado' : 'não verificado'}.` });
      fetchMediaKitData(targetProfileUsername); 
    } catch (error) {
      toast({ title: "Erro ao alterar verificação", description: error.message, variant: "destructive" });
    }
  };

  if (currentUserProfile?.role !== 'admin') {
    return null; 
  }

  return (
    <SectionWrapper title="Gerenciamento de Usuários" description="Verifique usuários para destacar seus comentários." icon={Users}>
      <div className="space-y-3">
        {allUsersList.map(user => (
          <Card key={user.id} className="flex items-center justify-between p-3 bg-card/60 border-border/50">
            <div>
              <p className="font-medium text-card-foreground">{user.username} ({user.email})</p>
              <p className={`text-xs ${user.is_verified ? 'text-accent' : 'text-muted-foreground'}`}>
                {user.is_verified ? 'Verificado' : 'Não Verificado'} - Role: {user.role}
              </p>
            </div>
            <Button 
              variant={user.is_verified ? "destructive" : "default"} 
              size="sm" 
              onClick={() => toggleUserVerification(user.id, user.is_verified)}
              className="glow-on-hover"
            >
              {user.is_verified ? <XCircle size={16} className="mr-2"/> : <CheckCircle size={16} className="mr-2"/>}
              {user.is_verified ? 'Remover Verificação' : 'Verificar Usuário'}
            </Button>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default AdminUserManagementSection;