import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, DownloadCloud, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

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

const AdminJsonEditorSection = ({ currentData, onJsonUpdate }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleJsonTextChange = (e) => {
    setJsonText(e.target.value);
    setError('');
  };

  const handleLoadJson = () => {
    try {
      const parsedData = JSON.parse(jsonText);
      onJsonUpdate(parsedData);
      toast({ title: "JSON Carregado!", description: "Os dados foram atualizados com sucesso a partir do JSON." });
      setError('');
    } catch (e) {
      setError(`Erro ao processar JSON: ${e.message}`);
      toast({ title: "Erro no JSON", description: `Formato inválido. ${e.message}`, variant: "destructive" });
    }
  };

  const handleExportJson = () => {
    const currentJsonString = JSON.stringify(currentData, null, 2);
    setJsonText(currentJsonString);
    navigator.clipboard.writeText(currentJsonString)
      .then(() => {
        toast({ title: "JSON Exportado!", description: "Os dados atuais foram copiados para a área de transferência e exibidos abaixo." });
      })
      .catch(err => {
        toast({ title: "Erro ao Exportar", description: "Não foi possível copiar para a área de transferência.", variant: "destructive" });
        console.error('Failed to copy JSON: ', err);
      });
  };

  return (
    <SectionWrapper title="Editor JSON Avançado" description="Atualize todos os dados do Media Kit de uma vez colando um JSON. Use com cuidado." icon={UploadCloud}>
      <div className="space-y-4">
        <Textarea
          placeholder="Cole seu JSON aqui..."
          value={jsonText}
          onChange={handleJsonTextChange}
          rows={15}
          className="font-mono text-sm bg-input/70 border-border focus:border-primary"
        />
        {error && (
          <p className="text-sm text-destructive flex items-center">
            <AlertTriangle size={16} className="mr-2" /> {error}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleLoadJson} className="flex-1 glow-on-hover bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <UploadCloud size={16} className="mr-2" />
            Carregar JSON
          </Button>
          <Button onClick={handleExportJson} variant="outline" className="flex-1">
            <DownloadCloud size={18} className="mr-2" /> Exportar JSON Atual
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong>Atenção:</strong> Carregar um JSON substituirá todos os dados atuais do Media Kit (exceto usuários e comentários). 
          Recomenda-se exportar o JSON atual como backup antes de carregar um novo.
        </p>
      </div>
    </SectionWrapper>
  );
};

export default AdminJsonEditorSection;