import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Save, UploadCloud, Trash2, Edit, Eye, Calendar, Tag, FileText, AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import { 
  Sparkles, Bug, BookOpen, Palette, RotateCcw, Zap, TestTube, 
  Wrench, Rocket, Building2, Undo2 
} from 'lucide-react';

const entryTypes = [
  { value: 'feat', label: 'feat', description: 'Nova funcionalidade', color: 'bg-green-500', icon: Sparkles },
  { value: 'fix', label: 'fix', description: 'Correção de bug', color: 'bg-red-500', icon: Bug },
  { value: 'docs', label: 'docs', description: 'Documentação', color: 'bg-blue-500', icon: BookOpen },
  { value: 'style', label: 'style', description: 'Formatação, ponto e vírgula, etc', color: 'bg-gray-500', icon: Palette },
  { value: 'refactor', label: 'refactor', description: 'Refatoração de código', color: 'bg-purple-500', icon: RotateCcw },
  { value: 'perf', label: 'perf', description: 'Melhoria de performance', color: 'bg-yellow-500', icon: Zap },
  { value: 'test', label: 'test', description: 'Testes', color: 'bg-pink-500', icon: TestTube },
  { value: 'chore', label: 'chore', description: 'Tarefas de manutenção', color: 'bg-orange-500', icon: Wrench },
  { value: 'ci', label: 'ci', description: 'CI/CD', color: 'bg-indigo-500', icon: Rocket },
  { value: 'build', label: 'build', description: 'Build system', color: 'bg-teal-500', icon: Building2 },
  { value: 'revert', label: 'revert', description: 'Reverter commit', color: 'bg-gray-600', icon: Undo2 }
];

const emptyEntry = { type: 'feat', description: '', scope: '' };

const AdminChangelogsPage = () => {
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [entries, setEntries] = useState([ { ...emptyEntry } ]);
  const [publishing, setPublishing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [changelogToDelete, setChangelogToDelete] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/changelogs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        setList(data.data || []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleAddEntry = () => setEntries(prev => [...prev, { ...emptyEntry } ]);
  const handleRemoveEntry = (i) => setEntries(prev => prev.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setTitle(''); 
    setSlug(''); 
    setSummary(''); 
    setTags(''); 
    setEntries([{ ...emptyEntry }]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (changelog) => {
    setTitle(changelog.title);
    setSlug(changelog.slug);
    setSummary(changelog.summary || '');
    setTags(Array.isArray(changelog.tags) ? changelog.tags.join(', ') : '');
    try {
      const parsedEntries = Array.isArray(changelog.entries) ? changelog.entries : JSON.parse(changelog.entries || '[]');
      setEntries(parsedEntries.length > 0 ? parsedEntries : [{ ...emptyEntry }]);
    } catch {
      setEntries([{ ...emptyEntry }]);
    }
    setIsEditing(true);
    setEditingId(changelog.id);
  };

  const handlePublish = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ title: "Erro", description: "Título e slug são obrigatórios", variant: "destructive" });
      return;
    }

    if (entries.filter(e => e.description.trim()).length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos uma entrada válida", variant: "destructive" });
      return;
    }

    setPublishing(true);
    try {
      const payload = {
        title: title.trim(), 
        slug: slug.trim(), 
        summary: summary.trim() || null,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        entries: entries.filter(e => e.description.trim()),
        is_published: true,
      };

      const url = isEditing ? `/api/changelogs/${editingId}` : '/api/changelogs';
      const method = isEditing ? 'PUT' : 'POST';
      const token = localStorage.getItem('authToken');

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (isEditing) {
          setList(prev => prev.map(item => item.id === editingId ? data.data : item));
          toast({ title: "Sucesso", description: "Changelog atualizado com sucesso!" });
        } else {
          setList(prev => [data.data, ...prev]);
          toast({ title: "Sucesso", description: "Changelog publicado com sucesso!" });
        }
        resetForm();
      } else {
        const error = await res.json();
        toast({ title: "Erro", description: error.message || "Erro ao salvar changelog", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro de conexão", variant: "destructive" });
    } finally { 
      setPublishing(false); 
    }
  };

  const openDeleteModal = (changelog) => {
    setChangelogToDelete(changelog);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setChangelogToDelete(null);
  };

  const handleDelete = async () => {
    if (!changelogToDelete) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/changelogs/${changelogToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setList(prev => prev.filter(item => item.id !== changelogToDelete.id));
        toast({ title: "Sucesso", description: "Changelog excluído com sucesso!" });
        if (editingId === changelogToDelete.id) resetForm();
      } else {
        toast({ title: "Erro", description: "Erro ao excluir changelog", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro de conexão", variant: "destructive" });
    } finally {
      closeDeleteModal();
    }
  };

  const getEntryTypeInfo = (type) => entryTypes.find(t => t.value === type) || entryTypes[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 py-4 sm:py-8"
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent flex items-center gap-3">
            <Clock className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            Changelogs
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Gerencie os registros de mudanças do site e mods
          </p>
        </div>
        {isEditing && (
          <Button variant="outline" onClick={resetForm}>
            <X className="h-4 w-4 mr-2" />
            Cancelar Edição
          </Button>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEditing ? 'Editar Changelog' : 'Novo Changelog'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input 
                  id="title"
                  placeholder="Ex: v1.2.0 - Novidades e Correções"
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input 
                  id="slug"
                  placeholder="Ex: v1-2-0-novidades-correcoes"
                  value={slug} 
                  onChange={e => setSlug(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Usado na URL: /changelog/{slug}</p>
              </div>
              
              <div>
                <Label htmlFor="summary">Resumo</Label>
                <Textarea 
                  id="summary"
                  placeholder="Breve descrição das principais mudanças desta versão..."
                  value={summary} 
                  onChange={e => setSummary(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input 
                  id="tags"
                  placeholder="Ex: site, mods, infra, segurança"
                  value={tags} 
                  onChange={e => setTags(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Separe por vírgula</p>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">Entradas</Label>
                <Button size="sm" onClick={handleAddEntry} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Entrada
                </Button>
              </div>
              
              <div className="space-y-4">
                {entries.map((entry, idx) => {
                  const typeInfo = getEntryTypeInfo(entry.type);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                    >
                      <Card className="bg-muted/30 border-border/40">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-1">
                              <Label>Tipo</Label>
                              <Select value={entry.type} onValueChange={value => setEntries(prev => prev.map((x, i) => i === idx ? {...x, type: value} : x))}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Selecione o tipo">
                                    {entry.type && (
                                      <div className="flex items-center gap-2">
                                        {(() => {
                                          const typeInfo = getEntryTypeInfo(entry.type);
                                          const IconComponent = typeInfo.icon;
                                          return (
                                            <>
                                              <IconComponent className="h-4 w-4" />
                                              <span>{typeInfo.label}</span>
                                            </>
                                          );
                                        })()}
                                      </div>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {entryTypes.map(type => {
                                    const IconComponent = type.icon;
                                    return (
                                      <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                          <IconComponent className="h-4 w-4" />
                                          <span>{type.label}</span>
                                          <span className="text-muted-foreground text-xs">- {type.description}</span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="md:col-span-2">
                              <Label>Descrição *</Label>
                              <Input 
                                placeholder="Descreva a mudança..."
                                value={entry.description} 
                                onChange={e => setEntries(prev => prev.map((x, i) => i === idx ? {...x, description: e.target.value} : x))}
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="md:col-span-1">
                              <Label>Escopo</Label>
                              <Input 
                                placeholder="Ex: site, mods"
                                value={entry.scope} 
                                onChange={e => setEntries(prev => prev.map((x, i) => i === idx ? {...x, scope: e.target.value} : x))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${typeInfo.color}`}></span>
                              <span className="text-sm text-muted-foreground">{typeInfo.description}</span>
                            </div>
                            {entries.length > 1 && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRemoveEntry(idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={publishing}
              >
                Limpar
              </Button>
              <Button 
                onClick={handlePublish} 
                disabled={publishing || !title.trim() || !slug.trim()}
                className="min-w-[140px]"
              >
                {publishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Atualizar
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Publicar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Changelogs Publicados ({list.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[70vh] overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Carregando...</span>
                </div>
              ) : list.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum changelog publicado ainda</p>
                  <p className="text-xs text-muted-foreground mt-1">Crie o primeiro changelog usando o formulário ao lado</p>
                </div>
              ) : (
                list.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-muted/30 border-border/40 hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.published_at || item.created_at).toLocaleString('pt-BR')}
                          </p>
                          {item.summary && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.summary}</p>
                          )}
                          {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                              {item.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">+{item.tags.length - 3}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a href={`/changelog/${item.slug}`} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(item)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
          </Card>
        </motion.div>
      </motion.div>
              
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="text-lg font-semibold">Confirmar Exclusão</div>
                <div className="text-sm text-muted-foreground font-normal">Esta ação não pode ser desfeita</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 my-4">
            <div className="text-destructive text-sm font-medium">
              Você está prestes a deletar permanentemente o changelog <span className="font-bold">"{changelogToDelete?.title}"</span>.
            </div>
            <div className="text-destructive/80 text-sm mt-2">
              Todos os dados e histórico relacionados serão perdidos permanentemente.
            </div>
          </div>
          
          <DialogFooter className="gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={closeDeleteModal}
              className="flex-1 sm:flex-none sm:mr-3"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="flex-1 sm:flex-none bg-destructive hover:bg-destructive/90"
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminChangelogsPage;