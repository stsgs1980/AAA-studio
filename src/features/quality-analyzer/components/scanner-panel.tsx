"use client";

import { useState } from "react";
import { Loader2, Scan, Copy } from "lucide-react";
import { useQualityStore } from "../hooks/use-quality-store";
import { ScannerSkillTable } from "./scanner-skill-table";
import { ScannerRefList } from "./scanner-ref-list";
import { ScannerIssues } from "./scanner-issues";

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-500", B: "text-cyan-500", C: "text-amber-500",
  D: "text-orange-500", F: "text-red-500",
};

const DIM_LABELS: Record<string, string> = {
  completeness: "Completeness", references: "References",
  consistency: "Consistency", examples: "Examples", constraints: "Constraints",
};

type Section = "summary" | "skills" | "references" | "issues" | "recommendations";

const SECTION_LABELS: Record<Section, string> = {
  summary: "Summary", skills: "Skills", references: "References", issues: "Issues", recommendations: "Recommendations",
};

export function ScannerPanel() {
  const report = useQualityStore((s) => s.scannerReport);
  const isLlmEvaluating = useQualityStore((s) => s.isLlmEvaluating);
  const [activeSection, setActiveSection] = useState<Section>("summary");
  const [copiedRecs, setCopiedRecs] = useState(false);

  if (!report) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Scan className="h-8 w-8 opacity-30" />
        <span>Click &quot;Scanner&quot; to run toolkit analysis</span>
        <span className="text-xs">Parses structure, checks cross-references, evaluates quality</span>
      </div>
    );
  }

  const ev = report.evaluation;
  const gradeColor = ev ? (GRADE_COLORS[ev.grade] ?? "text-muted-foreground") : "";
  const refBroken = report.references.filter((r) => !r.resolved);
  const apCount = report.antiPatterns?.length ?? 0;
  const sections: Section[] = ["summary", "skills", "references"];
  if (apCount > 0) sections.push("issues");
  if (ev?.recommendations && ev.recommendations.length > 0) sections.push("recommendations");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 border-b pb-1">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-2 py-1 rounded-t text-xs transition-colors ${
              activeSection === s
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {SECTION_LABELS[s]}
            {s === "skills" && <span className="ml-1 text-muted-foreground">({report.skills.length})</span>}
            {s === "references" && refBroken.length > 0 && (
              <span className="ml-1 text-red-400">({refBroken.length})</span>
            )}
            {s === "issues" && apCount > 0 && (
              <span className="ml-1 text-red-400">({apCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Summary */}
      {activeSection === "summary" && (<>
          {isLlmEvaluating && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />LLM evaluation in progress...
            </div>
          )}
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
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality Score</span>
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
        </>
      )}

      {activeSection === "skills" && <ScannerSkillTable skills={report.skills} />}
      {activeSection === "references" && <ScannerRefList references={report.references} />}
      {activeSection === "issues" && apCount > 0 && <ScannerIssues antiPatterns={report.antiPatterns!} />}

      {/* Recommendations */}
      {activeSection === "recommendations" && ev?.recommendations && (
        <div className="rounded-lg border bg-background px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommendations</p>
            <button onClick={() => {
              navigator.clipboard.writeText("Recommendations\n" + "=".repeat(30) + "\n" + ev.recommendations!.map((r, i) => `${i + 1}. ${r}`).join("\n"));
              setCopiedRecs(true); setTimeout(() => setCopiedRecs(false), 2000);
            }} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50">
              <Copy className="h-3 w-3" />{copiedRecs ? "Copied!" : "Copy"}
            </button>
          </div>
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
