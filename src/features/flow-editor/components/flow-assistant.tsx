'use client';

/**
 * Flow Assistant — 5-stage guided wizard for creating AI flows.
 * Stages: Goal → Architecture → Features → Configuration → Review
 */

import { useState } from 'react';
import { X, Sparkles, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { useFlowEditorStore } from '../store/flow-store';
import { STAGES } from './flow-assistant-data';
import { generateFlow } from './flow-assistant-generate';
import { StageChoices, StageConfig, StageReview } from './flow-assistant-stages';

export function FlowAssistant() {
  const { showAssistant, toggleAssistant } = useFlowEditorStore();
  const [si, setSi] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flowName, setFlowName] = useState('');
  const [flowDesc, setFlowDesc] = useState('');
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!showAssistant) return null;

  const stage = STAGES[si];
  const cur = answers[stage.id];
  const hasAnswer = si === 3 ? !!flowName.trim() : si === 4 ? true : cur && !(Array.isArray(cur) && cur.length === 0);
  const progress = ((si + 1) / STAGES.length) * 100;

  const select = (id: string) => {
    if (stage.multi) {
      const arr = (cur as string[]) ?? [];
      setAnswers({ ...answers, [stage.id]: arr.includes(id) ? arr.filter((a) => a !== id) : [...arr, id] });
    } else setAnswers({ ...answers, [stage.id]: id });
  };

  const next = async () => {
    setError('');
    if (si === 4) {
      setGenerating(true);
      try {
        const { nodes, edges } = generateFlow({
          goal: answers.goal as string, architecture: answers.architecture as string,
          features: (answers.features as string[]) ?? [], config: (answers.config as string) ?? 'later',
          flowName: flowName || 'Untitled Flow', flowDescription: flowDesc,
        });
        const store = useFlowEditorStore.getState();
        store.clearCanvas();
        for (const n of nodes) store.addNode(n);
        useFlowEditorStore.setState({ edges: edges.map((e) => ({ ...e, type: 'smoothstep' })), flowName: flowName || 'Untitled Flow' });
        setGenerating(false); setDone(true);
        setTimeout(() => { toggleAssistant(); reset(); }, 1500);
      } catch (e) { setError(e instanceof Error ? e.message : 'Generation failed'); setGenerating(false); }
    } else setSi(si + 1);
  };

  const reset = () => { setSi(0); setAnswers({}); setFlowName(''); setFlowDesc(''); setDone(false); setGenerating(false); setError(''); };
  const close = () => { toggleAssistant(); setTimeout(reset, 300); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Flow Assistant</span></div>
          <button onClick={close} className="p-1 rounded hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="h-1 bg-muted"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} /></div>
        <div className="flex items-center justify-center gap-1.5 py-2.5">
          {STAGES.map((s, i) => (<div key={s.id} className={cn('h-1.5 rounded-full transition-all duration-300', i === si ? 'w-6 bg-primary' : i < si ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted-foreground/30')} title={s.title} />))}
        </div>

        <div className="px-5 pb-2 space-y-3" style={{ minHeight: 260 }}>
          {done ? (<div className="flex flex-col items-center gap-3 py-8"><div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="h-6 w-6 text-emerald-500" /></div><p className="text-sm font-medium">Flow generated! Check your canvas.</p></div>)
          : generating ? (<div className="flex flex-col items-center gap-3 py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Generating your flow...</p></div>)
          : (<>
            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Step {si + 1} of {STAGES.length} — {stage.title}</p><h3 className="text-sm font-medium">{stage.question}</h3></div>
            {si <= 2 && <StageChoices stage={stage} selected={cur ?? (stage.multi ? [] : '')} onSelect={select} />}
            {si === 3 && <StageConfig flowName={flowName} flowDescription={flowDesc} model={(answers.config as string) ?? ''} onNameChange={setFlowName} onDescChange={setFlowDesc} onSelect={(id) => setAnswers({ ...answers, config: id })} />}
            {si === 4 && <StageReview answers={answers} flowName={flowName} flowDescription={flowDesc} />}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </>)}
        </div>

        {!done && !generating && (
          <div className="flex items-center justify-between px-5 py-3 border-t">
            <button onClick={si > 0 ? () => setSi(si - 1) : close} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="h-3 w-3" />{si > 0 ? 'Back' : 'Cancel'}</button>
            <button onClick={next} disabled={!hasAnswer} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none transition-colors">{si === 4 ? 'Generate Flow' : 'Next'}<ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
