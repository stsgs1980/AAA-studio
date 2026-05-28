"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

interface WikiCodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function WikiCodeBlock({ code, language, title }: WikiCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("shiki")
      .then(async (m) => {
        const hl = await m.createHighlighter({
          themes: ["github-dark"],
          langs: ["json", "bash", "typescript", "javascript", "yaml", "text"],
        });
        if (cancelled) return;
        const lang = language && hl.getLoadedLanguages().includes(language) ? language : "text";
        const result = hl.codeToHtml(code, {
          lang,
          theme: "github-dark",
        });
        setHtml(result);
      })
      .catch(() => setHtml(null));
    return () => { cancelled = true; };
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-midnight-border overflow-hidden">
      {(title || language) && (
        <div className="flex items-center justify-between border-b border-midnight-border px-4 py-2 bg-midnight-card">
          <div className="flex items-center gap-2">
            {language && (
              <span className="rounded bg-midnight-elevated px-2 py-0.5 text-[11px] font-medium text-brand-accent">
                {language}
              </span>
            )}
            {title && (
              <span className="text-xs text-text-muted">{title}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="rounded p-1 text-text-muted hover:bg-midnight-elevated hover:text-text-secondary transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-brand-green" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
      {!title && !language && (
        <div className="flex justify-end border-b border-midnight-border px-3 py-1 bg-midnight-card">
          <button onClick={handleCopy} className="rounded p-1 text-text-muted hover:bg-midnight-elevated hover:text-text-secondary transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-brand-green" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      {html ? (
        <div
          className="overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:!m-0 [&_pre]:!bg-transparent [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto bg-midnight-base p-4">
          <code className="text-sm font-mono leading-relaxed text-text-primary">{code}</code>
        </pre>
      )}
    </div>
  );
}
