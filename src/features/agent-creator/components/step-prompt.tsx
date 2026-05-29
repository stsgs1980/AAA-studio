"use client";

import { useEffect, useRef } from "react";
import { useCreatorStore } from "../hooks/use-creator-store";
import { getScoreLabel } from "@stsgs/prompting";
import { cn } from "@stsgs/ui";

const DIMENSIONS = [
  { key: "clarity", label: "Clarity" },
  { key: "specificity", label: "Specificity" },
  { key: "structure", label: "Structure" },
  { key: "completeness", label: "Completeness" },
  { key: "creativity", label: "Creativity" },
  { key: "actionability", label: "Actionability" },
] as const;

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-300", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function StepPrompt() {
  const { form, setField, score, recalcScore } = useCreatorStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(recalcScore, 300);
    return () => clearTimeout(debounceRef.current);
  }, [form.systemPrompt, recalcScore]);

  const barColor = score
    ? score.overall >= 7
      ? "bg-green-500"
      : score.overall >= 5
        ? "bg-yellow-500"
        : "bg-red-500"
    : "bg-muted";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            System Prompt *
          </h3>
          <span className="text-xs text-muted-foreground">
            {form.systemPrompt.length} chars
          </span>
        </div>
        <textarea
          className="w-full min-h-[400px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y"
          value={form.systemPrompt}
          onChange={(e) => setField("systemPrompt", e.target.value)}
          placeholder="Write your system prompt here, or select a type/role in Step 1 to auto-generate..."
        />
      </div>

      {/* Live Score Panel */}
      <div className="space-y-4">
        {score ? (
          <>
            {/* Overall */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-lg font-bold">{score.overall}/10</span>
              </div>
              <ScoreBar value={score.overall} max={10} color={barColor} />
              <p className="text-xs text-muted-foreground mt-1">
                {getScoreLabel(score.overall)}
              </p>
            </div>

            {/* Dimensions */}
            <div className="p-4 rounded-lg border space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground">
                Dimensions
              </h4>
              {DIMENSIONS.map((d) => {
                const val = score[d.key];
                return (
                  <div key={d.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{d.label}</span>
                      <span className="font-medium">{val}</span>
                    </div>
                    <ScoreBar
                      value={val}
                      max={10}
                      color={
                        val >= 7
                          ? "bg-green-500"
                          : val >= 5
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-4 rounded-lg border text-center">
            <p className="text-xs text-muted-foreground">
              Start typing to see live scoring
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <h4 className="text-xs font-medium mb-2">Quick Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>- Define a clear role and expertise</li>
            <li>- Specify output format constraints</li>
            <li>- Add domain-specific rules</li>
            <li>- Include examples for better results</li>
            <li>- Set boundaries for what the agent should refuse</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
