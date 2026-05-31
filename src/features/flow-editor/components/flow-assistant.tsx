'use client';

import { useState } from 'react';
import { X, Sparkles, ChevronRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { useFlowEditorStore } from '../store/flow-store';
import { STAGES, generateFlow } from './flow-assistant-data';

export function FlowAssistant() {
  const { showAssistant, toggleAssistant } = useFlowEditorStore();
  const [si, setSi] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  if (!showAssistant) return null;
  const stage = STAGES[si];
  const isLast = si === STAGES.length - 1;
  const cur = answers[stage.id];
  const hasAnswer = cur && !(Array.isArray(cur) && cur.length === 0);
  const progress = ((si + 1) / STAGES.length) * 100;

  const select = (id: string) => {
    if (stage.multi) {
      const arr = (cur as string[]) ?? [];
      setAnswers({ ...answers, [stage.id]: arr.includes(id) ? arr.filter((a) => a !== id) : [...arr, id] });
    } else setAnswers({ ...answers, [stage.id]: id });
  };
  const isSelected = (id: string) => stage.multi ? ((cur as string[]) ?? []).includes(id) : cur === id;

  const next = async () => {
    if (!hasAnswer) return;
    if (isLast) {
      setGenerating(true);
      await new Promise((r) => setTimeout(r, 1200));
      const { nodes, edges } = generateFlow(answers);
      const store = useFlowEditorStore.getState();
      store.clearCanvas();
      for (const n of nodes) store.addNode(n);
      useFlowEditorStore.setState({ edges: edges.map((e) => ({ ...e, type: 'smoothstep' })) });
      setGenerating(false); setDone(true);
      setTimeout(() => { toggleAssistant(); reset(); }, 1500);
    } else setSi(si + 1);
  };

  const reset = () => { setSi(0); setAnswers({}); setDone(false); setGenerating(false); };
  const close = () => { toggleAssistant(); setTimeout(reset, 300); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Flow Assistant</span></div>
          <button onClick={close} className="p-1 rounded hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="h-1 bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="p-5 space-y-4">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center"><Check className="h-6 w-6 text-emerald-500" /></div>
              <p className="text-sm font-medium">Flow generated! Check your canvas.</p>
            </div>
          ) : generating ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating your flow...</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Step {si + 1} of {STAGES.length} — {stage.title}</p>
                <h3 className="text-base font-medium">{stage.question}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {stage.choices.map((c) => (
                  <button key={c.id} onClick={() => select(c.id)}
                    className={cn("text-left p-3 rounded-lg border transition-colors", isSelected(c.id) ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-accent")}>
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {!done && !generating && (
          <div className="flex items-center justify-between px-5 py-3 border-t">
            <button onClick={si > 0 ? () => setSi(si - 1) : close} className="text-xs text-muted-foreground hover:text-foreground">{si > 0 ? 'Back' : 'Cancel'}</button>
            <button onClick={next} disabled={!hasAnswer}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none">
              {isLast ? 'Generate Flow' : 'Next'} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
