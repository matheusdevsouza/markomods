
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, User as UserIcon, Video, Link as LinkIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

import AdminGenericListSection from '@/components/admin/AdminGenericListSection';
import AdminJsonEditorSection from '@/components/admin/AdminJsonEditorSection';
import AdminUserManagementSection from '@/components/admin/AdminUserManagementSection';
import AdminPlatformMetricsSection from '@/components/admin/AdminPlatformMetricsSection';
import AdminCommentsManagementSection from '@/components/admin/AdminCommentsManagementSection';

const SectionWrapper = ({ title, description, children, icon: Icon, className }) => (
  <Card className={`glass-effect mb-8 ${className}`}>
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

const defaultPlatformData = (platformName) => ({
  platform_db_id: `platform_${platformName}_${Date.now()}`,
  platform_name: platformName,
  overall_followers: '',
  overall_views: '',
  main_city_override: '',
  average_views: '',
  total_likes: '',
  average_likes: '',
  average_comments: '',
  gender_stats: [],
  age_range_stats: [],
  location_stats: [],
});


const AdminDashboardPage = () => {
  const { currentUserProfile, users: allUsersList, updateUserProfileInList } = useAuth();
  const { mediaKitPublicData, fetchMediaKitData, targetProfileUsername, updateAndSaveMediaKitData, loadingData } = useData();
  const { toast } = useToast();
  
  const [profileDataForm, setProfileDataForm] = useState({ full_name: '', bio: '', avatar_url: '', username: '', email: '', comments_require_approval: true });
  const [platformsDataForm, setPlatformsDataForm] = useState([]);
  const [youtubeVideosForm, setYoutubeVideosForm] = useState([]);
  const [socialMediaLinksForm, setSocialMediaLinksForm] = useState([]);
  const [activePlatformAdmin, setActivePlatformAdmin] = useState('youtube');
  
  const [loadingSave, setLoadingSave] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const memoizedLoadAdminData = useCallback(() => {
    if (mediaKitPublicData && currentUserProfile) {
      setProfileDataForm(mediaKitPublicData.profile || { 
        full_name: currentUserProfile.full_name || '', 
        bio: currentUserProfile.bio || '', 
        avatar_url: currentUserProfile.avatar_url || '', 
        username: currentUserProfile.username, 
        email: currentUserProfile.email,
        comments_require_approval: mediaKitPublicData.profile?.comments_require_approval === undefined ? true : mediaKitPublicData.profile.comments_require_approval,
      });
      
      const fetchedPlatforms = mediaKitPublicData.platforms || [];
      const platformNames = ['youtube', 'tiktok', 'instagram'];
      const fullPlatformsData = platformNames.map(name => {
          const existing = fetchedPlatforms.find(p => p.platform_name === name);
          return existing || defaultPlatformData(name);
      });
      setPlatformsDataForm(fullPlatformsData);

      setYoutubeVideosForm(mediaKitPublicData.youtube_videos || []);
      setSocialMediaLinksForm(mediaKitPublicData.social_media_links || []);

      if (fullPlatformsData.length > 0 && !fullPlatformsData.find(p => p.platform_name === activePlatformAdmin)) {
        setActivePlatformAdmin(fullPlatformsData[0].platform_name);
      }
      setIsDataLoaded(true);
    }
  }, [mediaKitPublicData, currentUserProfile, activePlatformAdmin]);


  useEffect(() => {
    if (!loadingData && mediaKitPublicData && currentUserProfile && !isDataLoaded) {
        memoizedLoadAdminData();
    }
  }, [loadingData, mediaKitPublicData, currentUserProfile, memoizedLoadAdminData, isDataLoaded]);


  const handleProfileChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setProfileDataForm({ ...profileDataForm, [e.target.name]: value });
  };

  const handlePlatformDataChange = (platformName, field, value, index = null, subField = null) => {
    setPlatformsDataForm(prevPlatforms => 
      prevPlatforms.map(p => {
        if (p.platform_name === platformName) {
          if (index !== null && subField !== null) { 
            const newSubArray = [...(p[subField] || [])];
             if (newSubArray[index] === undefined) {
                newSubArray[index] = {};
             }
            newSubArray[index] = { ...newSubArray[index], [field]: value };
            return { ...p, [subField]: newSubArray };
          } else { 
            return { ...p, [field]: value };
          }
        }
        return p;
      })
    );
  };
  
  const handleSaveAllData = async () => {
    if (!currentUserProfile?.id) {
        toast({ title: "Erro", description: "Perfil do administrador não carregado.", variant: "destructive"});
        return;
    }
    setLoadingSave(true);
    try {
        const updatedMediaKitData = {
            ...mediaKitPublicData,
            profile: { 
              ...mediaKitPublicData.profile, 
              ...profileDataForm, 
              id: mediaKitPublicData.profile.id, 
              user_id: currentUserProfile.id, 
              updated_at: new Date().toISOString(),
              comments_require_approval: profileDataForm.comments_require_approval,
            },
            platforms: platformsDataForm,
            youtube_videos: youtubeVideosForm,
            social_media_links: socialMediaLinksForm,
        };
        
        updateAndSaveMediaKitData(updatedMediaKitData);
        
        const adminProfileInUsersList = allUsersList.find(u => u.id === currentUserProfile.id);
        if (adminProfileInUsersList) {
            const updatedAdminProfile = {
                ...adminProfileInUsersList,
                full_name: profileDataForm.full_name,
                bio: profileDataForm.bio,
                avatar_url: profileDataForm.avatar_url,
                username: profileDataForm.username,
                email: profileDataForm.email,
                updated_at: new Date().toISOString(),
            };
            updateUserProfileInList(updatedAdminProfile);
        }

      toast({ title: "Dados Salvos!", description: "Todas as informações foram atualizadas localmente." });
      fetchMediaKitData(targetProfileUsername); 

    } catch (error) {
      toast({ title: "Erro ao Salvar Dados", description: error.message, variant: "destructive" });
    } finally {
      setLoadingSave(false);
    }
  };

  const handleJsonUpdate = (jsonData) => {
    if (!currentUserProfile?.id) {
        toast({ title: "Erro", description: "Perfil do administrador não carregado.", variant: "destructive"});
        return;
    }
    setLoadingSave(true);
    try {
        const updatedMediaKitData = {
            ...jsonData, 
            profile: { 
              ...jsonData.profile, 
              user_id: currentUserProfile.id, 
              updated_at: new Date().toISOString(),
              comments_require_approval: jsonData.profile?.comments_require_approval === undefined ? true : jsonData.profile.comments_require_approval,
            },
            comments: (jsonData.comments || []).map(c => ({ ...c, is_approved: c.is_approved === undefined ? false : c.is_approved })),
        };
        
        updateAndSaveMediaKitData(updatedMediaKitData);
        
        setProfileDataForm(updatedMediaKitData.profile);
        setPlatformsDataForm(updatedMediaKitData.platforms || []);
        setYoutubeVideosForm(updatedMediaKitData.youtube_videos || []);
        setSocialMediaLinksForm(updatedMediaKitData.social_media_links || []);

        const adminProfileInUsersList = allUsersList.find(u => u.id === currentUserProfile.id);
        if (adminProfileInUsersList && updatedMediaKitData.profile) {
            const updatedAdminProfile = {
                ...adminProfileInUsersList,
                full_name: updatedMediaKitData.profile.full_name,
                bio: updatedMediaKitData.profile.bio,
                avatar_url: updatedMediaKitData.profile.avatar_url,
                username: updatedMediaKitData.profile.username,
                email: updatedMediaKitData.profile.email,
                updated_at: new Date().toISOString(),
            };
            updateUserProfileInList(updatedAdminProfile);
        }

        toast({ title: "Dados Salvos via JSON!", description: "Todas as informações foram atualizadas." });
        fetchMediaKitData(targetProfileUsername);
    } catch (error) {
        toast({ title: "Erro ao Salvar Dados via JSON", description: error.message, variant: "destructive" });
    } finally {
        setLoadingSave(false);
    }
  };


  if (loadingData || !isDataLoaded) {
    return <div className="flex justify-center items-center h-screen"><p>Carregando dados do painel...</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto py-8 px-2 md:px-0">
      <SectionWrapper title="Perfil Público" description="Informações que aparecerão no seu Media Kit." icon={UserIcon}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><Label htmlFor="full_name">Nome Completo</Label><Input id="full_name" name="full_name" value={profileDataForm.full_name || ''} onChange={handleProfileChange} /></div>
          <div><Label htmlFor="username">Nome de Usuário (URL)</Label><Input id="username" name="username" value={profileDataForm.username || ''} onChange={handleProfileChange} disabled/></div>
          <div><Label htmlFor="email">Email de Contato</Label><Input id="email" name="email" type="email" value={profileDataForm.email || ''} onChange={handleProfileChange} /></div>
          <div><Label htmlFor="avatar_url">URL da Imagem de Avatar</Label><Input id="avatar_url" name="avatar_url" value={profileDataForm.avatar_url || ''} onChange={handleProfileChange} /></div>
          <div className="md:col-span-2"><Label htmlFor="bio">Bio Curta</Label><Textarea id="bio" name="bio" value={profileDataForm.bio || ''} onChange={handleProfileChange} /></div>
        </div>
      </SectionWrapper>

      <AdminGenericListSection
        sectionKey="socialLinks"
        title="Links Sociais"
        itemData={socialMediaLinksForm}
        onDataChange={setSocialMediaLinksForm}
        fields={[
          { name: 'platform_key', label: 'Chave da Plataforma (ex: youtube, tiktok, email)' },
          { name: 'url', label: 'URL Completa' },
          { name: 'display_name', label: 'Nome de Exibição (ex: Meu YouTube)' },
        ]}
        icon={LinkIcon}
      />

      <AdminGenericListSection
        sectionKey="youtubeVideos"
        title="Vídeos do YouTube (Portfólio)"
        itemData={youtubeVideosForm}
        onDataChange={setYoutubeVideosForm}
        fields={[
          { name: 'title', label: 'Título do Vídeo' },
          { name: 'video_url', label: 'URL do Vídeo' },
          { name: 'thumbnail_url', label: 'URL da Thumbnail' },
          { name: 'views_text', label: 'Visualizações (texto, ex: 1.2M)' },
          { name: 'publish_date_text', label: 'Data de Publicação (texto, ex: 2 semanas atrás)' },
        ]}
        icon={Video}
      />
      
      <AdminPlatformMetricsSection
        platformsData={platformsDataForm}
        onPlatformDataChange={handlePlatformDataChange}
        activePlatform={activePlatformAdmin}
        onActivePlatformChange={setActivePlatformAdmin}
      />
      
      <AdminCommentsManagementSection />
      <AdminUserManagementSection />

      <AdminJsonEditorSection
        currentData={mediaKitPublicData}
        onJsonUpdate={handleJsonUpdate}
      />
      
      <div className="mt-10 flex justify-end">
        <Button onClick={handleSaveAllData} disabled={loadingSave} size="lg" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white glow-on-hover">
          <Save size={18} className="mr-2" />
          Salvar Todos os Dados
        </Button>
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;