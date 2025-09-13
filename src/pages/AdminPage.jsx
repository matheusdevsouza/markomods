import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Trash2, ListChecks, Edit3 } from 'lucide-react';
import { AuthContext } from '@/App';

const AdminPage = ({ onAddMod, mods, onDeleteMod }) => {
  const { toast } = useToast();
  const { currentUser } = useContext(AuthContext);

  const [modName, setModName] = useState('');
  const [modVersion, setModVersion] = useState('');
  const [minecraftVersion, setMinecraftVersion] = useState('');
  const [modDescription, setModDescription] = useState('');
  const [modAuthor, setModAuthor] = useState('');
  const [modTags, setModTags] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(''); 

  const [showForm, setShowForm] = useState(false);
  const [editingModId, setEditingModId] = useState(null);


  const resetForm = () => {
    setModName('');
    setModVersion('');
    setMinecraftVersion('');
    setModDescription('');
    setModAuthor('');
    setModTags('');
    setThumbnailUrl('');
    setGalleryUrls('');
    setDownloadUrl('');
    setShowForm(false);
    setEditingModId(null);
  };
  
  const handleEditMod = (mod) => {
    setModName(mod.name);
    setModVersion(mod.version);
    setMinecraftVersion(mod.minecraftVersion);
    setModDescription(mod.description);
    setModAuthor(mod.author);
    setModTags(mod.tags.join(', '));
    setThumbnailUrl(mod.thumbnailUrl);
    setGalleryUrls(mod.gallery.join(', '));
    setDownloadUrl(mod.downloadUrl);
    setEditingModId(mod.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      toast({ title: "Acesso Negado", description: "Você não tem permissão para esta ação.", variant: "destructive" });
      return;
    }
    if (!modName || !modVersion || !minecraftVersion || !modDescription || !modAuthor || !downloadUrl) {
      toast({
        title: "Erro de Validação",
        description: "Preencha todos os campos obrigatórios: Nome, Versão do Mod, Versão do Minecraft, Descrição, Autor e URL de Download.",
        variant: "destructive",
      });
      return;
    }

    const modData = {
      name: modName,
      version: modVersion,
      minecraftVersion: minecraftVersion,
      description: modDescription,
      author: modAuthor,
      tags: modTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      thumbnailUrl: thumbnailUrl || "/placeholder-images/default-thumb.jpg",
      gallery: galleryUrls.split(',').map(url => url.trim()).filter(url => url).length > 0 ? galleryUrls.split(',').map(url => url.trim()) : ["/placeholder-images/default-gallery-1.jpg", "/placeholder-images/default-gallery-2.jpg"],
      downloadUrl: downloadUrl,
    };

    if (editingModId) {
      // This part would typically call an onEditMod prop if we were fully implementing edit.
      // For now, we'll just simulate it by logging and resetting.
      // In a real app, you'd update the mods array in App.jsx
      const updatedMod = { ...modData, id: editingModId, uploadDate: mods.find(m => m.id === editingModId)?.uploadDate || new Date().toISOString().split('T')[0], comments: mods.find(m => m.id === editingModId)?.comments || [] };
      // onEditMod(updatedMod); // Assuming onEditMod exists and updates the state in App.jsx
      const currentMods = JSON.parse(localStorage.getItem("minecraftMods")) || [];
      const modIndex = currentMods.findIndex(mod => mod.id === editingModId);
      if (modIndex !== -1) {
        currentMods[modIndex] = updatedMod;
        localStorage.setItem("minecraftMods", JSON.stringify(currentMods));
         toast({ title: "Mod Atualizado!", description: `${updatedMod.name} foi atualizado com sucesso.` });
         // You might need to pass a function from App.jsx to update the state there as well for immediate UI update.
         // For now, a page refresh would show changes.
      } else {
        toast({ title: "Erro ao Atualizar", description: "Mod não encontrado para atualização.", variant: "destructive" });
      }
    } else {
       onAddMod(modData);
    }
    resetForm();
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="text-center py-6 rounded-lg bg-card/50 backdrop-blur-sm shadow-xl border border-border">
        <h1 className="text-4xl font-bold gradient-text-minecraft">Painel de Administração</h1>
        <p className="text-lg text-muted-foreground">Gerencie os mods do seu portal.</p>
      </header>

      {!showForm && (
        <motion.div className="text-center" initial={{scale:0.9}} animate={{scale:1}}>
          <Button onClick={() => { setShowForm(true); setEditingModId(null); }} size="lg" className="minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
            <PlusCircle size={24} className="mr-3" /> Adicionar Novo Mod
          </Button>
        </motion.div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="minecraft-card">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">{editingModId ? "Editar Mod" : "Adicionar Novo Mod"}</CardTitle>
              <CardDescription className="text-muted-foreground">Preencha os detalhes do mod.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="modName" className="text-foreground">Nome do Mod <span className="text-destructive">*</span></Label>
                    <Input id="modName" value={modName} onChange={(e) => setModName(e.target.value)} placeholder="Ex: Awesome Mod" className="bg-input border-border text-foreground focus:border-primary" required />
                  </div>
                  <div>
                    <Label htmlFor="modVersion" className="text-foreground">Versão do Mod <span className="text-destructive">*</span></Label>
                    <Input id="modVersion" value={modVersion} onChange={(e) => setModVersion(e.target.value)} placeholder="Ex: 1.2.3" className="bg-input border-border text-foreground focus:border-primary" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="minecraftVersion" className="text-foreground">Versão do Minecraft <span className="text-destructive">*</span></Label>
                    <Input id="minecraftVersion" value={minecraftVersion} onChange={(e) => setMinecraftVersion(e.target.value)} placeholder="Ex: 1.20.1" className="bg-input border-border text-foreground focus:border-primary" required />
                  </div>
                  <div>
                    <Label htmlFor="modAuthor" className="text-foreground">{t('modDetail.author')} <span className="text-destructive">*</span></Label>
                    <Input id="modAuthor" value={modAuthor} onChange={(e) => setModAuthor(e.target.value)} placeholder="Seu nome de criador" className="bg-input border-border text-foreground focus:border-primary" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="modDescription" className="text-foreground">Descrição <span className="text-destructive">*</span></Label>
                  <Textarea id="modDescription" value={modDescription} onChange={(e) => setModDescription(e.target.value)} placeholder="Descreva seu mod..." className="bg-input border-border text-foreground focus:border-primary min-h-[100px]" required />
                </div>
                <div>
                  <Label htmlFor="modTags" className="text-foreground">Tags (separadas por vírgula)</Label>
                  <Input id="modTags" value={modTags} onChange={(e) => setModTags(e.target.value)} placeholder="Ex: Aventura, Magia, Tech" className="bg-input border-border text-foreground focus:border-primary" />
                </div>
                <div>
                  <Label htmlFor="thumbnailUrl" className="text-foreground">URL da Thumbnail</Label>
                  <Input id="thumbnailUrl" type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://exemplo.com/imagem.jpg" className="bg-input border-border text-foreground focus:border-primary" />
                  <p className="text-xs text-muted-foreground mt-1">Deixe em branco para usar uma imagem padrão.</p>
                </div>
                <div>
                  <Label htmlFor="galleryUrls" className="text-foreground">URLs da Galeria (separadas por vírgula)</Label>
                  <Input id="galleryUrls" value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} placeholder="https://exemplo.com/img1.jpg, https://exemplo.com/img2.jpg" className="bg-input border-border text-foreground focus:border-primary" />
                   <p className="text-xs text-muted-foreground mt-1">Deixe em branco para usar imagens padrão. Separe múltiplas URLs com vírgula.</p>
                </div>
                 <div>
                  <Label htmlFor="downloadUrl" className="text-foreground">URL de Download <span className="text-destructive">*</span></Label>
                  <Input id="downloadUrl" type="url" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://exemplo.com/mod.zip" className="bg-input border-border text-foreground focus:border-primary" required />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={resetForm} className="minecraft-btn border-muted text-muted-foreground hover:bg-muted/20">Cancelar</Button>
                  <Button type="submit" className="minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground">{editingModId ? "Salvar Alterações" : "Adicionar Mod"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="minecraft-card mt-10">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center"><ListChecks size={28} className="mr-3"/> Mods Publicados ({mods.length})</CardTitle>
          <CardDescription className="text-muted-foreground">Veja e gerencie os mods existentes.</CardDescription>
        </CardHeader>
        <CardContent>
          {mods.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum mod publicado ainda.</p>
          ) : (
            <ul className="space-y-3">
              {mods.map(mod => (
                <li key={mod.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-card/50 rounded-md border border-border hover:border-primary/50">
                  <div className="mb-2 sm:mb-0">
                    <span className="text-lg font-semibold text-foreground">{mod.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">(v{mod.version} para MC {mod.minecraftVersion})</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditMod(mod)} className="minecraft-btn border-primary text-primary hover:bg-primary/20 px-3 py-1">
                      <Edit3 size={16} className="mr-1" /> Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDeleteMod(mod.id)} className="minecraft-btn bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1">
                      <Trash2 size={16} className="mr-1" /> Excluir
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

    </motion.div>
  );
};

export default AdminPage;