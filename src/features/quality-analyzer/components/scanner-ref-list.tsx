"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Link2, Unlink, Copy } from "lucide-react";
import type { ReferenceCheck } from "@/lib/scanner/types";

export function ScannerRefList({ references }: { references: ReferenceCheck[] }) {
  const [filter, setFilter] = useState<"all" | "broken">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "broken"
    ? references.filter((r) => !r.resolved)
    : references;
  const resolvedCount = references.filter((r) => r.resolved).length;
  const brokenCount = references.length - resolvedCount;
  const fn = (p: string) => p.split("/").pop() ?? p;

  function copyRefs() {
    const lines = filtered.map(r => `${r.id} | ${r.resolved ? 'OK' : 'BROKEN'} | ${r.source}${r.targetPath ? ' -> ' + r.targetPath : ''}`);
    navigator.clipboard.writeText(`References (${filtered.length})\n${'='.repeat(40)}\n` + lines.join('\n'));
  }

  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          References ({resolvedCount}/{references.length} resolved)
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={copyRefs}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50"
            title="Copy reference list"
          >
            <Copy className="h-3 w-3" />Copy
          </button>
          {brokenCount > 0 && (<>
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-0.5 rounded text-[10px] ${filter === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >All</button>
            <button
              onClick={() => setFilter("broken")}
              className={`px-2 py-0.5 rounded text-[10px] ${filter === "broken" ? "bg-red-500/20 text-red-400" : "text-muted-foreground hover:text-foreground"}`}
            >Broken ({brokenCount})</button>
          </>)}
        </div>
      </div>

      <div className="max-h-[200px] overflow-y-auto space-y-0.5">
        {filtered.map((ref) => {
          const isExpanded = expanded === `${ref.id}-${ref.source}`;
          return (
            <div key={`${ref.id}-${ref.source}`}>
              <button
                onClick={() => setExpanded(isExpanded ? null : `${ref.id}-${ref.source}`)}
                className="w-full flex items-center gap-1 px-1 py-0.5 rounded hover:bg-muted/50 text-xs text-left"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                {ref.resolved
                  ? <Link2 className="h-3 w-3 text-green-500 shrink-0" />
                  : <Unlink className="h-3 w-3 text-red-500 shrink-0" />}
                <span className={ref.resolved ? "text-foreground" : "text-red-400 font-medium"}>
                  {ref.id}
                </span>
                <span className="text-muted-foreground truncate ml-1">in {fn(ref.source)}</span>
              </button>
              {isExpanded && (
                <div className="ml-6 mb-1 rounded bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground space-y-0.5">
                  <p><span className="font-medium">ID:</span> {ref.id}</p>
                  <p><span className="font-medium">Source:</span> {ref.source}</p>
                  {ref.targetPath && (
                    <p><span className="font-medium">Target:</span> {ref.targetPath}</p>
                  )}
                  {!ref.resolved && !ref.targetPath && (
                    <p className="text-red-400">No file defines this ID</p>
                  )}
                  <p>
                    <span className="font-medium">Status:</span>
                    <span className={ref.resolved ? "text-green-500" : "text-red-400"}>
                      {ref.resolved ? " Resolved" : " Broken"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            {filter === "broken" ? "No broken references" : "No references found"}
          </p>
        )}
      </div>
    </div>
  );
}
