"use client";

import { wikiNavItems, wikiCategories } from "../data/wiki-nav-data";
import { cn } from "@/lib/utils";

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
  const filteredItems = query
    ? wikiNavItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.keywords.some((k) => k.includes(query))
      )
    : wikiNavItems;

  return (
    <nav className="w-[180px] shrink-0 overflow-y-auto border-r border-border p-3">
      <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Documentation
      </p>
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
