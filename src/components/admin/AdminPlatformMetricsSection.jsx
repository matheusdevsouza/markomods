import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminGenericListSection from '@/components/admin/AdminGenericListSection';
import { BarChart2 } from 'lucide-react';

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

const AdminPlatformMetricsSection = ({ platformsData, onPlatformDataChange, activePlatform, onActivePlatformChange }) => {
  
  const currentPlatformAdminData = platformsData.find(p => p.platform_name === activePlatform) || {};

  return (
    <SectionWrapper title="Métricas das Plataformas" description="Dados de audiência para cada plataforma." icon={BarChart2}>
      <Tabs value={activePlatform} onValueChange={onActivePlatformChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
        </TabsList>
        {['youtube', 'tiktok', 'instagram'].map(platformName => (
          <TabsContent key={platformName} value={platformName}>
            {currentPlatformAdminData && currentPlatformAdminData.platform_name === platformName && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-primary-foreground mb-3 capitalize">{platformName} - Métricas Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><Label>Seguidores</Label><Input value={currentPlatformAdminData.overall_followers || ''} onChange={e => onPlatformDataChange(platformName, 'overall_followers', e.target.value)} /></div>
                  <div><Label>Visualizações (Total)</Label><Input value={currentPlatformAdminData.overall_views || ''} onChange={e => onPlatformDataChange(platformName, 'overall_views', e.target.value)} /></div>
                  <div><Label>Média Views/Vídeo</Label><Input value={currentPlatformAdminData.average_views || ''} onChange={e => onPlatformDataChange(platformName, 'average_views', e.target.value)} /></div>
                  <div><Label>Curtidas (Total)</Label><Input value={currentPlatformAdminData.total_likes || ''} onChange={e => onPlatformDataChange(platformName, 'total_likes', e.target.value)} /></div>
                  <div><Label>Média Curtidas/Vídeo</Label><Input value={currentPlatformAdminData.average_likes || ''} onChange={e => onPlatformDataChange(platformName, 'average_likes', e.target.value)} /></div>
                  <div><Label>Média Comentários/Vídeo</Label><Input value={currentPlatformAdminData.average_comments || ''} onChange={e => onPlatformDataChange(platformName, 'average_comments', e.target.value)} /></div>
                  <div><Label>Cidade Principal (Override)</Label><Input value={currentPlatformAdminData.main_city_override || ''} onChange={e => onPlatformDataChange(platformName, 'main_city_override', e.target.value)} placeholder="Deixe em branco para usar a primeira da lista"/></div>
                </div>

                <AdminGenericListSection
                  sectionKey={`${platformName}-gender`} title="Estatísticas de Gênero" itemData={currentPlatformAdminData.gender_stats || []}
                  onDataChange={(newData) => onPlatformDataChange(platformName, null, newData, null, 'gender_stats')}
                  fields={[ { name: 'category_name', label: 'Categoria' }, { name: 'percentage', label: '%', type: 'number' }, { name: 'color', label: 'Cor (HSL)' } ]}
                />
                <AdminGenericListSection
                  sectionKey={`${platformName}-age`} title="Faixas Etárias" itemData={currentPlatformAdminData.age_range_stats || []}
                  onDataChange={(newData) => onPlatformDataChange(platformName, null, newData, null, 'age_range_stats')}
                  fields={[ { name: 'age_range', label: 'Faixa' }, { name: 'percentage', label: '%', type: 'number' }, { name: 'color', label: 'Cor (HSL)' }, { name: 'sort_order', label: 'Ordem', type: 'number' } ]}
                />
                <AdminGenericListSection
                  sectionKey={`${platformName}-location`} title="Localidades" itemData={currentPlatformAdminData.location_stats || []}
                  onDataChange={(newData) => onPlatformDataChange(platformName, null, newData, null, 'location_stats')}
                  fields={[ { name: 'city', label: 'Cidade' }, { name: 'state', label: 'Estado' }, { name: 'users_count_text', label: 'Nº Usuários (Texto)' }, { name: 'percentage', label: '%', type: 'number' } ]}
                />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </SectionWrapper>
  );
};

export default AdminPlatformMetricsSection;