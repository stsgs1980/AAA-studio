'use client';

/** Stage rendering sub-components for the Flow Assistant wizard. */

import { cn } from '@stsgs/ui';
import { HelpCircle, PenLine, BarChart3, Workflow, MessageCircle, Settings2, ArrowRight, GitBranch, Columns, Route } from 'lucide-react';
import type { Choice, Stage } from './flow-assistant-data';
import { LABELS } from './flow-assistant-data';

const ICON_MAP: Record<string, React.ElementType> = {
  HelpCircle, PenLine, BarChart3, Workflow, MessageCircle, Settings2, ArrowRight, GitBranch, Columns, Route,
};

/* ── Choice card grid for stages 1-4 ── */
export function StageChoices({ stage, selected, onSelect }: {
  stage: Stage; selected: string | string[]; onSelect: (id: string) => void;
}) {
  const arr = Array.isArray(selected) ? selected : [];
  const isSelected = (id: string) => stage.multi ? arr.includes(id) : selected === id;

  return (
    <div className="grid grid-cols-2 gap-2">
      {stage.choices.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)}
          className={cn('text-left p-3 rounded-lg border transition-colors',
            isSelected(c.id) ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:bg-accent')}>
          <div className="flex items-center gap-2">
            {c.icon && (() => { const Ic = ICON_MAP[c.icon]; return Ic ? <Ic className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : null; })()}
            <p className="text-sm font-medium">{c.label}</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{c.desc}</p>
        </button>
      ))}
    </div>
  );
}

/* ── Configuration stage: name + description + model picker ── */
export function StageConfig({ flowName, flowDescription, model, onNameChange, onDescChange, onSelect }: {
  flowName: string; flowDescription: string; model: string;
  onNameChange: (v: string) => void; onDescChange: (v: string) => void; onSelect: (id: string) => void;
}) {
  const models: Choice[] = [
    { id: 'gpt-4o', label: 'GPT-4o', desc: 'Best overall quality' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Fast and cost-effective' },
    { id: 'claude-sonnet', label: 'Claude 3.5 Sonnet', desc: 'Strong reasoning' },
    { id: 'claude-haiku', label: 'Claude 3 Haiku', desc: 'Ultra-fast responses' },
    { id: 'later', label: 'Decide Later', desc: 'Choose after building' },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Flow Name</label>
        <input value={flowName} onChange={(e) => onNameChange(e.target.value)} placeholder="My AI Flow"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Description (optional)</label>
        <textarea value={flowDescription} onChange={(e) => onDescChange(e.target.value)} placeholder="What this flow does..."
          rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary resize-none" />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">AI Model</label>
        <div className="grid grid-cols-2 gap-2">
          {models.map((m) => (
            <button key={m.id} onClick={() => onSelect(m.id)}
              className={cn('text-left p-2.5 rounded-lg border transition-colors',
                model === m.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:bg-accent')}>
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-[11px] text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Review stage: summary of all choices ── */
export function StageReview({ answers, flowName, flowDescription }: {
  answers: Record<string, string | string[]>; flowName: string; flowDescription: string;
}) {
  const goal = answers.goal as string;
  const arch = answers.architecture as string;
  const features = (answers.features as string[]) ?? [];
  const config = answers.config as string;

  const row = (label: string, value: string) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/30 p-3 space-y-0.5">
        {row('Goal', LABELS.goal[goal] ?? goal)}
        {row('Architecture', LABELS.architecture[arch] ?? arch)}
        {row('Model', LABELS.config[config] ?? config)}
        {row('Name', flowName || 'Untitled Flow')}
        {flowDescription && row('Description', flowDescription)}
      </div>
      {features.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Features</p>
          <div className="flex flex-wrap gap-1.5">
            {features.map((f) => (
              <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {LABELS.features[f] ?? f}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground text-center pt-1">
        The generated flow will appear on the canvas. You can edit any node afterward.
      </p>
    </div>
  );
}
