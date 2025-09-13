import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Palette } from 'lucide-react';

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

const AdminThemeSettingsSection = ({ themeSettingsData, onThemeSettingsChange }) => {
  const handleInputChange = (e) => {
    onThemeSettingsChange({ ...themeSettingsData, [e.target.name]: e.target.value });
  };

  return (
    <SectionWrapper title="Configurações de Tema" description="Personalize as cores principais do site. Use valores HSL (ex: 262.1 83.3% 57.8%)." icon={Palette}>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="themePrimary">Cor Primária (Botões, Destaques)</Label>
          <Input id="themePrimary" name="primary" value={themeSettingsData?.primary || ''} onChange={handleInputChange} />
        </div>
        <div>
          <Label htmlFor="themeBackground">Cor de Fundo Principal</Label>
          <Input id="themeBackground" name="background" value={themeSettingsData?.background || ''} onChange={handleInputChange} />
        </div>
      </div>
      {/* O botão de salvar tema foi removido daqui, pois o salvamento é global no AdminDashboardPage */}
    </SectionWrapper>
  );
};

export default AdminThemeSettingsSection;