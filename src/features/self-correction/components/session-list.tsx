'use client';

import { ChevronRight, RefreshCw } from 'lucide-react';

export interface Session {
  id: string;
  input: string;
  initialOutput: string;
  judgeScore: number;
  judgeVerdict: string;
  judgeReasoning: string | null;
  revisedOutput: string | null;
  revisionScore: number | null;
  status: string;
  maxRetries: number;
  retryCount: number;
  createdAt: string;
  agent?: { id: string; name: string; roleGroup: string } | null;
}

export function SessionList({
  sessions, loading, selectedId, onSelect,
}: {
  sessions: Session[];
  loading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const verdictColor = (v: string) => {
    if (v === 'approved') return 'text-emerald-600 dark:text-emerald-400';
    if (v === 'rejected') return 'text-red-600 dark:text-red-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  const scoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (s >= 5) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Recent Sessions</span>
      </div>
      {loading && sessions.length === 0 ? (
        <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No sessions yet. Run one above.</p>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {sessions.map(s => (
            <button key={s.id} onClick={() => onSelect(s.id)}
              className={`w-full text-left rounded-lg border p-2.5 transition-colors ${
                selectedId === s.id ? 'border-brand-purple/40 bg-brand-purple/5' : 'border-border hover:border-primary/30'
              }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium truncate max-w-[200px]">{s.input.slice(0, 60)}</span>
                <span className={`text-[10px] font-medium ${verdictColor(s.judgeVerdict)}`}>{s.judgeVerdict}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] ${scoreColor(s.judgeScore)}`}>Score: {s.judgeScore.toFixed(1)}</span>
                {s.revisionScore != null && (
                  <>
                    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className={`text-[10px] ${scoreColor(s.revisionScore)}`}>{s.revisionScore.toFixed(1)}</span>
                  </>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto">x{s.retryCount}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
