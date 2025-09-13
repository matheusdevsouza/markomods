import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

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

const AdminProfileSection = ({ profileData, contactData, onProfileChange, onContactChange }) => {
  const { t } = useTranslation();
  
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    onProfileChange({ ...profileData, [name]: value });
  };

  const handleTagsChange = (e) => {
    onProfileChange({ ...profileData, tags: e.target.value.split(',').map(tag => tag.trim()) });
  };
  
  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    onContactChange({ ...contactData, [name]: value });
  };

  return (
    <>
      <SectionWrapper title="Perfil Principal" description="Informações básicas sobre você." icon={User}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="profileName">Nome</Label>
            <Input id="profileName" name="name" value={profileData.name || ''} onChange={handleProfileInputChange} />
          </div>
          <div>
            <Label htmlFor="profileBio">Bio</Label>
            <Textarea id="profileBio" name="bio" value={profileData.bio || ''} onChange={handleProfileInputChange} />
          </div>
          <div>
            <Label htmlFor="profileAvatarUrl">URL do Avatar</Label>
            <Input id="profileAvatarUrl" name="avatarUrl" value={profileData.avatarUrl || ''} onChange={handleProfileInputChange} />
          </div>
          <div>
            <Label htmlFor="profileTags">Tags (separadas por vírgula)</Label>
            <Input id="profileTags" name="tags" value={(profileData.tags || []).join(', ')} onChange={handleTagsChange} />
          </div>
        </div>
      </SectionWrapper>
      <SectionWrapper title={t('modDetail.information')} icon={User}>
        <div className="space-y-4">
            <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input id="contactEmail" name="email" type="email" value={contactData.email || ''} onChange={handleContactInputChange} />
            </div>
            <div>
                <Label htmlFor="contactPhone">Telefone</Label>
                <Input id="contactPhone" name="phone" type="tel" value={contactData.phone || ''} onChange={handleContactInputChange} />
            </div>
             <div>
                <Label htmlFor="contactWhatsapp">Link WhatsApp (completo com https://wa.me/...)</Label>
                <Input id="contactWhatsapp" name="whatsappLink" type="url" value={contactData.whatsappLink || ''} onChange={handleContactInputChange} />
            </div>
            <div>
                <Label htmlFor="contactLocation">Localização</Label>
                <Input id="contactLocation" name="location" value={contactData.location || ''} onChange={handleContactInputChange} />
            </div>
        </div>
      </SectionWrapper>
    </>
  );
};

export default AdminProfileSection;