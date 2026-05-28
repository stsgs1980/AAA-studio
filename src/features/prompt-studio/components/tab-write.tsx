"use client";

import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";
import { usePromptEngine } from "@/features/prompt-studio/hooks/use-prompt-engine";
import { ScorePanel } from "./score-panel";
import { IntentBadge } from "./intent-badge";
import { FormulaPicker } from "./formula-picker";
import { FORMULAS } from "@stsgs/prompting";

export function TabWrite() {
  const editorText = usePromptStudioStore((s) => s.editorText);
  const setEditorText = usePromptStudioStore((s) => s.setEditorText);
  const insertFormula = usePromptStudioStore((s) => s.insertFormula);

  const { score, intent } = usePromptEngine(editorText);

  const charCount = editorText.length;
  const lineCount = editorText ? editorText.split("\n").length : 0;
  const variables = [...new Set(editorText.match(/\{(\w+)\}/g) ?? [])];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      {/* Editor panel (3/5) */}
      <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
        {/* Intent badge + formula picker */}
        <div className="flex items-center gap-2 flex-wrap">
          <IntentBadge intent={intent} />
          <FormulaPicker
            formulas={FORMULAS}
            onSelect={(f) => insertFormula(f.template)}
          />
        </div>

        {/* Textarea */}
        <textarea
          value={editorText}
          onChange={(e) => setEditorText(e.target.value)}
          placeholder="Write or paste your prompt here to see live scoring..."
          className="flex-1 w-full min-h-[300px] text-sm font-mono bg-midnight-base border border-midnight-border rounded-lg p-4 resize-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none text-text-primary placeholder:text-text-muted"
        />

        {/* Bottom stats */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
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
