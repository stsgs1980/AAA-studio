"use client";

import { cn } from "@stsgs/ui";
import { useSkillStore } from "../store/skills-store";
import { useEffect } from "react";

export function ValidateTab() {
  const { selected, validateResults, validateSummary, validateLoading, validateCode } = useSkillStore();

  useEffect(() => {
    if (selected && validateResults.length === 0 && !validateLoading && !validateSummary) {
      validateCode(selected.id);
    }
  }, [selected?.id]);

  if (!selected) return null;

  if (validateLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Validating against standards...
      </div>
    );
  }

  if (!validateSummary) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No validation results yet
      </div>
    );
  }

  const passRate = validateSummary.totalRules > 0
    ? Math.round((validateSummary.passed / validateSummary.totalRules) * 100)
    : 0;

  return (
    <div className="space-y-3 p-4 overflow-y-auto">
      <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-background/50">
        <div className="text-center">
          <div className={cn("text-2xl font-bold", passRate >= 80 ? "text-green-500" : passRate >= 50 ? "text-yellow-500" : "text-red-500")}>
            {passRate}%
          </div>
          <div className="text-[10px] text-muted-foreground">Pass Rate</div>
        </div>
        <div className="flex-1 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <div className="font-semibold text-foreground">{validateSummary.standardsChecked}</div>
            <div className="text-muted-foreground">Standards</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">{validateSummary.totalRules}</div>
            <div className="text-muted-foreground">Rules</div>
          </div>
          <div>
            <div className="font-semibold text-green-500">{validateSummary.passed}</div>
            <div className="text-muted-foreground">Passed</div>
          </div>
          <div>
            <div className="font-semibold text-red-500">{validateSummary.failed}</div>
            <div className="text-muted-foreground">Failed</div>
          </div>
        </div>
        <button onClick={() => selected && validateCode(selected.id)}
          className="px-3 py-1.5 rounded bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent/90">
          Re-validate
        </button>
      </div>

      {validateResults.filter(r => !r.passed).length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-red-500 mb-2">Violations</h3>
          <div className="space-y-1">
            {validateResults.filter(r => !r.passed).map((r, i) => (
              <div key={i} className="rounded border border-red-500/20 bg-red-500/5 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-medium">FAIL</span>
                  <span className="text-xs font-medium text-foreground">{r.ruleName}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {r.standardName} {r.match && <span className="font-mono text-red-400">matched: {r.match}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {validateResults.filter(r => r.passed).length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-green-500 mb-2">Passed Rules</h3>
          <div className="space-y-0.5">
            {validateResults.filter(r => r.passed).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="text-green-500">+</span>
                <span>{r.ruleName}</span>
                <span className="text-muted-foreground/50">({r.standardName})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {validateSummary.totalRules === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">
          No patterns found in linked standards. Add standards with rules that have patterns.
        </div>
      )}
    </div>
  );
}
