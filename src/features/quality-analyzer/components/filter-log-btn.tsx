"use client";

import { useState } from "react";
import { FileX2, ChevronDown, ChevronUp } from "lucide-react";
import { useQualityStore } from "../hooks/use-quality-store";
import type { FilterReason } from "../types";

const REASON_LABELS: Record<FilterReason, string> = {
  skip_file: "config/setup file",
  skip_dir: "build/dist dir",
  dot_dir: "hidden dir (dot-prefix)",
  wrong_ext: "unsupported extension",
  too_large: "exceeds 500KB",
};

const REASON_COLORS: Record<FilterReason, string> = {
  skip_file: "text-amber-600 dark:text-amber-400",
  skip_dir: "text-blue-600 dark:text-blue-400",
  dot_dir: "text-zinc-500 dark:text-zinc-400",
  wrong_ext: "text-purple-600 dark:text-purple-400",
  too_large: "text-red-600 dark:text-red-400",
};

export function FilterLogBtn() {
  const filterLog = useQualityStore((s) => s.filterLog);
  const [open, setOpen] = useState(false);

  if (!filterLog) return null;

  const grouped = new Map<FilterReason, string[]>();
  for (const e of filterLog.entries) {
    const list = grouped.get(e.reason) ?? [];
    list.push(e.path);
    grouped.set(e.reason, list);
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50">
        <FileX2 className="h-3.5 w-3.5" />
        Filter Log ({filterLog.entries.length})
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-[460px] max-h-[400px] overflow-y-auto rounded-lg border bg-background p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold">
              {filterLog.total} total &rarr; {filterLog.accepted} accepted, {filterLog.entries.length} filtered
            </span>
            <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>

          {Array.from(grouped.entries()).map(([reason, paths]) => (
            <div key={reason} className="mb-2">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className={`font-mono ${REASON_COLORS[reason]}`}>
                  [{reason}]
                </span>
                <span className="text-muted-foreground">{REASON_LABELS[reason]} ({paths.length})</span>
              </div>
              <div className="mt-0.5 max-h-[120px] overflow-y-auto pl-4">
                {paths.map((p) => (
                  <div key={p} className="truncate text-[10px] font-mono text-muted-foreground/80">{p}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}