"use client";

import { cn } from "@stsgs/ui";
import { Search, Star, X } from "lucide-react";
import { usePromptLibraryStore } from "@/features/prompt-library/store/prompt-library-store";
import { PROMPT_CATEGORIES } from "@/features/prompt-library/data/prompt-categories";

export function LibraryFilters() {
  const search = usePromptLibraryStore((s) => s.search);
  const setSearch = usePromptLibraryStore((s) => s.setSearch);
  const categoryFilter = usePromptLibraryStore((s) => s.categoryFilter);
  const setCategoryFilter = usePromptLibraryStore((s) => s.setCategoryFilter);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
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
              : "bg-muted text-muted-foreground hover:text-foreground",
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
              : "bg-muted text-muted-foreground hover:text-foreground",
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
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
