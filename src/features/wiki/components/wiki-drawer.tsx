"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { useWikiStore } from "../store/wiki-store";
import { WikiNavSidebar } from "./wiki-nav-sidebar";
import { WikiContent } from "./wiki-content";
import { WikiSearch } from "./wiki-search";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export function WikiDrawer() {
  const { isOpen, close, activePage, searchQuery, setSearch, setPage } =
    useWikiStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={close}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col border-l border-midnight-border bg-midnight-card"
          >
            {/* Header */}
            <div className="flex h-14 items-center gap-3 border-b border-midnight-border px-4">
              <span className="text-sm font-semibold text-text-primary">
                Wiki
              </span>
              <div className="flex-1">
                <WikiSearch
                  value={searchQuery}
                  onChange={setSearch}
                  onResultSelect={(id) => {
                    setPage(id);
                    setSearch("");
                  }}
                />
              </div>
              <button
                onClick={close}
                className="rounded p-1 text-text-muted hover:bg-midnight-elevated hover:text-text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1">
              <WikiNavSidebar
                activePage={activePage}
                onPageSelect={(id) => {
                  setPage(id);
                  setSearch("");
                }}
                searchQuery={searchQuery}
              />
              <div className="min-w-0 flex-1 overflow-y-auto">
                <Suspense fallback={<PageSkeleton rows={6} />}>
                  <WikiContent slug={activePage} />
                </Suspense>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-midnight-border px-4 py-2">
              <a
                href={`/wiki/${activePage}`}
                onClick={close}
                className="flex items-center gap-1.5 text-xs text-brand-accent hover:text-brand-accent/80 transition-colors"
              >
                Open full Wiki
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
