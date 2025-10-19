import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, ArrowLeft, Sparkles, Bug, BookOpen, Palette, 
  RotateCcw, Zap, TestTube, Wrench, Rocket, Building2, Undo2 
} from 'lucide-react';

const typeToIcon = { 
  feat: Sparkles, 
  fix: Bug, 
  docs: BookOpen, 
  style: Palette, 
  refactor: RotateCcw, 
  perf: Zap, 
  test: TestTube, 
  chore: Wrench, 
  ci: Rocket, 
  build: Building2, 
  revert: Undo2,
  feature: Sparkles 
};

const Item = ({ item }) => {
  const Icon = typeToIcon[item.type] || Wrench;
  return (
    <div className="relative pl-8 py-4 border-l border-border/40">
      <span className="absolute -left-2 top-5 w-3 h-3 bg-primary rounded-full shadow" />
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-1 text-primary" />
        <div>
          <p className="text-sm text-foreground leading-relaxed">{item.description}</p>
          {item.scope && <p className="text-xs text-muted-foreground mt-1">Escopo: {item.scope}</p>}
        </div>
      </div>
    </div>
  );
};

const ChangelogDetailPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/changelogs/public/${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const json = await res.json();
        setData(json.data || null);
      } catch {
        setNotFound(true);
      } finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const items = useMemo(() => {
    if (!data) return [];
    try { return Array.isArray(data.entries) ? data.entries : JSON.parse(data.entries || '[]'); } catch { return []; }
  }, [data]);

  const tags = useMemo(() => {
    if (!data) return [];
    try { return Array.isArray(data.tags) ? data.tags : JSON.parse(data.tags || '[]'); } catch { return []; }
  }, [data]);

  const date = data?.published_at || data?.created_at;

  return (
    <div className="min-h-screen relative">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/changelog">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2"/>Voltar</Button>
          </Link>
          {date && (
            <div className="text-sm text-muted-foreground flex items-center"><CalendarDays className="h-4 w-4 mr-2"/>{new Date(date).toLocaleString('pt-BR')}</div>
          )}
        </div>

        {loading ? (
          <div className="text-muted-foreground">Carregando...</div>
        ) : notFound ? (
          <div className="bg-card/70 border border-border/60 rounded-xl p-8 text-center">
            <p className="text-foreground font-medium mb-2">Changelog não encontrado</p>
            <p className="text-sm text-muted-foreground">Verifique o link ou volte para a lista.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/70 border border-border/60 rounded-xl overflow-hidden shadow">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-primary mb-2">{data?.title}</h1>
              {data?.summary && <p className="text-muted-foreground mb-4">{data.summary}</p>}
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((t, i) => <Badge key={i} variant="secondary" className="bg-muted/60 border border-border/40">{t}</Badge>)}
              </div>
              <div className="relative">
                {items.map((it, idx) => <Item key={idx} item={it} />)}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChangelogDetailPage;


