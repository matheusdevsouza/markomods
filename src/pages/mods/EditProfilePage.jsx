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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  EyeOff,
  Trash2,
  Mail
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
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    display_name: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailSentModal, setShowEmailSentModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletePasswordData, setDeletePasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [deletePasswordErrors, setDeletePasswordErrors] = useState({});
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showDeleteConfirmPassword, setShowDeleteConfirmPassword] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        display_name: currentUser.display_name || ''
      });
    }
  }, [currentUser]);

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
    
    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = t('editProfile.validation.passwordDifferentFromCurrent');
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        
        if (updateUser && data.data?.user) {
          console.log('Dados do usuário atualizados:', data.data.user);
          updateUser(data.data.user);
          
          setTimeout(() => {
            console.log('Estado atual do usuário:', currentUser);
          }, 100);
        }
        
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
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
  };

  const validateDeletePassword = () => {
    const newErrors = {};
    
    if (!deletePasswordData.password) {
      newErrors.password = 'Por favor, digite sua senha';
    }
    
    if (!deletePasswordData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme sua senha';
    } else if (deletePasswordData.password !== deletePasswordData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setDeletePasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestAccountDeletion = async () => {
    if (!validateDeletePassword()) return;
    
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/user/account/delete/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: deletePasswordData.password,
          confirmPassword: deletePasswordData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowDeleteModal(false);
        setShowEmailSentModal(true);
        setDeletePasswordData({
          password: '',
          confirmPassword: ''
        });
        setDeletePasswordErrors({});
      } else {
        toast({
          title: 'Erro ao solicitar exclusão',
          description: data.message || 'Erro ao solicitar exclusão de conta',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar exclusão de conta:', error);
      toast({
        title: 'Erro de conexão',
        description: 'Erro ao conectar com o servidor',
        variant: "destructive"
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent flex items-center gap-3">
                  <User className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  {t('editProfile.title')}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10">{t('editProfile.subtitle')}</p>
              </div>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline" 
                className="text-primary hover:!text-primary hover:bg-primary/10 hover:border-primary/50 text-sm sm:text-base w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>

            <div className="grid gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-minecraft text-primary flex items-center">
                  <Camera size={22} className="mr-2 text-primary" />
                  {t('editProfile.avatar.title')}
                </CardTitle>
                <CardDescription>
                  {t('editProfile.avatar.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
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

                  <div className="flex flex-col gap-3">
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
                        className="hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                      >
                        <Camera size={16} className="mr-2" />
                        {t('editProfile.avatar.selectImage')}
                      </Button>
                      {selectedFile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSelectedFile}
                          className="border-destructive text-destructive hover:bg-destructive/10 hover:border-destructive/50"
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
                        className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white"
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-minecraft text-primary flex items-center">
                    <User size={22} className="mr-2 text-primary" />
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
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white"
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-minecraft text-primary flex items-center">
                    <Lock size={22} className="mr-2 text-primary" />
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
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white"
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="!bg-transparent bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-500/10 border border-red-500/30 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-minecraft text-red-500 flex items-center">
                    <Trash2 size={22} className="mr-2 text-red-500" />
                    Excluir Conta
                  </CardTitle>
                  <CardDescription className="text-red-400/80">
                    Esta ação é permanente e não pode ser desfeita
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-400 mb-3">
                      <strong>Atenção:</strong> Ao excluir sua conta, todos os seus dados serão permanentemente removidos, incluindo:
                    </p>
                    <ul className="text-sm text-red-300/90 list-disc list-inside space-y-1 ml-2">
                      <li>Seu perfil e informações pessoais</li>
                      <li>Seus mods e conteúdo criado</li>
                      <li>Seus comentários e interações</li>
                      <li>Seus favoritos e downloads</li>
                      <li>Todo o histórico de atividades</li>
                    </ul>
                  </div>
                  
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Excluir Minha Conta
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão de Conta
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Esta ação é <strong>IRREVERSÍVEL</strong>. Todos os dados relacionados à sua conta serão permanentemente excluídos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
                Para confirmar a exclusão, digite sua senha duas vezes:
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deletePassword">Senha</Label>
              <div className="relative">
                <Input
                  id="deletePassword"
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePasswordData.password}
                  onChange={(e) => setDeletePasswordData({ ...deletePasswordData, password: e.target.value })}
                  placeholder="Digite sua senha"
                  className={deletePasswordErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                >
                  {showDeletePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {deletePasswordErrors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle size={14} />
                  {deletePasswordErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deleteConfirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="deleteConfirmPassword"
                  type={showDeleteConfirmPassword ? "text" : "password"}
                  value={deletePasswordData.confirmPassword}
                  onChange={(e) => setDeletePasswordData({ ...deletePasswordData, confirmPassword: e.target.value })}
                  placeholder="Digite sua senha novamente"
                  className={deletePasswordErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowDeleteConfirmPassword(!showDeleteConfirmPassword)}
                >
                  {showDeleteConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {deletePasswordErrors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle size={14} />
                  {deletePasswordErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletePasswordData({ password: '', confirmPassword: '' });
                setDeletePasswordErrors({});
              }}
              disabled={deletingAccount}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRequestAccountDeletion}
              disabled={deletingAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingAccount ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailSentModal} onOpenChange={setShowEmailSentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Mail className="h-5 w-5" />
              Verifique seu E-mail
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Enviamos um e-mail de confirmação para <strong>{currentUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                Para concluir a exclusão da sua conta:
              </p>
              <ol className="text-sm text-blue-700 dark:text-blue-400 list-decimal list-inside space-y-1 ml-2">
                <li>Verifique sua caixa de entrada (e pasta de spam)</li>
                <li>Clique no botão de confirmação no e-mail</li>
                <li>Sua conta será excluída permanentemente</li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                <strong>Importante:</strong> O link de confirmação expira em 24 horas. Se você não solicitou a exclusão, ignore o e-mail.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowEmailSentModal(false)}
              className="w-full"
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditProfilePage;
