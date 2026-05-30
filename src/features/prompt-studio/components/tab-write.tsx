"use client";

import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";
import { usePromptEngine } from "@/features/prompt-studio/hooks/use-prompt-engine";
import { ScorePanel } from "./score-panel";
import { IntentBadge } from "./intent-badge";
import { FormulaPicker } from "./formula-picker";
import { FORMULAS } from "@stsgs/prompting";
import { Trash2, Copy, Check } from "lucide-react";
import { useState } from "react";

export function TabWrite() {
  const editorText = usePromptStudioStore((s) => s.editorText);
  const setEditorText = usePromptStudioStore((s) => s.setEditorText);
  const insertFormula = usePromptStudioStore((s) => s.insertFormula);
  const [copied, setCopied] = useState(false);

  const { score, intent } = usePromptEngine(editorText);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      {/* Editor panel (3/5) */}
      <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
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

      {/* Score panel (2/5) */}
      <div className="lg:col-span-2">
        <ScorePanel score={score} />
      </div>
    </div>
  );
}
