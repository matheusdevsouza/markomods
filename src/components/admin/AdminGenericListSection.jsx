import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';

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

const AdminGenericListSection = ({ sectionKey, title, itemData, fields, onDataChange, icon }) => {
  const handleInputChange = (index, fieldName, value) => {
    const newData = [...itemData];
    newData[index] = { ...newData[index], [fieldName]: value };
    onDataChange(newData);
  };

  const handleAddItem = () => {
    const newItem = fields.reduce((acc, field) => {
      acc[field.name] = field.type === 'number' ? 0 : '';
      return acc;
    }, {});
    onDataChange([...itemData, newItem]);
  };

  const handleRemoveItem = (index) => {
    onDataChange(itemData.filter((_, i) => i !== index));
  };

  return (
    <SectionWrapper title={title} icon={icon}>
      {(itemData || []).map((item, index) => (
        <Card key={`${sectionKey}-${index}`} className="mb-4 p-4 bg-card/60 border border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.name}>
                <Label htmlFor={`${sectionKey}-${index}-${field.name}`}>{field.label || field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={`${sectionKey}-${index}-${field.name}`}
                    value={item[field.name] || ''}
                    onChange={(e) => handleInputChange(index, field.name, e.target.value)}
                  />
                ) : (
                  <Input
                    id={`${sectionKey}-${index}-${field.name}`}
                    type={field.type || 'text'}
                    value={item[field.name] || ''}
                    onChange={(e) => handleInputChange(index, field.name, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(index)} className="mt-3">
            <Trash2 size={16} className="mr-2" /> Remover Item
          </Button>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={handleAddItem} className="mt-4 glow-on-hover">
        <PlusCircle size={16} className="mr-2" /> Adicionar {title.slice(0,-1)}
      </Button>
    </SectionWrapper>
  );
};

export default AdminGenericListSection;