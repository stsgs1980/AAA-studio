"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import type { AntiPattern } from "@/lib/scanner/types";

const TYPE_CFG: Record<string, { color: string; label: string }> = {
  inline_dup: { color: "text-amber-400", label: "Inline Dup" },
  unregistered_std: { color: "text-red-400", label: "Unregistered STD" },
  version_drift: { color: "text-orange-400", label: "Version Drift" },
  missing_examples: { color: "text-cyan-400", label: "Missing Examples" },
};

const SEV_STYLE: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  warning: "bg-amber-500/20 text-amber-400",
  info: "bg-cyan-500/20 text-cyan-400",
};

function copyIssues(patterns: AntiPattern[]): string {
  return `Anti-Patterns (${patterns.length})\n${"=".repeat(40)}\n`
    + patterns.map(p =>
      `[${p.severity.toUpperCase()}] ${p.type}: ${p.message}\n  Sources: ${p.sources.join(", ")}`,
    ).join("\n");
}

export function ScannerIssues({ antiPatterns }: { antiPatterns: AntiPattern[] }) {
  const grouped = new Map<string, AntiPattern[]>();
  for (const ap of antiPatterns) {
    if (!grouped.has(ap.type)) grouped.set(ap.type, []);
    grouped.get(ap.type)!.push(ap);
  }
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const critCount = antiPatterns.filter(p => p.severity === "critical").length;
  const warnCount = antiPatterns.filter(p => p.severity === "warning").length;

  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Issues ({antiPatterns.length})
        </p>
        <div className="flex items-center gap-2">
          {critCount > 0 && <span className="text-[10px] text-red-400">{critCount} critical</span>}
          {warnCount > 0 && <span className="text-[10px] text-amber-400">{warnCount} warning</span>}
          <button
            onClick={() => {
              navigator.clipboard.writeText(copyIssues(antiPatterns));
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Copy className="h-3 w-3" />{copied ? "Copied!" : "Copy all"}
          </button>
        </div>
      </div>
      <div className="max-h-[300px] overflow-y-auto space-y-1">
        {[...grouped.entries()].map(([type, items]) => {
          const cfg = TYPE_CFG[type] ?? { color: "text-muted-foreground", label: type };
          return (
            <div key={type}>
              <div className="flex items-center gap-1.5 text-xs font-medium mb-0.5">
                <span className={cfg.color}>&#9679;</span>
                <span>{cfg.label}</span>
                <span className="text-muted-foreground">({items.length})</span>
              </div>
              {items.map((item, i) => {
                const key = `${type}-${i}`;
                const isExp = expanded === key;
                return (
                  <div key={key} className="ml-4">
                    <button
                      onClick={() => setExpanded(isExp ? null : key)}
                      className="w-full flex items-center gap-1 px-1 py-0.5 rounded hover:bg-muted/50 text-xs text-left"
                    >
                      {isExp ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                      <span className={`px-1 rounded text-[10px] font-medium ${SEV_STYLE[item.severity]}`}>
                        {item.severity}
                      </span>
                      <span className="text-muted-foreground truncate text-[11px]">{item.message}</span>
                    </button>
                    {isExp && (
                      <div className="ml-5 mb-1 rounded bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground space-y-0.5">
                        {item.sources.map((src, j) => {
                          const parts = src.split("/");
                          const short = parts.length > 2 ? parts.slice(-3).join("/") : src;
                          return <p key={j} className="truncate" title={src}>&bull; {short}</p>;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
