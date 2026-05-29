'use client';

import { Code2, Trash2 } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { useSkillStore } from '../store/skills-store';

export function SkillList() {
  const { skills, selected, setSelected, setTab, deleteSkill } = useSkillStore();

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-3 py-2 border-b bg-muted/30">
        <h2 className="text-sm font-semibold">Skills ({skills.length})</h2>
      </div>
      <div className="divide-y overflow-y-auto max-h-[55vh]">
        {skills.map((s) => (
          <div key={s.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50 group',
              selected?.id === s.id && 'bg-accent',
            )}
            onClick={() => { setSelected(s); setTab('info'); }}>
            <Code2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{s.name}</div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.category}</span>
                {s.standardIds.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">{s.standardIds.length} std</span>
                )}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); deleteSkill(s.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {skills.length === 0 && <p className="text-sm text-muted-foreground p-4">No skills yet.</p>}
      </div>
    </div>
  );
}
