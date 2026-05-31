'use client';

import { useEffect, useState, useCallback } from 'react';
import { ScrollText, RefreshCw } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';
import { CodeBlock } from '@/components/code-block';
import { useLanguage } from '@/lib/i18n/language-context';

interface AuditEntry {
  id: string; action: string; entityType: string; entityId: string;
  userId: string | null; details: string | null; timestamp: string;
}

const ENTITY_COLORS: Record<string, string> = {
  agent: 'bg-blue-500/10 text-blue-500',
  flow: 'bg-purple-500/10 text-purple-500',
  execution: 'bg-emerald-500/10 text-emerald-500',
  prompt: 'bg-amber-500/10 text-amber-500',
  standard: 'bg-red-500/10 text-red-500',
  skill: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const entityOptions = [
    { value: '', label: t.pages['All entities'] },
    { value: 'agent', label: t.pages['Agent'] },
    { value: 'flow', label: t.pages['Flow'] },
    { value: 'execution', label: t.pages['Execution'] },
    { value: 'prompt', label: t.pages['Prompt'] },
    { value: 'standard', label: t.pages['Standard'] },
    { value: 'skill', label: t.pages['Skill'] },
  ];

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter ? `?entityType=${filter}` : '';
      const res = await fetch(`/api/audit${params}`);
      if (!res.ok) throw new Error();
      setLogs(await res.json());
    } catch { setLogs([]); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = filter ? logs.filter((l) => l.entityType === filter) : logs;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollText className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">{t.nav['Audit Log']}</h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 px-3 rounded-md border bg-input text-foreground text-sm">
            {entityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={fetchLogs} className="p-2 rounded-md border hover:bg-accent" title={t.common['Refresh']}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8"><PageSkeleton rows={6} /></div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center">{t.pages['No audit logs found.']}</p>
        ) : (
          <div className="divide-y max-h-[70vh] overflow-y-auto">
            {filtered.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                <span className={cn('text-[10px] px-2 py-0.5 rounded font-medium mt-0.5 shrink-0', ENTITY_COLORS[log.entityType] ?? 'bg-muted text-muted-foreground')}>
                  {log.entityType}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{log.action}</span>
                    {log.entityId && <span className="text-xs text-muted-foreground font-mono">{log.entityId.slice(0, 8)}</span>}
                  </div>
                  {log.details && (
                    <CodeBlock
                      code={typeof log.details === 'string'
                        ? log.details.slice(0, 500)
                        : JSON.stringify(log.details, null, 2).slice(0, 500)}
                      language={typeof log.details === 'string' ? 'text' : 'json'}
                      compact
                      maxLines={8}
                      className="mt-1"
                    />
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
