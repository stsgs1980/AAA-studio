"use client";

import { useState } from "react";
import { cn } from "@stsgs/ui";
import { FORMULAS } from "@stsgs/prompting";
import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";
import { FormulaCard } from "./formula-card";
import { FormulaListItem } from "./formula-list-item";

const CATEGORIES = ["all", "structure", "chain", "constraint"] as const;

export function TabFormulas() {
  const [filter, setFilter] = useState<string>("all");
  const viewMode = usePromptStudioStore((s) => s.viewMode);
  const insertFormula = usePromptStudioStore((s) => s.insertFormula);

  const filtered =
    filter === "all"
      ? FORMULAS
      : FORMULAS.filter((f) => f.category === filter);

  const isGrid = viewMode === "grid";

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize",
              filter === cat
                ? "bg-brand-accent text-white"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-2">
          {filtered.length} formula{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Formula grid or list */}
      {isGrid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <FormulaCard
              key={f.id}
              formula={f}
              onSelect={insertFormula}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((f) => (
            <FormulaListItem
              key={f.id}
              formula={f}
              onSelect={insertFormula}
            />
          ))}
        </div>
      )}
    </div>
  );
}
