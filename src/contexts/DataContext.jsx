
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const DataContext = createContext(null);

const LOCAL_STORAGE_MEDIA_KIT_KEY = 'mediaKitData';
const TARGET_PROFILE_USERNAME = 'EuMarko'; 

const initialMediaKitStructure = {
  profile: {
    id: `profile_${TARGET_PROFILE_USERNAME}`,
    user_id: null, 
    username: TARGET_PROFILE_USERNAME,
    full_name: 'Eu, Marko!',
    bio: 'Criador de conteúdo, Mods de Minecraft, Shorts virais, etc.',
    avatar_url: '/assets/marko-avatar.png',
    email: 'contato@eumarko.com',
    role: 'admin',
    is_verified: true,
    comments_require_approval: true, 
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  platforms: [
    {
      platform_db_id: `platform_youtube_${TARGET_PROFILE_USERNAME}`,
      platform_name: 'youtube',
      overall_followers: '1.2M+',
      overall_views: '500M+',
      main_city_override: 'São Paulo',
      average_views: '50k',
      total_likes: '10M+',
      average_likes: '2k',
      average_comments: '500+',
      gender_stats: [
        { category_name: 'Masculino', percentage: 65, color: 'hsl(220, 70%, 50%)' },
        { category_name: 'Feminino', percentage: 30, color: 'hsl(330, 70%, 50%)' },
        { category_name: 'Outros', percentage: 5, color: 'hsl(100, 50%, 50%)' },
      ],
      age_range_stats: [
        { age_range: '13-17', percentage: 15, color: 'hsl(200, 80%, 60%)', sort_order: 1 },
        { age_range: '18-24', percentage: 40, color: 'hsl(220, 80%, 60%)', sort_order: 2 },
        { age_range: '25-34', percentage: 30, color: 'hsl(240, 80%, 60%)', sort_order: 3 },
      ],
      location_stats: [
        { city: 'São Paulo', state: 'SP', users_count_text: '100k', percentage: 40 },
        { city: 'Rio de Janeiro', state: 'RJ', users_count_text: '80k', percentage: 30 },
      ],
    },
    {
      platform_db_id: `platform_tiktok_${TARGET_PROFILE_USERNAME}`,
      platform_name: 'tiktok',
      overall_followers: '3M+',
      overall_views: '1B+',
      main_city_override: 'Rio de Janeiro',
      average_views: '200k',
      total_likes: '50M+',
      average_likes: '10k',
      average_comments: '1k+',
      gender_stats: [
        { category_name: 'Feminino', percentage: 55, color: 'hsl(330, 70%, 55%)' },
        { category_name: 'Masculino', percentage: 40, color: 'hsl(220, 70%, 55%)' },
        { category_name: 'Outros', percentage: 5, color: 'hsl(100, 50%, 55%)' },
      ],
      age_range_stats: [],
      location_stats: [],
    },
    {
      platform_db_id: `platform_instagram_${TARGET_PROFILE_USERNAME}`,
      platform_name: 'instagram',
      overall_followers: '500k+',
      overall_views: '100M+',
      main_city_override: 'Belo Horizonte',
      average_views: '20k',
      total_likes: '5M+',
      average_likes: '1k',
      average_comments: '200+',
      gender_stats: [
        { category_name: 'Feminino', percentage: 60, color: 'hsl(300, 70%, 50%)' },
        { category_name: 'Masculino', percentage: 35, color: 'hsl(200, 70%, 50%)' },
        { category_name: 'Outros', percentage: 5, color: 'hsl(50, 50%, 50%)' },
      ],
      age_range_stats: [],
      location_stats: [],
    },
  ],
  youtube_videos: [
    { id: 'vid1', title: 'Meu Mod MAIS ÉPICO!', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail_url: '/placeholder-images/epic-fight-thumb.jpg', views_text: '1.2M views', publish_date_text: '2 semanas atrás' },
    { id: 'vid2', title: 'Review de Hardware Monstruoso', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail_url: '/placeholder-images/tech-revolution-thumb.jpg', views_text: '800k views', publish_date_text: '1 mês atrás' },
  ],
  social_media_links: [
    { id: 'sml1', platform_key: 'email', url: 'mailto:contato@eumarko.com', display_name: 'contato@eumarko.com' },
    { id: 'sml2', platform_key: 'youtube', url: 'https://youtube.com/eumarko', display_name: 'YouTube' },
    { id: 'sml3', platform_key: 'tiktok', url: 'https://tiktok.com/@eumarko', display_name: 'TikTok' },
    { id: 'sml4', platform_key: 'instagram', url: 'https://instagram.com/eumarko', display_name: 'Instagram' },
    { id: 'sml5', platform_key: 'kwai', url: 'https://kwai.com/eumarko', display_name: 'Kwai' },
    { id: 'sml6', platform_key: 'mods_site', url: 'https://seusite.com/mods', display_name: 'Baixar Mods' },
    { id: 'sml7', platform_key: 'discord', url: 'https://discord.gg/eumarko', display_name: 'Discord' },
  ],
  comments: [],
};


export const DataProvider = ({ children }) => {
  const [mediaKitPublicData, setMediaKitPublicData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  const fetchMediaKitData = useCallback((usernameToLoad) => {
    setLoadingData(true);
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_MEDIA_KIT_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.profile && parsedData.profile.username === usernameToLoad) {
          
          const dataWithDefaults = {
            ...initialMediaKitStructure,
            ...parsedData,
            profile: {
              ...initialMediaKitStructure.profile,
              ...(parsedData.profile || {}),
              comments_require_approval: parsedData.profile?.comments_require_approval === undefined ? initialMediaKitStructure.profile.comments_require_approval : parsedData.profile.comments_require_approval,
            },
            comments: (parsedData.comments || []).map(c => ({ ...c, is_approved: c.is_approved === undefined ? false : c.is_approved }))
          };
          setMediaKitPublicData(dataWithDefaults);
        } else {
          setMediaKitPublicData(initialMediaKitStructure);
          localStorage.setItem(LOCAL_STORAGE_MEDIA_KIT_KEY, JSON.stringify(initialMediaKitStructure));
        }
      } else {
        setMediaKitPublicData(initialMediaKitStructure);
        localStorage.setItem(LOCAL_STORAGE_MEDIA_KIT_KEY, JSON.stringify(initialMediaKitStructure));
      }
    } catch (error) {
      console.error("Error fetching media kit data from localStorage:", error);
      toast({ title: "Erro ao carregar Media Kit", description: "Não foi possível carregar os dados locais.", variant: "destructive" });
      setMediaKitPublicData(initialMediaKitStructure); 
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  const updateAndSaveMediaKitData = useCallback((newData) => {
    const dataToSave = {
      ...newData,
      profile: {
        ...newData.profile,
        comments_require_approval: newData.profile?.comments_require_approval === undefined ? initialMediaKitStructure.profile.comments_require_approval : newData.profile.comments_require_approval,
      },
      comments: (newData.comments || []).map(c => ({ ...c, is_approved: c.is_approved === undefined ? false : c.is_approved }))
    };
    setMediaKitPublicData(dataToSave);
    localStorage.setItem(LOCAL_STORAGE_MEDIA_KIT_KEY, JSON.stringify(dataToSave));
  }, []);


  useEffect(() => {
    fetchMediaKitData(TARGET_PROFILE_USERNAME);
  }, [fetchMediaKitData]);

  return (
    <DataContext.Provider value={{ mediaKitPublicData, loadingData, fetchMediaKitData, updateAndSaveMediaKitData, targetProfileUsername: TARGET_PROFILE_USERNAME }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
