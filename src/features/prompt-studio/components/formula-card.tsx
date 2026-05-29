"use client";

import { cn } from "@stsgs/ui";
import { BookOpen } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import type { Formula } from "@/features/prompt-studio/types";

const CATEGORY_COLORS: Record<string, string> = {
  structure: "text-brand-accent bg-brand-accent/15",
  chain: "text-brand-purple bg-brand-purple/15",
  constraint: "text-brand-amber bg-brand-amber/15",
  meta: "text-brand-cyan bg-brand-cyan/15",
  creative: "text-brand-green bg-brand-green/15",
};

interface FormulaCardProps {
  formula: Formula;
  onSelect: (template: string) => void;
}

export function FormulaCard({ formula, onSelect }: FormulaCardProps) {
  const catColor = CATEGORY_COLORS[formula.category] ?? CATEGORY_COLORS.structure;

  return (
    <div className="rounded-xl border border-midnight-border bg-midnight-card p-4 flex flex-col gap-3 hover:border-brand-accent/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-bold text-brand-accent leading-none">
            {formula.acronym}
          </span>
          <span className="text-sm text-text-primary font-medium">
            {formula.name}
          </span>
        </div>
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", catColor)}>
          {formula.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
        {formula.description}
      </p>

      {/* Template preview with syntax highlighting */}
      <CodeBlock
        code={formula.template.length > 180
          ? formula.template.slice(0, 180) + "..."
          : formula.template}
        language="markdown"
        compact
        className="bg-midnight-base"
      />

      {/* Action */}
      <button
        onClick={() => onSelect(formula.template)}
        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-accent/10 text-brand-accent text-xs font-medium hover:bg-brand-accent/20 transition-colors mt-auto"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Use Template
      </button>
    </div>
  );
}
