"use client";

import { useMemo } from "react";
import { Layers, Grid2x2, Rows3 } from "lucide-react";
import { cn } from "@stsgs/ui";
import { usePromptLibraryStore } from "@/features/prompt-library/store/prompt-library-store";
import { PromptCard } from "@/features/prompt-library/components/prompt-card";
import { PromptListItem } from "@/features/prompt-library/components/prompt-list-item";
import { LibraryFilters } from "@/features/prompt-library/components/library-filters";
import { PROMPT_LIBRARY } from "@/features/prompt-library/data/prompt-library";

export default function TemplateGalleryPage() {
  const search = usePromptLibraryStore((s) => s.search);
  const categoryFilter = usePromptLibraryStore((s) => s.categoryFilter);
  const favorites = usePromptLibraryStore((s) => s.favorites);
  const viewMode = usePromptLibraryStore((s) => s.viewMode);
  const setViewMode = usePromptLibraryStore((s) => s.setViewMode);

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
        <div className="ml-auto flex items-center gap-1 bg-midnight-elevated rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-brand-accent text-white"
                : "text-text-muted hover:text-text-secondary",
            )}
            title="Grid view"
          >
            <Grid2x2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-brand-accent text-white"
                : "text-text-muted hover:text-text-secondary",
            )}
            title="List view"
          >
            <Rows3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <LibraryFilters />

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 shadow-sm flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-sm">
            {search ? "No prompts match your search." : "No favorites yet."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((p) => (
            <PromptListItem key={p.id} prompt={p} />
          ))}
        </div>
      )}
    </div>
  );
}
