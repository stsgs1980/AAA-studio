"use client";

import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";
import { usePromptEngine } from "@/features/prompt-studio/hooks/use-prompt-engine";
import { ScorePanel } from "./score-panel";
import { IntentBadge } from "./intent-badge";
import { FormulaPicker } from "./formula-picker";
import { FORMULAS } from "@stsgs/prompting";
import { Trash2, Copy, Check, Download, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function TabWrite() {
  const editorText = usePromptStudioStore((s) => s.editorText);
  const setEditorText = usePromptStudioStore((s) => s.setEditorText);
  const insertFormula = usePromptStudioStore((s) => s.insertFormula);
  const [copied, setCopied] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { score, intent } = usePromptEngine(editorText);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const charCount = editorText.length;
  const lineCount = editorText ? editorText.split("\n").length : 0;
  const variables = [...new Set(editorText.match(/\{(\w+)\}/g) ?? [])];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (editorText && confirm("Clear the editor?")) {
      setEditorText("");
    }
  };

  const exportPrompts = async (format: string) => {
    setExportOpen(false);
    setExporting(true);
    try {
      const res = await fetch(`/api/prompts/export?format=${format}`);
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      if (!data.content) { alert('No prompts to export'); return; }
      const ext = format === 'markdown' ? 'md' : format === 'yaml' ? 'yaml' : 'json';
      const blob = new Blob([data.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompts-export.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Editor panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Intent badge + formula picker + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <IntentBadge intent={intent} />
          <FormulaPicker
            formulas={FORMULAS}
            onSelect={(f) => insertFormula(f.template)}
          />
          <div className="ml-auto flex items-center gap-1.5">
            {editorText && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-brand-green" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-muted text-muted-foreground hover:text-brand-red transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
                {/* Export prompts dropdown */}
                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setExportOpen(!exportOpen)}
                    disabled={exporting}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    {exporting ? '...' : 'Export'}
                    <ChevronDown className="h-2.5 w-2.5" />
                  </button>
                  {exportOpen && (
                    <div className="absolute right-0 top-full mt-1 z-50 w-28 rounded-lg border border-border bg-card shadow-lg py-1">
                      <button onClick={() => exportPrompts('json')} className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted">JSON</button>
                      <button onClick={() => exportPrompts('yaml')} className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted">YAML</button>
                      <button onClick={() => exportPrompts('markdown')} className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted">Markdown</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={editorText}
          onChange={(e) => setEditorText(e.target.value)}
          placeholder="Write or paste your prompt here to see live scoring..."
          className="flex-1 w-full min-h-[300px] text-sm font-mono bg-background border border-border rounded-lg p-4 resize-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none text-foreground placeholder:text-muted-foreground"
        />

        {/* Bottom stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{charCount} chars</span>
          <span>{lineCount} lines</span>
          {variables.length > 0 && (
            <div className="flex items-center gap-1.5">
              {variables.map((v) => (
                <span
                  key={v}
                  className="px-1.5 py-0.5 rounded bg-brand-accent/10 text-brand-accent font-mono text-[10px]"
                >
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Score panel */}
      <div className="w-full lg:w-64 shrink-0">
        <ScorePanel score={score} />
      </div>
    </div>
  );
}
