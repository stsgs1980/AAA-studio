"use client";

import { cn } from "@stsgs/ui";
import { Check, Shield, AlertTriangle } from "lucide-react";
import { useQualityStore } from "../hooks/use-quality-store";

export function StandardsPanel() {
  const result = useQualityStore((s) => s.result);

  if (!result) {
    return (
      <div className="flex h-full min-h-[100px] items-center justify-center text-sm text-muted-foreground">
        Run analysis to see standards check
      </div>
    );
  }

  const { standardsCheck } = result;
  const allPassed = standardsCheck.failed === 0 && standardsCheck.checked > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
        <Shield
          className={cn(
            "h-5 w-5",
            allPassed ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400",
          )}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {standardsCheck.passed}/{standardsCheck.checked} rules passed
          </span>
          <span className="text-xs text-muted-foreground">
            {standardsCheck.failed > 0
              ? `${standardsCheck.failed} rule(s) need attention`
              : "All checked rules pass"}
          </span>
        </div>
      </div>

      {/* Details */}
      {standardsCheck.details.length > 0 && (
        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
          {standardsCheck.details.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2 rounded-md px-3 py-1.5 text-xs",
                item.passed ? "bg-green-500/5" : "bg-red-500/5",
              )}
            >
              {item.passed ? (
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span className="text-muted-foreground">{item.standardName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
