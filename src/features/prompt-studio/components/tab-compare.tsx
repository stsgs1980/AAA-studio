"use client";

import { useCallback } from "react";
import { comparePrompts } from "@stsgs/prompting";
import { ArrowLeftRight } from "lucide-react";
import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";
import { CompareResults } from "./compare-results";

export function TabCompare() {
  const compareA = usePromptStudioStore((s) => s.compareA);
  const compareB = usePromptStudioStore((s) => s.compareB);
  const setCompareA = usePromptStudioStore((s) => s.setCompareA);
  const setCompareB = usePromptStudioStore((s) => s.setCompareB);
  const comparisonResult = usePromptStudioStore((s) => s.comparisonResult);
  const setComparisonResult = usePromptStudioStore((s) => s.setComparisonResult);

  const handleCompare = useCallback(() => {
    if (!compareA.trim() || !compareB.trim()) return;
    setComparisonResult(comparePrompts(compareA, compareB));
  }, [compareA, compareB, setComparisonResult]);

  const canCompare = compareA.trim().length > 0 && compareB.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Two editor panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-text-muted font-medium">
            Prompt A
          </label>
          <textarea
            value={compareA}
            onChange={(e) => setCompareA(e.target.value)}
            placeholder="Paste your first prompt here..."
            className="w-full h-64 text-sm font-mono bg-midnight-base border border-midnight-border rounded-lg p-4 resize-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-text-muted font-medium">
            Prompt B
          </label>
          <textarea
            value={compareB}
            onChange={(e) => setCompareB(e.target.value)}
            placeholder="Paste your second prompt here..."
            className="w-full h-64 text-sm font-mono bg-midnight-base border border-midnight-border rounded-lg p-4 resize-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Compare button */}
      <button
        onClick={handleCompare}
        disabled={!canCompare}
        className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          canCompare
            ? "bg-brand-accent text-white hover:bg-brand-accent/90"
            : "bg-midnight-elevated text-text-muted cursor-not-allowed"
        }`}
      >
        <ArrowLeftRight className="h-4 w-4" />
        Compare Prompts
      </button>

      {/* Results */}
      <CompareResults result={comparisonResult} />
    </div>
  );
}
