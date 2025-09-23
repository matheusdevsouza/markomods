import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, GitMerge, Bug, Wrench, ChevronRight, History, Info, Package, Rocket } from 'lucide-react';

const typeToIcon = {
  feature: GitMerge,
  fix: Bug,
  chore: Wrench,
};

const ItemRow = ({ item }) => {
  const Icon = typeToIcon[item.type] || Wrench;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/40">
      <Icon className="h-4 w-4 text-primary mt-1" />
      <div className="flex-1">
        <p className="text-sm text-foreground leading-relaxed">
          {item.description}
        </p>
        {item.scope && (
          <p className="text-xs text-muted-foreground mt-1">Escopo: {item.scope}</p>
        )}
      </div>
    </div>
  );
};

const ChangelogCard = ({ log }) => {
  const date = useMemo(() => log.published_at || log.created_at, [log]);
  const items = Array.isArray(log.entries) ? log.entries : (() => { try { return JSON.parse(log.entries || '[]'); } catch { return []; } })();
  const tags = Array.isArray(log.tags) ? log.tags : (() => { try { return JSON.parse(log.tags || '[]'); } catch { return []; } })();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/70 border border-border/60 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-primary">{log.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <CalendarDays className="h-4 w-4 mr-2" />
            {new Date(date).toLocaleString('pt-BR')}
          </div>
        </div>
        {log.summary && <p className="text-sm text-muted-foreground mb-3">{log.summary}</p>}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((t, i) => (
            <Badge key={i} variant="secondary" className="bg-muted/60 border border-border/40">{t}</Badge>
          ))}
        </div>
        <div className="divide-y divide-border/40">
          {items.map((it, idx) => <ItemRow key={idx} item={it} />)}
        </div>
      </div>
      <div className="px-5 py-3 bg-gradient-to-r from-[#1F1335]/50 via-[#311C4A]/40 to-transparent border-t border-border/60 flex justify-end">
        <a href={`/changelog/${log.slug}`} className="text-sm text-primary hover:underline flex items-center">Detalhes <ChevronRight className="h-4 w-4 ml-1"/></a>
      </div>
    </motion.div>
  );
};

const ChangelogPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/changelogs/public');
        const data = await res.json();
        setItems(data.data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* FX de fundo sutil para manter coesão com o site */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Cabeçalho */}
        <div className="mb-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Changelog</h1>
            <p className="text-muted-foreground">Registro técnico das mudanças no site e nos mods.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="mt-10">
            <div className="bg-card/70 border border-border/60 rounded-xl p-8 text-center shadow-md">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Rocket className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Ainda não há changelogs publicados</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Fique ligado! Em breve publicaremos as novidades técnicas, correções e melhorias que estamos preparando.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="bg-muted/50">mods</Badge>
                <Badge variant="secondary" className="bg-muted/50">site</Badge>
                <Badge variant="secondary" className="bg-muted/50">infra</Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {items.map((log) => (
              <ChangelogCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangelogPage;


