"use client";

import { cn } from "@stsgs/ui";
import { Shield, Trash2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useStandardsStore } from "../store/standards-store";
import type { StandardSeverity } from "../types";

const SEV_ICON: Record<StandardSeverity, React.ElementType> = {
  error: AlertCircle, warning: AlertTriangle, info: Info,
};
const SEV_COLOR: Record<StandardSeverity, string> = {
  error: "text-brand-red", warning: "text-brand-amber", info: "text-brand-accent",
};
const SEV_BG: Record<StandardSeverity, string> = {
  error: "bg-brand-red/15", warning: "bg-brand-amber/15", info: "bg-brand-accent/15",
};

interface StandardListProps {
  onDelete: (id: string) => void;
}

export function StandardList({ onDelete }: StandardListProps) {
  const standards = useStandardsStore((s) => s.standards);
  const selectedId = useStandardsStore((s) => s.selectedId);
  const search = useStandardsStore((s) => s.search);
  const severityFilter = useStandardsStore((s) => s.severityFilter);
  const selectStandard = useStandardsStore((s) => s.selectStandard);

  const filtered = standards.filter((s) => {
    if (severityFilter !== "all" && s.severity !== severityFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="rounded-xl border border-midnight-border bg-midnight-card overflow-hidden">
      <div className="px-3 py-2 border-b border-midnight-border bg-midnight-base/50">
        <h2 className="text-sm font-semibold text-text-primary">
          Standards ({filtered.length})
        </h2>
      </div>
      <div className="divide-y divide-midnight-border overflow-y-auto max-h-[55vh]">
        {filtered.map((s) => {
          const Icon = SEV_ICON[s.severity] ?? Info;
          return (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-midnight-elevated transition-colors group",
                selectedId === s.id && "bg-midnight-elevated border-l-2 border-brand-accent",
              )}
              onClick={() => selectStandard(s.id)}
            >
              <div className={cn("p-1 rounded-md shrink-0", SEV_BG[s.severity])}>
                <Icon className={cn("h-3.5 w-3.5", SEV_COLOR[s.severity])} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{s.name}</div>
                <span className="text-[10px] text-text-muted">
                  {s.rules.length} rules · v{s.version} · {s.category}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-brand-red/15 hover:text-brand-red transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-text-muted p-4 text-center">
            {standards.length === 0 ? "No standards yet. Create one!" : "No matching standards."}
          </p>
        )}
      </div>
    </div>
  );
}
