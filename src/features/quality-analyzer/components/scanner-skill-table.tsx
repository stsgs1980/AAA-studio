"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import type { ParsedSkill } from "@/lib/scanner/types";

type SortKey = "completeness" | "wordCount" | "name";
type SortDir = "asc" | "desc";

function fileName(path: string) {
  return path.split("/").pop() ?? path;
}

export function ScannerSkillTable({ skills }: { skills: ParsedSkill[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("completeness");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...skills].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const lowSkills = skills.filter((s) => s.completeness < 50).length;
  const noExample = skills.filter((s) => !s.hasExamples).length;

  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Skills ({skills.length})
        </p>
        <div className="flex gap-2 text-xs text-muted-foreground">
          {lowSkills > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="h-3 w-3" />{lowSkills} low completeness
            </span>
          )}
          {noExample > 0 && <span>{noExample} no examples</span>}
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1fr_48px_48px_56px] gap-1 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b pb-1 mb-1">
        <button onClick={() => toggle("name")} className="text-left hover:text-foreground">
          Name {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
        </button>
        <button onClick={() => toggle("completeness")} className="text-right hover:text-foreground">
          Comp {sortKey === "completeness" && (sortDir === "asc" ? "↑" : "↓")}
        </button>
        <button onClick={() => toggle("wordCount")} className="text-right hover:text-foreground">
          Words {sortKey === "wordCount" && (sortDir === "asc" ? "↑" : "↓")}
        </button>
        <span className="text-right">Flags</span>
      </div>

      {/* Rows */}
      <div className="max-h-[300px] overflow-y-auto space-y-0.5">
        {sorted.slice(0, 50).map((skill) => {
          const isExpanded = expanded === skill.path;
          const color = skill.completeness >= 80 ? "text-green-500"
            : skill.completeness >= 50 ? "text-amber-500" : "text-red-500";
          return (
            <div key={skill.path}>
              <button
                onClick={() => setExpanded(isExpanded ? null : skill.path)}
                className="w-full grid grid-cols-[1fr_48px_48px_56px] gap-1 px-1 py-0.5 rounded hover:bg-muted/50 text-left text-xs"
              >
                <span className="flex items-center gap-1 truncate">
                  {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                  <span className="truncate">{skill.name ?? fileName(skill.path)}</span>
                </span>
                <span className={`text-right font-medium ${color}`}>{skill.completeness}</span>
                <span className="text-right text-muted-foreground">{skill.wordCount}</span>
                <span className="text-right text-muted-foreground">
                  {skill.hasExamples ? "E" : ""}{skill.hasConstraints ? "C" : ""}{skill.hasCodeBlocks ? "`" : ""}
                </span>
              </button>
              {isExpanded && (
                <div className="ml-5 mb-1 rounded bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground space-y-0.5">
                  <p><span className="font-medium">Path:</span> {skill.path}</p>
                  {skill.id && <p><span className="font-medium">ID:</span> {skill.id}</p>}
                  {skill.version && <p><span className="font-medium">Version:</span> {skill.version}</p>}
                  {skill.trigger.length > 0 && (
                    <p><span className="font-medium">Triggers:</span> {skill.trigger.join(", ")}</p>
                  )}
                  <p><span className="font-medium">Sections:</span> {skill.sections.length > 0 ? skill.sections.join(", ") : "none"}</p>
                  <div className="flex gap-3 mt-1">
                    <span className={skill.hasExamples ? "text-green-500" : "text-red-400"}>
                      Examples: {skill.hasExamples ? "Yes" : "No"}
                    </span>
                    <span className={skill.hasConstraints ? "text-green-500" : "text-red-400"}>
                      Constraints: {skill.hasConstraints ? "Yes" : "No"}
                    </span>
                    <span className={skill.hasCodeBlocks ? "text-green-500" : "text-red-400"}>
                      Code: {skill.hasCodeBlocks ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {skills.length > 50 && (
        <p className="text-[10px] text-muted-foreground mt-1">Showing 50 of {skills.length} skills</p>
      )}
    </div>
  );
}
