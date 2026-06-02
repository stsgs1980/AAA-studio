"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, Copy } from "lucide-react";
import type { ParsedSkill } from "@/lib/scanner/types";

type SortKey = "completeness" | "wordCount" | "name";
type SortDir = "asc" | "desc";

function displayName(path: string, name: string | null) {
  if (name) return name;
  const parts = path.split("/");
  const file = parts.pop() ?? path;
  const dir = parts.slice(-1)[0] ?? "";
  return dir ? `${dir}/${file}` : file;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
}

function skillRowText(s: ParsedSkill): string {
  const n = displayName(s.path, s.name);
  return `${n} | Comp:${s.completeness} | Words:${s.wordCount} | Ex:${s.hasExamples} | Con:${s.hasConstraints} | Code:${s.hasCodeBlocks} | Sections: ${s.sections.join(", ")} | Matched: [${s.matchedCriteria.join(", ")}] | Missing: [${s.missedCriteria.join(", ")}]`;
}

function allSkillsText(skills: ParsedSkill[]): string {
  return `Scanner Skills Report (${skills.length} skills)\n${"=".repeat(50)}\n\n`
    + skills.map(skillRowText).join("\n");
}

export function ScannerSkillTable({ skills }: { skills: ParsedSkill[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("completeness");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sorted = [...skills].sort((a, b) => {
    const aVal = sortKey === "name" ? (a.name ?? a.path) : a[sortKey];
    const bVal = sortKey === "name" ? (b.name ?? b.path) : b[sortKey];
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const low = skills.filter((s) => s.completeness < 50).length;
  const noEx = skills.filter((s) => !s.hasExamples).length;

  const handleCopyAll = () => {
    copyText(allSkillsText(sorted));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "";

  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Skills ({skills.length})
        </p>
        <div className="flex items-center gap-2">
          {low > 0 && <span className="flex items-center gap-1 text-xs text-amber-500" title="Skills with completeness < 50%"><AlertTriangle className="h-3 w-3" />{low} low comp</span>}
          {noEx > 0 && <span className="text-xs text-muted-foreground" title="Skills without examples or code blocks">{noEx} no examples</span>}
          <button onClick={handleCopyAll} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50">
            <Copy className="h-3 w-3" />{copied ? "Copied!" : "Copy all"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_40px_44px_56px] gap-1 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b pb-1 mb-1">
        <button onClick={() => toggle("name")} className="text-left hover:text-foreground" title="Skill name (sortable)">Name {sortIcon("name")}</button>
        <button onClick={() => toggle("completeness")} className="text-right hover:text-foreground" title="Completeness score 0-100 (sortable)">Comp {sortIcon("completeness")}</button>
        <button onClick={() => toggle("wordCount")} className="text-right hover:text-foreground" title="Word count (sortable)">Words {sortIcon("wordCount")}</button>
        <span className="text-right" title="E = Examples, C = Constraints, ` = Code blocks">Flags</span>
      </div>

      <div className="max-h-[300px] overflow-y-auto space-y-0.5">
        {sorted.slice(0, 50).map((skill) => {
          const isExp = expanded === skill.path;
          const color = skill.completeness >= 80 ? "text-green-500" : skill.completeness >= 50 ? "text-amber-500" : "text-red-500";
          return (
            <div key={skill.path}>
              <button onClick={() => setExpanded(isExp ? null : skill.path)} className="w-full grid grid-cols-[1fr_40px_44px_56px] gap-1 px-1 py-0.5 rounded hover:bg-muted/50 text-left text-xs">
                <span className="flex items-center gap-1 truncate">
                  {isExp ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                  <span className="truncate">{displayName(skill.path, skill.name)}</span>
                </span>
                <span className={`text-right font-medium ${color}`}>{skill.completeness}</span>
                <span className="text-right text-muted-foreground">{skill.wordCount}</span>
                <div className="flex items-center justify-end gap-0.5">
                  {skill.hasExamples && <span className="text-green-500 text-[10px]" title="Has examples">E</span>}
                  {skill.hasConstraints && <span className="text-green-500 text-[10px]" title="Has constraints">C</span>}
                  {skill.hasCodeBlocks && <span className="text-cyan-400 text-[10px]" title="Has code blocks">`</span>}
                </div>
              </button>
              {isExp && (
                <div className="ml-5 mb-1 rounded bg-muted/30 px-2 py-1.5 text-[10px] text-muted-foreground space-y-0.5">
                  <p><span className="font-medium">Path:</span> {skill.path}</p>
                  {skill.id && <p><span className="font-medium">ID:</span> {skill.id}</p>}
                  {skill.trigger.length > 0 && <p><span className="font-medium">Triggers:</span> {skill.trigger.join(", ")}</p>}
                  <p><span className="font-medium">Sections:</span> {skill.sections.join(", ") || "none"}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {skill.matchedCriteria.map(c => (
                      <span key={c} className="px-1 rounded bg-green-500/20 text-green-400">{c}</span>
                    ))}
                    {skill.missedCriteria.map(c => (
                      <span key={c} className="px-1 rounded bg-red-500/20 text-red-400">{c}</span>
                    ))}
                  </div>
                  <button onClick={() => copyText(skillRowText(skill))} className="mt-1 px-1.5 py-0.5 rounded hover:bg-muted/50 hover:text-foreground">Copy row</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {skills.length > 50 && <p className="text-[10px] text-muted-foreground mt-1">Showing 50 of {skills.length}</p>}
    </div>
  );
}
