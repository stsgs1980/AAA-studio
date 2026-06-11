'use client';

import { Network, Bot, User } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';
import { TreeItem } from '@/features/hierarchy/components/tree-item';
import { useLanguage } from '@/lib/i18n/language-context';
import { useHierarchy } from './hooks/use-hierarchy';

export default function AgentHierarchyPage() {
  const { t } = useLanguage();
  const { tree, stats, loading, message, handleDrop } = useHierarchy(t);

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