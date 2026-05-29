"use client";

import { Code2, Trash2 } from "lucide-react";
import { cn } from "@stsgs/ui";
import { useSkillStore } from "../store/skills-store";

export function SkillList() {
  const { skills, selected, setSelected, setTab, deleteSkill } = useSkillStore();

  return (
    <div className="rounded-xl border border-midnight-border bg-midnight-card overflow-hidden">
      <div className="px-3 py-2 border-b border-midnight-border bg-midnight-base/50">
        <h2 className="text-sm font-semibold text-text-primary">Skills ({skills.length})</h2>
      </div>
      <div className="divide-y divide-midnight-border overflow-y-auto max-h-[55vh]">
        {skills.map((s) => (
          <div key={s.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-midnight-elevated transition-colors group",
              selected?.id === s.id && "bg-midnight-elevated border-l-2 border-brand-accent",
            )}
            onClick={() => { setSelected(s); setTab("info"); }}>
            <Code2 className="h-4 w-4 text-text-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">{s.name}</div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-midnight-elevated text-text-muted">{s.category}</span>
                {s.standardIds.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-accent/15 text-brand-accent">{s.standardIds.length} std</span>
                )}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); deleteSkill(s.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-brand-red/15 hover:text-brand-red transition-all">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-text-muted p-4 text-center">No skills yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
