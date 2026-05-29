"use client";

import { useMemo } from "react";
import { cn } from "@stsgs/ui";
import { getScoreLabel } from "@stsgs/prompting";
import { useQualityStore } from "../hooks/use-quality-store";
import type { PromptScore } from "@stsgs/prompting";
import { DIMENSION_LABELS } from "../types";

function getBarColor(score: number): string {
  if (score >= 8) return "bg-green-500";
  if (score >= 6) return "bg-yellow-500";
  if (score >= 4) return "bg-orange-500";
  return "bg-red-500";
}

function getTextColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-yellow-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

interface ScoreBarProps {
  label: string;
  score: number;
  max?: number;
}

function ScoreBar({ label, score, max = 10 }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="flex h-2 flex-1 rounded-full bg-muted/50">
        <div
          className={cn("h-full rounded-full transition-all", getBarColor(score))}
          style={{ width: `${(score / max) * 100}%` }}
        />
      </div>
      <span className={cn("w-8 text-right text-xs font-mono", getTextColor(score))}>
        {score}
      </span>
    </div>
  );
}

export function ScorePanel() {
  const result = useQualityStore((s) => s.result);

  const dimensions = useMemo(() => {
    if (!result) return [];
    const keys = Object.keys(DIMENSION_LABELS) as (keyof Omit<PromptScore, "overall">)[];
    return keys.map((key) => ({
      key,
      label: DIMENSION_LABELS[key],
      score: result.score[key],
    }));
  }, [result]);

  if (!result) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Run analysis to see scoring results
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Overall score */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
        <div className="text-3xl font-bold text-primary">
          {result.score.overall}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{getScoreLabel(result.score.overall)}</span>
          <span className="text-xs text-muted-foreground">Overall Score</span>
        </div>
      </div>

      {/* Dimensions */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Dimensions
        </h3>
        {dimensions.map((d) => (
          <ScoreBar key={d.key} label={d.label} score={d.score} />
        ))}
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Suggestions
          </h3>
          <ul className="flex flex-col gap-1">
            {result.suggestions.map((s, i) => (
              <li
                key={i}
                className="rounded-md bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
