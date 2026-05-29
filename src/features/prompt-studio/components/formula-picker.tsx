"use client";

import { cn } from "@stsgs/ui";
import type { Formula } from "@/features/prompt-studio/types";

interface FormulaPickerProps {
  formulas: Formula[];
  onSelect: (f: Formula) => void;
  activeId?: string;
}

export function FormulaPicker({
  formulas,
  onSelect,
  activeId,
}: FormulaPickerProps) {
  if (formulas.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {formulas.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f)}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
            "hover:shadow-md hover:-translate-y-0.5",
            activeId === f.id
              ? "bg-brand-accent text-white"
              : "bg-midnight-elevated text-text-secondary hover:text-text-primary"
          )}
          title={f.description}
        >
          {f.acronym}
        </button>
      ))}
    </div>
  );
}
