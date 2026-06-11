'use client';

import { Send } from 'lucide-react';
import { SessionList } from './session-list';
import { useLanguage } from '@/lib/i18n/language-context';
import { useSelfCorrection } from '../hooks/use-self-correction';

export function SelfCorrectionPanel() {
  const { sessions, selected, input, loading, running, run, selectSession, setInput } = useSelfCorrection();
  const { t } = useLanguage();

  const scoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (s >= 5) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.pages['Self-Correction']}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.pages['Generate, evaluate, and auto-correct agent outputs']}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4 space-y-3">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={t.pages['Enter input for self-correction test...']}
              className="w-full h-24 rounded border border-input bg-input text-foreground px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
            <button onClick={run} disabled={running || !input.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-purple/15 text-brand-purple border border-brand-purple/30 hover:bg-brand-purple/25 disabled:opacity-40 disabled:pointer-events-none transition-colors">
              <Send className="w-3 h-3" />
              {running ? t.pages['Running...'] : t.pages['Run Self-Correction']}
            </button>
          </div>
          <SessionList sessions={sessions} loading={loading} selectedId={selected?.id} onSelect={selectSession} />
        </div>

        {/* Right: detail */}
        <div className="rounded-lg border border-border p-4">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium">{t.pages['Score:']}</span>
                <span className={`text-lg font-bold ${scoreColor(selected.revisionScore ?? selected.judgeScore)}`}>
                  {(selected.revisionScore ?? selected.judgeScore).toFixed(1)}
                </span>
                {selected.revisionScore != null && (
                  <span className="text-xs text-muted-foreground line-through">{selected.judgeScore.toFixed(1)}</span>
                )}
                <StatusBadge status={selected.status} verdict={selected.judgeVerdict} />
              </div>
              {selected.judgeReasoning && (
                <Detail label={t.pages['Judge Reasoning']}>{selected.judgeReasoning.slice(0, 500)}</Detail>
              )}
              <Detail label={t.pages['Initial Output']}>{selected.initialOutput.slice(0, 800)}</Detail>
              {selected.revisedOutput && (
                <Detail label={t.pages['Revised Output']} className="text-brand-green">
                  {selected.revisedOutput.slice(0, 800)}
                </Detail>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-xs text-muted-foreground">{t.pages['Select a session to view details']}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, verdict }: { status: string; verdict: string }) {
  const cls = verdict === 'approved'
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    : verdict === 'rejected'
    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{status}</span>;
}

function Detail({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</h4>
      <p className={`text-xs text-foreground mt-1 whitespace-pre-wrap max-h-[150px] overflow-y-auto ${className}`}>{children}</p>
    </div>
  );
}