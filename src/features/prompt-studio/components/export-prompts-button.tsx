"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";

/** Dropdown button to export agent prompts as JSON / YAML / Markdown. */
export function ExportPromptsButton() {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const download = async (format: string) => {
    setOpen(false);
    setExporting(true);
    try {
      const res = await fetch(`/api/prompts/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      if (!data.content) { alert("No prompts to export"); return; }
      const ext = format === "markdown" ? "md" : format === "yaml" ? "yaml" : "json";
      const blob = new Blob([data.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompts-export.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={exporting}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <Download className="h-3 w-3" />
        {exporting ? "..." : "Export"}
        <ChevronDown className="h-2.5 w-2.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-28 rounded-lg border border-border bg-card shadow-lg py-1">
          <button onClick={() => download("json")} className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted">JSON</button>
          <button onClick={() => download("yaml")} className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted">YAML</button>
          <button onClick={() => download("markdown")} className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted">Markdown</button>
        </div>
      )}
    </div>
  );
}
