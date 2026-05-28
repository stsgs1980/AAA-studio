"use client";

import { useState } from "react";
import { cn } from "@stsgs/ui";
import {
  Copy, Check, Star, Send, BookOpen,
} from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { usePromptLibraryStore } from "../store/prompt-library-store";
import type { LibraryPrompt } from "../data/prompt-categories";
import { PROMPT_CATEGORIES } from "../data/prompt-categories";

interface PromptListItemProps {
  prompt: LibraryPrompt;
}

export function PromptListItem({ prompt: p }: PromptListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleFav = usePromptLibraryStore((s) => s.toggleFavorite);
  const isFav = usePromptLibraryStore((s) => s.favorites.has(p.id));
  const sendToStudio = usePromptLibraryStore((s) => s.sendToStudio);
  const copyToClip = usePromptLibraryStore((s) => s.copyToClipboard);

  const cat = PROMPT_CATEGORIES.find((c) => c.id === p.category);
  const catColor = cat?.color ?? "text-text-muted bg-midnight-elevated";

  const handleCopy = async () => {
    await copyToClip(p.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    sendToStudio(p.prompt);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="rounded-xl border border-midnight-border bg-midnight-card overflow-hidden hover:border-brand-accent/30 transition-colors">
      {/* Main row */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Info */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h3 className="text-sm font-semibold text-text-primary shrink-0">
            {p.title}
          </h3>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", catColor)}>
            {cat?.label ?? p.category}
          </span>
          {p.formulaRef && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-brand-purple bg-brand-purple/15">
              {p.formulaRef}
            </span>
          )}
          <p className="text-xs text-text-muted truncate max-w-sm">
            {p.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-midnight-elevated text-text-secondary hover:text-text-primary transition-colors"
          >
            <BookOpen className="h-3 w-3" />
            {expanded ? "Hide" : "Preview"}
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
              copied
                ? "bg-brand-green/15 text-brand-green"
                : "bg-midnight-elevated text-text-secondary hover:text-text-primary",
            )}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleSend}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
              sent
                ? "bg-brand-accent/15 text-brand-accent"
                : "bg-brand-accent text-white hover:bg-brand-accent/90",
            )}
          >
            <Send className="h-3 w-3" />
            {sent ? "Sent" : "Use in Studio"}
          </button>
          <button
            onClick={() => toggleFav(p.id)}
            className="p-1 rounded hover:bg-midnight-elevated transition-colors"
          >
            <Star
              className={cn("h-4 w-4", isFav
                ? "fill-brand-amber text-brand-amber"
                : "text-text-muted")}
            />
          </button>
        </div>
      </div>

      {/* Expandable preview */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-midnight-border">
          <CodeBlock
            code={p.prompt}
            language="markdown"
            compact
            maxLines={15}
          />
        </div>
      )}
    </div>
  );
}
