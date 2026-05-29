"use client";

import { Loader2, Brain } from "lucide-react";
import { useQualityStore } from "../hooks/use-quality-store";

export function DeepAnalysisPanel() {
  const result = useQualityStore((s) => s.result);
  const isDeepAnalyzing = useQualityStore((s) => s.isDeepAnalyzing);

  if (isDeepAnalyzing) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">LLM is analyzing...</span>
        <span className="text-xs">This may take 10-30 seconds</span>
      </div>
    );
  }

  if (!result?.llmAnalysis) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Brain className="h-8 w-8 opacity-30" />
        <span>Click "Deep Analysis" to get LLM-powered evaluation</span>
        <span className="text-xs">
          Checks meaning, contradictions, completeness, security
        </span>
      </div>
    );
  }

  const lines = result.llmAnalysis.split("\n");

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border bg-muted/20 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          LLM Analysis Report
        </h3>
      </div>
      <div className="rounded-lg border bg-background px-4 py-3 overflow-y-auto max-h-[calc(100vh-400px)]">
        <pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono">
          {lines.map((line, i) => {
            if (line.startsWith("## OVERALL:")) {
              const parts = line.replace("## OVERALL: ", "");
              const isPass = parts.includes("PASS");
              const isWarn = parts.includes("WARN");
              return (
                <p key={i} className={`text-sm font-bold ${isPass ? "text-green-400" : isWarn ? "text-yellow-400" : "text-red-400"}`}>
                  {line}
                </p>
              );
            }
            if (line.startsWith("## ")) {
              return <p key={i} className="mt-3 text-xs font-bold text-primary">{line.replace("## ", "")}</p>;
            }
            if (line.startsWith("Score:")) {
              const scoreMatch = line.match(/(\d+)/);
              const score = scoreMatch ? Number(scoreMatch[1]) : 0;
              return (
                <p key={i} className={`font-medium ${score >= 7 ? "text-green-400" : score >= 4 ? "text-yellow-400" : "text-red-400"}`}>
                  {line}
                </p>
              );
            }
            return <p key={i} className="text-muted-foreground">{line}</p>;
          })}
        </pre>
      </div>
    </div>
  );
}
