"use client";

import { Check, Copy } from "lucide-react";

interface CodeBlockHeaderProps {
  language: string;
  title?: string;
  copied: boolean;
  onCopy: () => void;
}

export function CodeBlockHeader({
  language, title, copied, onCopy,
}: CodeBlockHeaderProps) {
  const copyBtn = (
    <button
      onClick={onCopy}
      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-muted-foreground transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-brand-green" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  if (title || language) {
    return (
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-card">
        <div className="flex items-center gap-2">
          {language && (
            <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-brand-accent">
              {language}
            </span>
          )}
          {title && <span className="text-xs text-muted-foreground">{title}</span>}
        </div>
        {copyBtn}
      </div>
    );
  }

  return (
    <div className="flex justify-end border-b border-border px-3 py-1 bg-card">
      {copyBtn}
    </div>
  );
}
