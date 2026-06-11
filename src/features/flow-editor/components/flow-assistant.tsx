'use client';

/**
 * Flow Assistant — 5-stage guided wizard for creating AI flows.
 * Stages: Goal → Architecture → Features → Configuration → Review
 *
 * All state and business logic lives in useFlowAssistant().
 * This file contains ONLY JSX rendering.
 */

import { X, Sparkles, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { useFlowEditorStore } from '../store/flow-store';
import { STAGES } from './flow-assistant-data';
import { StageChoices, StageConfig, StageReview } from './flow-assistant-stages';
import { useFlowAssistant } from '../hooks/use-flow-assistant';

export function FlowAssistant() {
  const { showAssistant } = useFlowEditorStore();
  const {
    si, stage, cur, hasAnswer, progress,
    answers, flowName, flowDesc,
    generating, done, error,
    setFlowName, setFlowDesc, setAnswer,
    select, next, back, close,
  } = useFlowAssistant();

  if (!showAssistant) return null;

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
            {si === 3 && <StageConfig flowName={flowName} flowDescription={flowDesc} model={(answers.config as string) ?? ''} onNameChange={setFlowName} onDescChange={setFlowDesc} onSelect={(id) => setAnswer('config', id)} />}
            {si === 4 && <StageReview answers={answers} flowName={flowName} flowDescription={flowDesc} />}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </>)}
        </div>

        {!done && !generating && (
          <div className="flex items-center justify-between px-5 py-3 border-t">
            <button onClick={si > 0 ? back : close} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="h-3 w-3" />{si > 0 ? 'Back' : 'Cancel'}</button>
            <button onClick={next} disabled={!hasAnswer} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none transition-colors">{si === 4 ? 'Generate Flow' : 'Next'}<ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}