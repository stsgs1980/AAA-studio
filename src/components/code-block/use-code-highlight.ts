import { useEffect, useState } from "react";
import type { Highlighter } from "shiki";

/**
 * Custom hook: loads Shiki WASM highlighter on mount,
 * returns highlighted HTML or null on failure.
 * Uses module-level cache to avoid re-loading Shiki WASM.
 */
let cachedHighlighter: Highlighter | null = null;

export function useCodeHighlight(
  code: string,
  language: string,
  langs: readonly string[],
): string | null {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const highlight = async () => {
      try {
        if (!cachedHighlighter) {
          const m = await import("shiki");
          cachedHighlighter = await m.createHighlighter({
            themes: ["github-dark"],
            langs: [...langs],
          });
        }

        if (cancelled) return;

        const lang = cachedHighlighter.getLoadedLanguages().includes(language)
          ? language
          : "text";

        setHtml(
          cachedHighlighter.codeToHtml(code, { lang, theme: "github-dark" }),
        );
      } catch {
        setHtml(null);
      }
    };

    highlight();
    return () => { cancelled = true; };
  }, [code, language, langs]);

  return html;
}
