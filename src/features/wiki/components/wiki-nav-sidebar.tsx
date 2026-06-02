"use client";

import { wikiNavItems, wikiCategories } from "../data/wiki-nav-data";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { useState } from "react";

interface WikiNavSidebarProps {
  activePage: string;
  onPageSelect: (id: string) => void;
  searchQuery?: string;
}

export function WikiNavSidebar({
  activePage,
  onPageSelect,
  searchQuery = "",
}: WikiNavSidebarProps) {
  const query = searchQuery.toLowerCase();
  const [exporting, setExporting] = useState(false);

  const filteredItems = query
    ? wikiNavItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.keywords.some((k) => k.includes(query))
      )
    : wikiNavItems;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/wiki/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      // Generate a single markdown file with all pages
      const allContent = Object.entries(data.pages as Record<string, string>)
        .map(([name, content]) => `<!-- ${name} -->\n${content}`)
        .join('\n\n---\n\n');
      const blob = new Blob([allContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wiki-export.md';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Wiki export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <nav className="w-56 shrink-0 overflow-y-auto border-r border-border p-3">
      <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Documentation
      </p>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="mb-3 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Download className="h-3 w-3" />
        {exporting ? 'Exporting...' : 'Export GitHub Wiki'}
      </button>
      <div className="space-y-4">
        {wikiCategories.map((cat) => {
          const items = filteredItems.filter((i) => i.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {cat}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onPageSelect(item.id)}
                      className={cn(
                        "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        activePage === item.id
                          ? "bg-brand-accent/10 font-medium text-brand-accent"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
