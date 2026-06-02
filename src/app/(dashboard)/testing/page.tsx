'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Play, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@stsgs/ui';

interface TestCase {
  id: string; name: string; agentId: string | null; category: string;
  difficulty: string; input: Record<string, unknown>; expectedOutput: Record<string, unknown>;
}

interface TestRunSummary {
  id: string; name: string; status: string; totalCases: number;
  passedCases: number; failedCases: number; errorCases: number; duration: number;
}

export default function TestingPage() {
  const [cases, setCases] = useState<TestCase[]>([]);
  const [runs, setRuns] = useState<TestRunSummary[]>([]);
  const [tab, setTab] = useState<'cases' | 'runs'>('cases');
  const [running, setRunning] = useState(false);

  const fetchCases = useCallback(async () => {
    try { const r = await fetch('/api/test-cases'); if (r.ok) setCases(await r.json()); } catch { /* ignore */ }
  }, []);

  const fetchRuns = useCallback(async () => {
    try { const r = await fetch('/api/test-runs'); if (r.ok) setRuns(await r.json()); } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchCases(); fetchRuns(); }, [fetchCases, fetchRuns]);

  const runTests = useCallback(async () => {
    setRunning(true);
    try {
      const caseIds = cases.map((c) => c.id);
      await fetch('/api/test-runs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseIds }),
      });
      await fetchRuns();
      setTab('runs');
    } catch { /* ignore */ } finally { setRunning(false); }
  }, [cases, fetchRuns]);

  const deleteCase = useCallback(async (id: string) => {
    await fetch(`/api/test-cases/${id}`, { method: 'DELETE' });
    setCases((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Testing</h1>
        <div className="flex gap-2">
          <CreateCaseButton onCreated={fetchCases} />
          <button onClick={runTests} disabled={running || cases.length === 0}
            className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90', (running || !cases.length) && 'opacity-50 pointer-events-none')}>
            <Play className="h-3 w-3" />{running ? 'Running...' : 'Run All'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(['cases', 'runs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-2 text-xs font-medium border-b-2 transition-colors', tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t === 'cases' ? `Cases (${cases.length})` : `Runs (${runs.length})`}
          </button>
        ))}
      </div>

      {tab === 'cases' ? (
        <div className="space-y-2">
          {cases.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No test cases yet. Create one to get started.</p>}
          {cases.map((tc) => (
            <div key={tc.id} className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-accent/50">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{tc.name}</p>
                <p className="text-[10px] text-muted-foreground">{tc.category} · {tc.difficulty}</p>
              </div>
              <button onClick={() => deleteCase(tc.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {runs.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No test runs yet.</p>}
          {runs.map((r) => (
            <div key={r.id} className="rounded-md border border-border p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">{r.name}</p>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', r.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300')}>{r.status}</span>
              </div>
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><Check className="h-3 w-3 text-emerald-500" />{r.passedCases} passed</span>
                <span className="flex items-center gap-0.5"><X className="h-3 w-3 text-red-500" />{r.failedCases} failed</span>
                {r.errorCases > 0 && <span className="flex items-center gap-0.5"><AlertCircle className="h-3 w-3 text-amber-500" />{r.errorCases} errors</span>}
                <span>{(r.duration / 1000).toFixed(1)}s</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateCaseButton({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [input, setInput] = useState('{}');
  const [expected, setExpected] = useState('{}');

  const create = async () => {
    if (!name) return;
    await fetch('/api/test-cases', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, input: JSON.parse(input), expectedOutput: JSON.parse(expected) }),
    });
    setName(''); setInput('{}'); setExpected('{}'); setOpen(false); onCreated();
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border border-border hover:bg-accent">
      <Plus className="h-3 w-3" />New Case
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Case name" className="rounded-md border border-border bg-background px-2 py-1 text-xs w-32" />
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input JSON" className="rounded-md border border-border bg-background px-2 py-1 text-xs w-24 font-mono" />
      <input value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="Expected JSON" className="rounded-md border border-border bg-background px-2 py-1 text-xs w-24 font-mono" />
      <button onClick={create} className="rounded-md px-2 py-1 text-xs bg-primary text-primary-foreground">Save</button>
      <button onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-xs border border-border">Cancel</button>
    </div>
  );
}
