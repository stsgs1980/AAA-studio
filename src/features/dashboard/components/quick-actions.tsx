'use client';

import { useCallback } from 'react';
import { cn } from '@stsgs/ui';
import { Database, Download, RotateCcw } from 'lucide-react';

interface Action {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  variant?: 'default' | 'primary';
}

export function QuickActions() {
  const seedDb = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/seed', { method: 'POST' });
      if (res.ok) window.location.reload();
    } catch { /* silent */ }
  }, []);

  const exportConfig = useCallback(async () => {
    try {
      const [agents, flows] = await Promise.all([
        fetch('/api/agents').then((r) => r.json()),
        fetch('/api/flows').then((r) => r.json()),
      ]);
      const blob = new Blob([JSON.stringify({ agents, flows }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `3a-studio-config-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
  }, []);

  const resetData = useCallback(async () => {
    if (!confirm('Reset all data? This cannot be undone.')) return;
    try {
      await fetch('/api/dashboard/reset', { method: 'POST' });
      window.location.reload();
    } catch { /* silent */ }
  }, []);

  const actions: Action[] = [
    { icon: Database, label: 'Seed Database', description: 'Populate with sample data', onClick: seedDb, variant: 'primary' },
    { icon: Download, label: 'Export Config', description: 'Download agents and flows', onClick: exportConfig },
    { icon: RotateCcw, label: 'Reset Data', description: 'Clear all data and start fresh', onClick: resetData },
  ];

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map(({ icon: Icon, label, description, onClick, variant = 'default' }) => (
          <button
            key={label}
            onClick={onClick}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg p-3 transition-colors text-center',
              variant === 'primary' ? 'bg-primary/10 hover:bg-primary/20 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
            <span className="text-[10px] opacity-60">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
