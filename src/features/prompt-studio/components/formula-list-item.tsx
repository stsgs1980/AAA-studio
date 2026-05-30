"use client";

import { cn } from "@stsgs/ui";
import { BookOpen } from "lucide-react";
import type { Formula } from "@/features/prompt-studio/types";

const CATEGORY_COLORS: Record<string, string> = {
  structure: "text-brand-accent bg-brand-accent/15",
  chain: "text-brand-purple bg-brand-purple/15",
  constraint: "text-brand-amber bg-brand-amber/15",
  meta: "text-brand-cyan bg-brand-cyan/15",
  creative: "text-brand-green bg-brand-green/15",
};

interface FormulaListItemProps {
  formula: Formula;
  onSelect: (template: string) => void;
}

export function FormulaListItem({ formula, onSelect }: FormulaListItemProps) {
  const catColor = CATEGORY_COLORS[formula.category] ?? CATEGORY_COLORS.structure;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 hover:border-brand-accent/30 transition-colors">
      {/* Info */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className="text-base font-bold text-brand-accent shrink-0">
          {formula.acronym}
        </span>
        <div className="min-w-0">
          <span className="text-sm font-medium text-foreground">
            {formula.name}
          </span>
          <p className="text-xs text-muted-foreground truncate max-w-md">
            {formula.description}
          </p>
        </div>
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", catColor)}>
          {formula.category}
        </span>
      </div>

      {/* Action */}
      <button
        onClick={() => onSelect(formula.template)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-accent/10 text-brand-accent text-xs font-medium hover:bg-brand-accent/20 transition-colors shrink-0"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Use Template
      </button>
    </div>
  );
}
