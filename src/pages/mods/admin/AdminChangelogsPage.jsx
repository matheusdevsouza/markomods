import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, UploadCloud, Trash2 } from 'lucide-react';

const emptyEntry = { type: 'feature', description: '', scope: '' };

const AdminChangelogsPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [entries, setEntries] = useState([ { ...emptyEntry } ]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/changelogs');
        const data = await res.json();
        setList(data.data || []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleAddEntry = () => setEntries(prev => [...prev, { ...emptyEntry }]);
  const handleRemoveEntry = (i) => setEntries(prev => prev.filter((_, idx) => idx !== i));

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const payload = {
        title, slug, summary,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        entries,
        is_published: true,
      };
      const res = await fetch('/api/changelogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setList(prev => [data.data, ...prev]);
        setTitle(''); setSlug(''); setSummary(''); setTags(''); setEntries([{ ...emptyEntry }]);
      }
    } finally { setPublishing(false); }
  };

  return (
    <div className="px-6">
      <h1 className="text-2xl font-semibold mb-4">Changelogs</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/70 border border-border/60 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Novo changelog</h2>
          <div className="space-y-3">
            <Input placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} />
            <Input placeholder="Slug (ex: v1-2-0)" value={slug} onChange={e=>setSlug(e.target.value)} />
            <Textarea placeholder="Resumo (opcional)" value={summary} onChange={e=>setSummary(e.target.value)} />
            <Input placeholder="Tags separadas por vírgula" value={tags} onChange={e=>setTags(e.target.value)} />

            <div className="border border-border/60 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Entradas</h3>
                <Button size="sm" onClick={handleAddEntry}><Plus className="h-4 w-4 mr-1"/>Adicionar</Button>
              </div>
              <div className="space-y-3">
                {entries.map((en, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                    <select className="md:col-span-2 bg-input border border-border rounded px-2 py-2 text-sm" value={en.type} onChange={e=>setEntries(prev => prev.map((x,i)=> i===idx?{...x,type:e.target.value}:x))}>
                      <option value="feature">feature</option>
                      <option value="fix">fix</option>
                      <option value="chore">chore</option>
                    </select>
                    <Input className="md:col-span-7" placeholder="Descrição" value={en.description} onChange={e=>setEntries(prev => prev.map((x,i)=> i===idx?{...x,description:e.target.value}:x))} />
                    <Input className="md:col-span-2" placeholder="Escopo (ex: site, mods)" value={en.scope} onChange={e=>setEntries(prev => prev.map((x,i)=> i===idx?{...x,scope:e.target.value}:x))} />
                    <Button variant="destructive" size="icon" className="md:col-span-1" onClick={()=>handleRemoveEntry(idx)}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={handlePublish} disabled={publishing || !title || !slug}><UploadCloud className="h-4 w-4 mr-1"/>Publicar</Button>
            </div>
          </div>
        </div>

        <div className="bg-card/70 border border-border/60 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Publicados</h2>
          <div className="space-y-3 max-h-[70vh] overflow-auto">
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : list.length === 0 ? (
              <p className="text-muted-foreground">Nenhum changelog.</p>
            ) : (
              list.map(item => (
                <div key={item.id} className="border border-border/60 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.published_at || item.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    <a className="text-primary text-sm" href={`/changelog/${item.slug}`} target="_blank" rel="noreferrer">Ver</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChangelogsPage;


