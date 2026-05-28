"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { wikiNavItems } from "../data/wiki-nav-data";
import { cn } from "@/lib/utils";

interface WikiSearchProps {
  value: string;
  onChange: (value: string) => void;
  onResultSelect?: (id: string) => void;
}

export function WikiSearch({ value, onChange, onResultSelect }: WikiSearchProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = value.toLowerCase().trim();

  const results = query
    ? wikiNavItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.keywords.some((k) => k.includes(query))
      )
    : [];

  useEffect(() => {
    setActiveIndex(0);
    setOpen(results.length > 0);
  }, [query, results.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      onResultSelect?.(results[activeIndex].id);
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search docs..."
          className="h-8 w-full rounded-md border border-midnight-border bg-midnight-base pl-8 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/30"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full z-10 mt-1 w-full rounded-md border border-midnight-border bg-midnight-card py-1 shadow-lg">
          {results.map((item, i) => (
            <button
              key={item.id}
              onMouseDown={() => {
                onResultSelect?.(item.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                i === activeIndex
                  ? "bg-brand-accent/10 text-brand-accent"
                  : "text-text-secondary hover:bg-midnight-elevated"
              )}
            >
              <span>{item.title}</span>
              <span className="ml-auto text-[11px] text-text-muted">
                {item.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
