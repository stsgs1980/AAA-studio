"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@stsgs/ui";
import {
  Copy, Check, Star, Send, ChevronUp, BookOpen,
} from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { usePromptLibraryStore } from "../store/prompt-library-store";
import type { LibraryPrompt } from "../data/prompt-categories";
import { PROMPT_CATEGORIES } from "../data/prompt-categories";

interface PromptCardProps {
  prompt: LibraryPrompt;
}

export function PromptCard({ prompt: p }: PromptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const toggleFav = usePromptLibraryStore((s) => s.toggleFavorite);
  const isFav = usePromptLibraryStore((s) => s.favorites.has(p.id));
  const sendToStudio = usePromptLibraryStore((s) => s.sendToStudio);
  const copyToClip = usePromptLibraryStore((s) => s.copyToClipboard);
  const navigateToFormula = usePromptLibraryStore((s) => s.navigateToFormula);

  const cat = PROMPT_CATEGORIES.find((c) => c.id === p.category);
  const catColor = cat?.color ?? "text-muted-foreground bg-muted";

  const flash = (setter: (v: boolean) => void) => { setter(true); setTimeout(() => setter(false), 2000); };

  const handleCopy = async () => { await copyToClip(p.prompt); flash(setCopied); };
  const handleSend = () => { sendToStudio(p.prompt); flash(setSent); router.push("/prompt-studio"); };
  const handleFormulaClick = () => {
    if (!p.formulaRef) return;
    navigateToFormula(p.formulaRef);
    router.push("/prompt-studio");
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-brand-accent/30 transition-colors">
      {/* Header */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">
              {p.title}
            </h3>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", catColor)}>
              {cat?.label ?? p.category}
            </span>
            {p.formulaRef && (
              <button
                onClick={handleFormulaClick}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium text-brand-purple bg-brand-purple/15 hover:bg-brand-purple/25 transition-colors cursor-pointer"
              >
                {p.formulaRef.toUpperCase()}
              </button>
            )}
          </div>
          <button
            onClick={() => toggleFav(p.id)}
            className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          >
            <Star
              className={cn("h-4 w-4", isFav
                ? "fill-brand-amber text-brand-amber"
                : "text-muted-foreground")}
            />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {p.description}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {p.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{p.prompt.split("\n").length} lines</span>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[10px] text-brand-accent hover:text-brand-accent/80 transition-colors">
            {expanded ? <><ChevronUp className="h-3 w-3" /> Hide</> : <><BookOpen className="h-3 w-3" /> Preview</>}
          </button>
        </div>

        {expanded && (
          <CodeBlock
            code={p.prompt}
            language="markdown"
            compact
            maxLines={12}
          />
        )}
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border bg-background/50">
        <button onClick={handleCopy} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", copied ? "bg-brand-green/15 text-brand-green" : "bg-muted text-muted-foreground hover:text-foreground")}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
        </button>
        <button onClick={handleSend} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto", sent ? "bg-brand-accent/15 text-brand-accent" : "bg-brand-accent text-white hover:bg-brand-accent/90")}>
          <Send className="h-3.5 w-3.5" /> {sent ? "Sent to Studio" : "Use in Studio"}
        </button>
      </div>
    </div>
  );
}
