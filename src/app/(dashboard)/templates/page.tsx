"use client";

import { useMemo } from "react";
import { Layers, Search, Star, X } from "lucide-react";
import { cn } from "@stsgs/ui";
import { usePromptLibraryStore } from "@/features/prompt-library/store/prompt-library-store";
import { PromptCard } from "@/features/prompt-library/components/prompt-card";
import { PROMPT_CATEGORIES } from "@/features/prompt-library/data/prompt-categories";
import { PROMPT_LIBRARY } from "@/features/prompt-library/data/prompt-library";

export default function TemplateGalleryPage() {
  const search = usePromptLibraryStore((s) => s.search);
  const setSearch = usePromptLibraryStore((s) => s.setSearch);
  const categoryFilter = usePromptLibraryStore((s) => s.categoryFilter);
  const setCategoryFilter = usePromptLibraryStore((s) => s.setCategoryFilter);
  const favorites = usePromptLibraryStore((s) => s.favorites);

  const filtered = useMemo(() => {
    let list = PROMPT_LIBRARY;

    if (categoryFilter === "favorites") {
      list = list.filter((p) => favorites.has(p.id));
    } else if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [search, categoryFilter, favorites]);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Layers className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Prompt Library</h1>
        <span className="text-xs text-text-muted bg-midnight-elevated px-2 py-0.5 rounded-full">
          {filtered.length} prompts
        </span>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-midnight-border bg-midnight-base text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-midnight-elevated"
            >
              <X className="h-3.5 w-3.5 text-text-muted" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setCategoryFilter("")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              !categoryFilter
                ? "bg-brand-accent text-white"
                : "bg-midnight-elevated text-text-secondary hover:text-text-primary",
            )}
          >
            All
          </button>
          <button
            onClick={() => setCategoryFilter("favorites")}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              categoryFilter === "favorites"
                ? "bg-brand-amber text-white"
                : "bg-midnight-elevated text-text-secondary hover:text-text-primary",
            )}
          >
            <Star className="h-3 w-3" />
            Favorites
          </button>
          {PROMPT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                categoryFilter === c.id
                  ? "bg-brand-accent text-white"
                  : "bg-midnight-elevated text-text-secondary hover:text-text-primary",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 shadow-sm flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-sm">
            {search ? "No prompts match your search." : "No favorites yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </div>
      )}
    </div>
  );
}
