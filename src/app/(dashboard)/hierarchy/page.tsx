'use client';

import { useEffect, useState, useCallback } from 'react';
import { Network, Bot, User } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';
import { TreeItem, type TreeNode } from '@/features/hierarchy/components/tree-item';
import { useLanguage } from '@/lib/i18n/language-context';

export default function AgentHierarchyPage() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [stats, setStats] = useState({ total: 0, roots: 0, maxDepth: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { t } = useLanguage();

  const buildTree = useCallback((list: { id: string; name: string; role: string; status: string; group: string; parentId: string | null }[]) => {
    const map = new Map<string, TreeNode>();
    list.forEach((a) => map.set(a.id, { ...a, children: [] }));
    const roots: TreeNode[] = [];
    list.forEach((a) => {
      const node = map.get(a.id)!;
      if (a.parentId && map.has(a.parentId)) map.get(a.parentId)!.children.push(node);
      else roots.push(node);
    });
    const maxDepth = (nodes: TreeNode[], d: number): number =>
      nodes.reduce((max, n) => Math.max(max, n.children.length > 0 ? maxDepth(n.children, d + 1) : d), d);
    setTree(roots);
    setStats({ total: list.length, roots: roots.length, maxDepth: maxDepth(roots, 1) });
  }, []);

  const fetchAgents = useCallback(() => {
    fetch('/api/agents')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => buildTree(data.data?.agents || data.agents || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [buildTree]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleDrop = async (dragId: string, targetId: string) => {
    if (dragId === targetId) return;
    try {
      const res = await fetch(`/api/agents/${dragId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: targetId }),
      });
      if (!res.ok) { const d = await res.json(); setMessage({ type: 'error', text: d.error || t.common['Failed'] }); return; }
      setMessage({ type: 'success', text: t.pages['Agent reparented'] });
      fetchAgents();
      setTimeout(() => setMessage(null), 3000);
    } catch { setMessage({ type: 'error', text: t.common['Network error'] }); }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">{t.pages['Agent Hierarchy']}</h1>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{stats.total} {t.pages['agents']}</span><span>{stats.roots} {t.pages['roots']}</span><span>{t.pages['depth']} {stats.maxDepth}</span>
        </div>
      </div>

      {message && (
        <div className={cn('rounded-lg px-3 py-2 text-xs', message.type === 'success'
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400')}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={5} /></div>
          <div className="rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={4} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-4">
            <h2 className="text-sm font-semibold mb-1">{t.pages['Tree View']}</h2>
            <p className="text-[10px] text-muted-foreground mb-3">{t.pages['Drag agents to reparent them']}</p>
            {tree.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t.pages['No agents yet.']}</p>
            ) : (
              <div className="space-y-0.5">{tree.map((n) => <TreeItem key={n.id} node={n} onDrop={handleDrop} />)}</div>
            )}
          </div>
          <LegendPanel stats={stats} />
        </div>
      )}
    </div>
  );
}

function LegendPanel({ stats }: { stats: { total: number; roots: number; maxDepth: number } }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
      <h2 className="text-sm font-semibold">{t.pages['Legend']}</h2>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> {t.pages['Orchestrator']}</div>
        <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {t.pages['Agent']}</div>
      </div>
      <h2 className="text-sm font-semibold pt-2">{t.common['Status']}</h2>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {t.common['Active']}</div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> {t.common['Draft']}</div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-400" /> {t.common['Inactive']}</div>
      </div>
      <h2 className="text-sm font-semibold pt-2">{t.pages['Stats']}</h2>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>{t.pages['Total:']} {stats.total}</p><p>{t.pages['Roots:']} {stats.roots}</p><p>{t.pages['Max depth:']} {stats.maxDepth}</p>
      </div>
    </div>
  );
}
