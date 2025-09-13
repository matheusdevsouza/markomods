import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, PlusCircle, Trash2 } from 'lucide-react';

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

const AdminAudienceInsightsSection = ({ audienceInsightsData, onAudienceInsightsChange }) => {
  const handleInputChange = (category, index, field, value) => {
    const updatedCategoryData = [...audienceInsightsData[category]];
    updatedCategoryData[index] = { ...updatedCategoryData[index], [field]: value };
    onAudienceInsightsChange({ ...audienceInsightsData, [category]: updatedCategoryData });
  };

  const handleMainCityChange = (e) => {
    onAudienceInsightsChange({ ...audienceInsightsData, mainCity: e.target.value });
  };

  const handleAddItem = (category) => {
    let newItem = {};
    if (category === 'gender') newItem = { name: '', value: 0, color: 'hsl(var(--primary))' };
    else if (category === 'ageRange') newItem = { range: '', value: 0, color: 'hsl(var(--primary))' };
    else if (category === 'location') newItem = { city: '', state: '', users: '', percentage: 0 };
    
    onAudienceInsightsChange({ ...audienceInsightsData, [category]: [...(audienceInsightsData[category] || []), newItem] });
  };

  const handleRemoveItem = (category, index) => {
    const updatedCategoryData = audienceInsightsData[category].filter((_, i) => i !== index);
    onAudienceInsightsChange({ ...audienceInsightsData, [category]: updatedCategoryData });
  };

  return (
    <SectionWrapper title="Métricas de Audiência" icon={Users} description="Dados sobre seu público.">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-primary-foreground mb-2">Gênero</h3>
          {(audienceInsightsData.gender || []).map((item, index) => (
            <Card key={`gender-${index}`} className="mb-3 p-3 bg-card/60">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <Input placeholder="Nome (Ex: Masculino)" value={item.name || ''} onChange={(e) => handleInputChange('gender', index, 'name', e.target.value)} />
                <Input type="number" placeholder="Valor (%)" value={item.value || 0} onChange={(e) => handleInputChange('gender', index, 'value', parseFloat(e.target.value) || 0)} />
                <Input placeholder="Cor (HSL)" value={item.color || ''} onChange={(e) => handleInputChange('gender', index, 'color', e.target.value)} />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem('gender', index)} className="mt-2 text-destructive hover:text-destructive/80">
                <Trash2 size={14} /> Remover
              </Button>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('gender')} className="glow-on-hover">
            <PlusCircle size={16} className="mr-2" /> Adicionar Gênero
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-primary-foreground mb-2">Faixa Etária</h3>
          {(audienceInsightsData.ageRange || []).map((item, index) => (
            <Card key={`age-${index}`} className="mb-3 p-3 bg-card/60">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <Input placeholder="Faixa (Ex: 18-24)" value={item.range || ''} onChange={(e) => handleInputChange('ageRange', index, 'range', e.target.value)} />
                <Input type="number" placeholder="Valor (%)" value={item.value || 0} onChange={(e) => handleInputChange('ageRange', index, 'value', parseFloat(e.target.value) || 0)} />
                <Input placeholder="Cor (HSL)" value={item.color || ''} onChange={(e) => handleInputChange('ageRange', index, 'color', e.target.value)} />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem('ageRange', index)} className="mt-2 text-destructive hover:text-destructive/80">
                <Trash2 size={14} /> Remover
              </Button>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('ageRange')} className="glow-on-hover">
            <PlusCircle size={16} className="mr-2" /> Adicionar Faixa Etária
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-primary-foreground mb-2">Localidade</h3>
          <Label htmlFor="mainCity" className="text-sm">Cidade Principal (para destaque)</Label>
          <Input id="mainCity" placeholder="Ex: São Paulo" value={audienceInsightsData.mainCity || ''} onChange={handleMainCityChange} className="mb-3"/>
          {(audienceInsightsData.location || []).map((item, index) => (
            <Card key={`loc-${index}`} className="mb-3 p-3 bg-card/60">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <Input placeholder="Cidade" value={item.city || ''} onChange={(e) => handleInputChange('location', index, 'city', e.target.value)} />
                <Input placeholder="Estado (UF)" value={item.state || ''} onChange={(e) => handleInputChange('location', index, 'state', e.target.value)} />
                <Input placeholder="Usuários (Ex: 40,9k)" value={item.users || ''} onChange={(e) => handleInputChange('location', index, 'users', e.target.value)} />
                <Input type="number" placeholder="Porcentagem (%)" value={item.percentage || 0} onChange={(e) => handleInputChange('location', index, 'percentage', parseFloat(e.target.value) || 0)} />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem('location', index)} className="mt-2 text-destructive hover:text-destructive/80">
                <Trash2 size={14} /> Remover
              </Button>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('location')} className="glow-on-hover">
            <PlusCircle size={16} className="mr-2" /> Adicionar Localidade
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default AdminAudienceInsightsSection;