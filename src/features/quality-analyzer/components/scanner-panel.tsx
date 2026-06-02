"use client";

import { Loader2, Scan } from "lucide-react";
import { useQualityStore } from "../hooks/use-quality-store";

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-500", B: "text-cyan-500", C: "text-amber-500",
  D: "text-orange-500", F: "text-red-500",
};

const DIM_LABELS: Record<string, string> = {
  completeness: "Completeness", references: "References",
  consistency: "Consistency", examples: "Examples", constraints: "Constraints",
};

export function ScannerPanel() {
  const report = useQualityStore((s) => s.scannerReport);
  const isScanning = useQualityStore((s) => s.isScanning);

  if (isScanning) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">Scanner is analyzing...</span>
        <span className="text-xs">Parsing files, checking references, evaluating quality</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Scan className="h-8 w-8 opacity-30" />
        <span>Click &quot;Scanner&quot; to run toolkit analysis</span>
        <span className="text-xs">
          Parses structure, checks cross-references, evaluates quality
        </span>
      </div>
    );
  }

  const ev = report.evaluation;
  const gradeColor = ev ? (GRADE_COLORS[ev.grade] ?? "text-muted-foreground") : "";
  const refBroken = report.references.filter((r) => !r.resolved);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border bg-muted/20 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Scanner Report
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span>{report.structure.totalFiles} files</span>
          <span>{report.structure.skillsCount} skills</span>
          <span>{report.structure.standardsCount} standards</span>
          <span>{(report.structure.totalSize / 1024).toFixed(1)} KB</span>
        </div>
      </div>

      {ev && (
        <div className="rounded-lg border bg-background px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quality Score
            </span>
            <span className={`text-2xl font-bold ${gradeColor}`}>{ev.grade}</span>
          </div>
          <div className="space-y-2">
            {Object.entries(DIM_LABELS).map(([key, label]) => {
              const val = ev.dimensions[key as keyof typeof ev.dimensions] ?? 0;
              const color = val >= 80 ? "bg-green-500" : val >= 60 ? "bg-amber-500" : "bg-red-500";
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-muted-foreground">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${val}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-medium">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {refBroken.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/20">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
            Broken References ({refBroken.length})
          </p>
          <div className="space-y-1 max-h-[120px] overflow-y-auto">
            {refBroken.slice(0, 10).map((r) => (
              <p key={`${r.id}-${r.source}`} className="text-xs text-red-500 dark:text-red-400">
                {r.id} (in {r.source.split("/").pop()})
              </p>
            ))}
            {refBroken.length > 10 && (
              <p className="text-xs text-muted-foreground">...and {refBroken.length - 10} more</p>
            )}
          </div>
        </div>
      )}

      {ev?.recommendations && ev.recommendations.length > 0 && (
        <div className="rounded-lg border bg-background px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Recommendations
          </p>
          <ul className="space-y-1">
            {ev.recommendations.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
