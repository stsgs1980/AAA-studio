"use client";

import { cn } from "@stsgs/ui";
import { Check, X } from "lucide-react";
import { useQualityStore } from "../hooks/use-quality-store";
import type { RubricScenario } from "../types";

const SCENARIOS: { key: RubricScenario; label: string }[] = [
  { key: "prompt", label: "Prompt" },
  { key: "code", label: "Code" },
  { key: "content", label: "Content" },
  { key: "design", label: "Design" },
];

export function RubricPanel() {
  const result = useQualityStore((s) => s.result);
  const scenario = useQualityStore((s) => s.rubricScenario);
  const threshold = useQualityStore((s) => s.rubricThreshold);
  const setScenario = useQualityStore((s) => s.setRubricScenario);
  const setThreshold = useQualityStore((s) => s.setRubricThreshold);

  if (!result?.rubricResult) {
    return (
      <div className="flex h-full min-h-[100px] items-center justify-center text-sm text-muted-foreground">
        Run analysis to see rubric evaluation
      </div>
    );
  }

  const rubric = result.rubricResult;

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
          {SCENARIOS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                scenario === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Threshold:</span>
          <input
            type="number"
            min={1}
            max={10}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-12 rounded-md border bg-background px-1.5 py-1 text-xs text-center"
          />
        </div>
      </div>

      {/* Pass/Fail banner */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-4 py-2",
          rubric.passed
            ? "border-green-500/20 bg-green-500/5"
            : "border-red-500/20 bg-red-500/5",
        )}
      >
        {rubric.passed ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-red-600" />
        )}
        <span className="text-sm font-medium">
          {rubric.passed ? "PASS" : "FAIL"} -- Score: {rubric.overall}/{threshold} threshold
        </span>
      </div>

      {/* Criteria breakdown */}
      <div className="flex flex-col gap-2">
        {rubric.criteria.map((c) => (
          <div
            key={c.name}
            className={cn(
              "rounded-lg border px-3 py-2",
              c.passed ? "border-green-500/10" : "border-red-500/10",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{c.name}</span>
              <span
                className={cn(
                  "text-xs font-mono",
                  c.passed ? "text-green-600" : "text-red-600",
                )}
              >
                {c.score}/10
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{c.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
