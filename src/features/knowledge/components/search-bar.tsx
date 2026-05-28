"use client";

import { useState, useCallback } from "react";
import { Search, File, Loader2 } from "lucide-react";
import { cn } from "@stsgs/ui";

interface SearchResult {
  docId: string;
  score: number;
  title: string;
  fileType: string;
  collectionId: string;
  snippet: string;
}

interface Props {
  collectionId?: string | null;
  onSelect?: (docId: string) => void;
}

const FILE_COLORS: Record<string, string> = {
  txt: "text-blue-500", md: "text-purple-500", pdf: "text-red-500", docx: "text-blue-600",
};

export function SearchBar({ collectionId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const body: Record<string, unknown> = { query: q, topK: 5 };
      if (collectionId) body.collectionId = collectionId;
      const res = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results ?? []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [collectionId]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {loading && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
        <button
          onClick={() => doSearch(query)}
          disabled={loading || !query.trim()}
          className="px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
        >
          Search
        </button>
      </div>

      {results.length > 0 && (
        <div className="rounded-lg border divide-y">
          {results.map((r) => (
            <button
              key={r.docId}
              onClick={() => onSelect?.(r.docId)}
              className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <File className={cn("h-3.5 w-3.5 shrink-0", FILE_COLORS[r.fileType] ?? "text-muted-foreground")} />
                <span className="text-sm font-medium truncate">{r.title}</span>
                <span className="ml-auto text-[10px] text-primary font-mono">{r.score.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{r.snippet}</p>
            </button>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <p className="text-xs text-muted-foreground">No results found.</p>
      )}
    </div>
  );
}
