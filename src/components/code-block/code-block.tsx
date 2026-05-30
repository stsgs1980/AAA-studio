"use client";

import { useState } from "react";
import { cn } from "@stsgs/ui";
import { CodeBlockHeader } from "./code-block-header";
import { useCodeHighlight } from "./use-code-highlight";

const DEFAULT_LANGS = [
  "json", "bash", "typescript", "javascript",
  "yaml", "text", "markdown", "python", "css",
] as const;

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  maxLines?: number;
  compact?: boolean;
  className?: string;
}

/**
 * Shared syntax-highlighted code block (Shiki github-dark).
 * Used across Wiki, Prompt Studio, Skill Forge, Audit Log, etc.
 */
export function CodeBlock({
  code, language = "text", title, maxLines,
  compact = false, className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const html = useCodeHighlight(code, language, DEFAULT_LANGS);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className={cn("rounded-lg overflow-hidden", className)}>
        {html ? (
          <div
            className="overflow-hidden text-[11px] leading-relaxed [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="text-[11px] font-mono leading-relaxed text-muted-foreground overflow-hidden">
            {code}
          </pre>
        )}
      </div>
    );
  }

  const truncated = maxLines
    ? code.split("\n").slice(0, maxLines).join("\n")
    : code;
  const isOverflow = maxLines && code.split("\n").length > maxLines;

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <CodeBlockHeader language={language} title={title} copied={copied} onCopy={handleCopy} />
      {html ? (
        <div
          className="overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:!m-0 [&_pre]:!bg-transparent [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto bg-background p-4">
          <code className="text-sm font-mono leading-relaxed text-foreground">
            {truncated}{isOverflow && <span className="text-muted-foreground">...</span>}
          </code>
        </pre>
      )}
    </div>
  );
}
