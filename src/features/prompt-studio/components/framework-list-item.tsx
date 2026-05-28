"use client";

import { cn } from "@stsgs/ui";
import { Zap } from "lucide-react";
import type { Framework } from "@/features/prompt-studio/types";

const TYPE_COLORS: Record<string, string> = {
  structured: "text-brand-accent bg-brand-accent/15",
  chain: "text-brand-purple bg-brand-purple/15",
  constraint: "text-brand-amber bg-brand-amber/15",
  meta: "text-brand-cyan bg-brand-cyan/15",
};

interface FrameworkListItemProps {
  framework: Framework;
  onGenerate: (prompt: string) => void;
}

export function FrameworkListItem({ framework, onGenerate }: FrameworkListItemProps) {
  const typeColor = TYPE_COLORS[framework.type] ?? TYPE_COLORS.structured;
  const sectionCount = framework.sections.length;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-midnight-border bg-midnight-card px-4 py-3 hover:border-brand-accent/30 transition-colors">
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className="text-sm font-semibold text-text-primary shrink-0">
          {framework.name}
        </span>
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", typeColor)}>
          {framework.type}
        </span>
        <p className="text-xs text-text-muted truncate max-w-md">
          {framework.description}
        </p>
        <span className="text-[10px] text-text-muted shrink-0">
          {sectionCount} sections
        </span>
      </div>

      <button
        onClick={() => onGenerate("")}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent/90 transition-colors shrink-0"
      >
        <Zap className="h-3.5 w-3.5" />
        Open Builder
      </button>
    </div>
  );
}
