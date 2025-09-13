import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContextMods';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Save, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl, getDefaultAvatarUrl } from '@/utils/avatarUtils';
import { useTranslation } from '@/hooks/useTranslation';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    display_name: ''
  });
  
  // Estados para alteração de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  
  // Estados para validação
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // Estado para preview do avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Estados para visibilidade das senhas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Carregar dados do usuário
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        display_name: currentUser.display_name || ''
      });
    }
  }, [currentUser]);

  // Validação do formulário principal
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.username && (formData.username.length < 3 || formData.username.length > 50)) {
      newErrors.username = t('editProfile.validation.usernameLength');
    }
    
    if (formData.username && !/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = t('editProfile.validation.usernameChars');
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('editProfile.validation.emailInvalid');
    }
    
    if (formData.display_name && formData.display_name.length > 100) {
      newErrors.display_name = t('editProfile.validation.displayNameMax');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validação da senha
  const validatePassword = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t('editProfile.validation.currentPasswordRequired');
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = t('editProfile.validation.newPasswordRequired');
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = t('editProfile.validation.newPasswordMin');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = t('editProfile.validation.newPasswordPattern');
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = t('editProfile.validation.confirmPasswordRequired');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t('editProfile.validation.passwordsDontMatch');
    }
    
    // Verificar se a nova senha é diferente da atual
    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = t('editProfile.validation.passwordDifferentFromCurrent');
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Atualizar perfil
  const handleUpdateProfile = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t('editProfile.toast.profileUpdated.title'),
          description: t('editProfile.toast.profileUpdated.desc'),
          variant: "default"
        });
        
        // Atualizar usuário no contexto
        if (updateUser && data.data?.user) {
          updateUser(data.data.user);
        }
      } else {
        toast({
          title: t('editProfile.toast.updateError.title'),
          description: data.message || t('editProfile.toast.updateError.desc'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: t('editProfile.toast.networkError.title'),
        description: t('editProfile.toast.networkError.desc'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload de avatar
  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/user/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Resposta do servidor (avatar):', data);

      if (response.ok) {
        toast({
          title: t('editProfile.toast.avatarUpdated.title'),
          description: t('editProfile.toast.avatarUpdated.desc'),
          variant: "default"
        });
        
        // Atualizar usuário no contexto
        if (updateUser && data.data?.user) {
          console.log('Dados do usuário atualizados:', data.data.user);
          updateUser(data.data.user);
          
          // Verificar se o estado foi atualizado
          setTimeout(() => {
            console.log('Estado atual do usuário:', currentUser);
          }, 100);
        }
        
        // Limpar preview e arquivo selecionado
        setAvatarPreview(null);
        setSelectedFile(null);
      } else {
        toast({
          title: t('editProfile.toast.avatarUpdateError.title'),
          description: data.message || t('editProfile.toast.avatarUpdateError.desc'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast({
        title: t('editProfile.toast.networkError.title'),
        description: t('editProfile.toast.networkError.desc'),
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Alterar senha
  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    setChangingPassword(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t('editProfile.toast.passwordChanged.title'),
          description: t('editProfile.toast.passwordChanged.desc'),
          variant: "default"
        });
        
        // Limpar formulário
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast({
          title: t('editProfile.toast.passwordChangeError.title'),
          description: data.message || t('editProfile.toast.passwordChangeError.desc'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: t('editProfile.toast.networkError.title'),
        description: t('editProfile.toast.networkError.desc'),
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };


  // Selecionar arquivo de avatar
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('editProfile.toast.fileTooLarge.title'),
          description: t('editProfile.toast.fileTooLarge.desc'),
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Limpar arquivo selecionado
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Botão Voltar - Posicionado em cima do título */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">{t('editProfile.title')}</h1>
        <p className="text-muted-foreground">{t('editProfile.subtitle')}</p>
      </div>

      <div className="grid gap-8">
        {/* Seção de Avatar */}
        <Card className="minecraft-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera size={20} className="text-primary" />
              {t('editProfile.avatar.title')}
            </CardTitle>
            <CardDescription>
              {t('editProfile.avatar.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
                             {/* Avatar atual */}
               <div className="flex flex-col items-center gap-2">
                                   <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage 
                      src={getAvatarUrl(currentUser.avatar_url) || getDefaultAvatarUrl()} 
                    />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                      {currentUser.display_name?.charAt(0).toUpperCase() || currentUser.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                                   <span className="text-sm text-muted-foreground">Avatar Atual</span>
               </div>

              {/* Preview do novo avatar */}
              {avatarPreview && (
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24 border-4 border-green-500/20">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="text-2xl font-bold bg-green-500/10 text-green-600">
                      N
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-green-600 font-medium">Novo Avatar</span>
                </div>
              )}

              {/* Controles de upload */}
              <div className="flex flex-col gap-3">
                {/* Nome de exibição do usuário */}
                <div className="text-left mb-2">
                  <p className="text-lg font-semibold text-foreground">
                    {currentUser.display_name || currentUser.username}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('editProfile.avatar.currentDisplayName')}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('avatar-input').click()}
                    className="minecraft-btn"
                  >
                    <Camera size={16} className="mr-2" />
                    {t('editProfile.avatar.selectImage')}
                  </Button>
                  {selectedFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelectedFile}
                      className="minecraft-btn border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <X size={16} className="mr-2" />
                      {t('editProfile.avatar.clear')}
                    </Button>
                  )}
                </div>
                
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile && (
                  <Button
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="minecraft-btn bg-green-600 hover:bg-green-700 text-white"
                  >
                    {uploadingAvatar ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('editProfile.avatar.saving')}
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        {t('editProfile.avatar.save')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Informações Pessoais */}
        <Card className="minecraft-card">
                     <CardHeader>
                           <CardTitle className="flex items-center gap-2">
               <User size={20} className="text-primary" />
               {t('editProfile.identity.title')}
             </CardTitle>
             <CardDescription>
               {t('editProfile.identity.description')}
             </CardDescription>
           </CardHeader>
          <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="username" className="flex items-center gap-2">
                   <span>{t('editProfile.identity.username')}</span>
                   <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{t('editProfile.identity.unique')}</span>
                 </Label>
                 <Input
                   id="username"
                   value={formData.username}
                   onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                   placeholder={t('editProfile.identity.usernamePlaceholder')}
                   className={errors.username ? 'border-destructive' : ''}
                 />
                                   <p className="text-xs text-muted-foreground">
                    {t('editProfile.identity.usernameHelp')}
                  </p>
                 {errors.username && (
                   <p className="text-sm text-destructive flex items-center gap-1">
                     <AlertTriangle size={14} />
                     {errors.username}
                   </p>
                 )}
               </div>

               <div className="space-y-2">
                 <Label htmlFor="email">{t('editProfile.identity.email')}</Label>
                 <Input
                   id="email"
                   type="email"
                   value={formData.email}
                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                   placeholder="seu@email.com"
                   className={errors.email ? 'border-destructive' : ''}
                 />
                 {errors.email && (
                   <p className="text-sm text-destructive flex items-center gap-1">
                     <AlertTriangle size={14} />
                     {errors.email}
                   </p>
                 )}
               </div>

               <div className="space-y-2">
                 <Label htmlFor="display_name" className="flex items-center gap-2">
                   <span>{t('editProfile.identity.displayName')}</span>
                   <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full font-medium">{t('editProfile.identity.public')}</span>
                 </Label>
                 <Input
                   id="display_name"
                   value={formData.display_name}
                   onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                   placeholder={t('editProfile.identity.displayNamePlaceholder')}
                   className={errors.display_name ? 'border-destructive' : ''}
                 />
                                   <p className="text-xs text-muted-foreground">
                    {t('editProfile.identity.displayNameHelp')}
                  </p>
                 {errors.display_name && (
                   <p className="text-sm text-destructive flex items-center gap-1">
                     <AlertTriangle size={14} />
                     {errors.display_name}
                   </p>
                 )}
               </div>
             </div>

            

            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="minecraft-btn bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('editProfile.identity.saving')}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {t('editProfile.identity.save')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Seção de Alteração de Senha */}
        <Card className="minecraft-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} className="text-primary" />
              {t('editProfile.password.title')}
            </CardTitle>
            <CardDescription>
              {t('editProfile.password.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="currentPassword">{t('editProfile.password.current')}</Label>
                 <div className="relative">
                   <Input
                     id="currentPassword"
                     type={showCurrentPassword ? "text" : "password"}
                     value={passwordData.currentPassword}
                     onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                           placeholder={t('editProfile.password.placeholderCurrent')}
                     className={passwordErrors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                   />
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                     onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                   >
                     {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                   </Button>
                 </div>
                 {passwordErrors.currentPassword && (
                   <p className="text-sm text-destructive flex items-center gap-1">
                     <AlertTriangle size={14} />
                     {passwordErrors.currentPassword}
                   </p>
                 )}
               </div>

                           <div className="space-y-2">
                                <Label htmlFor="newPassword">{t('editProfile.password.new')}</Label>
                               <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder={t('editProfile.password.placeholderNew')}
                    className={passwordErrors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
               {/* Indicador de força da senha */}
               {passwordData.newPassword && (
                 <div className="space-y-1">
                   <div className="flex gap-1">
                     {[1, 2, 3, 4].map((level) => {
                       let color = 'bg-gray-300';
                       if (passwordData.newPassword.length >= 8) {
                         if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
                           color = level <= 3 ? 'bg-green-500' : 'bg-green-400';
                         } else if (passwordData.newPassword.length >= 10) {
                           color = level <= 2 ? 'bg-yellow-500' : 'bg-gray-300';
                         } else {
                           color = level <= 1 ? 'bg-red-500' : 'bg-gray-300';
                         }
                       }
                       return (
                         <div
                           key={level}
                           className={`h-1 flex-1 rounded-full transition-all duration-300 ${color}`}
                         />
                       );
                     })}
                   </div>
                                       <p className="text-xs text-muted-foreground">
                      {passwordData.newPassword.length < 8 && t('editProfile.password.strength.veryWeak')}
                      {passwordData.newPassword.length >= 8 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword) && t('editProfile.password.strength.weak')}
                      {passwordData.newPassword.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword) && passwordData.newPassword.length < 12 && t('editProfile.password.strength.medium')}
                      {passwordData.newPassword.length >= 12 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword) && t('editProfile.password.strength.strong')}
                    </p>
                 </div>
               )}
               {passwordErrors.newPassword && (
                 <p className="text-sm text-destructive flex items-center gap-1">
                   <AlertTriangle size={14} />
                   {passwordErrors.newPassword}
                 </p>
               )}
             </div>
            </div>

                         <div className="space-y-2">
                               <Label htmlFor="confirmPassword">{t('editProfile.password.confirm')}</Label>
               <div className="relative">
                 <Input
                   id="confirmPassword"
                   type={showConfirmPassword ? "text" : "password"}
                   value={passwordData.confirmPassword}
                   onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                       placeholder={t('editProfile.password.placeholderConfirm')}
                   className={passwordErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                 />
                 <Button
                   type="button"
                   variant="ghost"
                   size="sm"
                   className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                 >
                   {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                 </Button>
               </div>
               {passwordErrors.confirmPassword && (
                 <p className="text-sm text-destructive flex items-center gap-1">
                   <AlertTriangle size={14} />
                   {passwordErrors.confirmPassword}
                 </p>
               )}
             </div>

            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="minecraft-btn bg-primary hover:bg-primary/90 text-white"
            >
              {changingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('editProfile.password.changing')}
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-2" />
                  {t('editProfile.password.change')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default EditProfilePage;
