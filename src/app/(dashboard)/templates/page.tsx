"use client";

import { useMemo, useCallback, useState } from "react";
import { Layers, Grid2x2, Rows3, Workflow } from "lucide-react";
import { cn } from "@stsgs/ui";
import { useRouter } from "next/navigation";
import { usePromptLibraryStore } from "@/features/prompt-library/store/prompt-library-store";
import { PromptCard } from "@/features/prompt-library/components/prompt-card";
import { PromptListItem } from "@/features/prompt-library/components/prompt-list-item";
import { LibraryFilters } from "@/features/prompt-library/components/library-filters";
import { PROMPT_LIBRARY } from "@/features/prompt-library/data/prompt-library";
import { FLOW_TEMPLATES, FLOW_CATEGORIES } from "@/features/pipelines/data/flow-templates";
import { FlowTemplateCard } from "@/features/pipelines/components/flow-template-card";
import type { FlowTemplate } from "@/features/pipelines/data/flow-templates";
import { useLanguage } from "@/lib/i18n/language-context";

type Tab = "prompts" | "flows";

export default function TemplateGalleryPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("prompts");
  const { t } = useLanguage();

  // Prompt library state
  const search = usePromptLibraryStore((s) => s.search);
  const categoryFilter = usePromptLibraryStore((s) => s.categoryFilter);
  const favorites = usePromptLibraryStore((s) => s.favorites);
  const viewMode = usePromptLibraryStore((s) => s.viewMode);
  const setViewMode = usePromptLibraryStore((s) => s.setViewMode);

  const filteredPrompts = useMemo(() => {
    let list = PROMPT_LIBRARY;
    if (categoryFilter === "favorites") {
      list = list.filter((p) => favorites.has(p.id));
    } else if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [search, categoryFilter, favorites]);

  // Flow templates state
  const [flowCategory, setFlowCategory] = useState<string | null>(null);
  const filteredFlows = useMemo(() => {
    if (!flowCategory) return FLOW_TEMPLATES;
    return FLOW_TEMPLATES.filter((ft) => ft.category === flowCategory);
  }, [flowCategory]);

  const cloneFlow = useCallback(async (template: FlowTemplate) => {
    try {
      const res = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} ${t.pages['(from template)']}`,
          description: template.description,
          nodes: template.nodes,
          edges: template.edges,
        }),
      });
      if (!res.ok) throw new Error();
      const flow = await res.json();
      router.push(`/editor?id=${flow.id}`);
    } catch { /* silent */ }
  }, [router, t]);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Layers className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">{t.nav['Templates']}</h1>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 w-fit">
        <button onClick={() => setTab("prompts")} className={cn("px-3 py-1.5 text-sm rounded-md transition-colors", tab === "prompts" ? "bg-card shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}>
          {t.pages['Prompt Templates']} ({filteredPrompts.length})
        </button>
        <button onClick={() => setTab("flows")} className={cn("px-3 py-1.5 text-sm rounded-md transition-colors", tab === "flows" ? "bg-card shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}>
          {t.pages['Flow Templates']} ({filteredFlows.length})
        </button>
      </div>

      {/* Prompt tab */}
      {tab === "prompts" && (
        <>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md transition-colors", viewMode === "grid" ? "bg-brand-accent text-white" : "text-muted-foreground hover:text-foreground")} title={t.pages['Grid']}>
              <Grid2x2 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-brand-accent text-white" : "text-muted-foreground hover:text-foreground")} title={t.pages['List']}>
              <Rows3 className="h-4 w-4" />
            </button>
          </div>
          <LibraryFilters />
          {filteredPrompts.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 shadow-sm flex flex-col items-center gap-2">
              <p className="text-muted-foreground text-sm">{search ? t.pages['No prompts match your search.'] : t.pages['No favorites yet.']}</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPrompts.map((p) => <PromptCard key={p.id} prompt={p} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredPrompts.map((p) => <PromptListItem key={p.id} prompt={p} />)}
            </div>
          )}
        </>
      )}

      {/* Flow tab */}
      {tab === "flows" && (
        <>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Workflow className="h-4 w-4 text-muted-foreground" />
            <button onClick={() => setFlowCategory(null)} className={cn("text-xs px-2 py-1 rounded-full transition-colors", !flowCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{t.pages['All']}</button>
            {FLOW_CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setFlowCategory(c.id)} className={cn("text-xs px-2 py-1 rounded-full transition-colors", flowCategory === c.id ? c.color : "bg-muted text-muted-foreground hover:text-foreground")}>
                {c.label}
              </button>
            ))}
          </div>
          {filteredFlows.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 shadow-sm flex flex-col items-center gap-2">
              <p className="text-muted-foreground text-sm">{t.pages['No flow templates in this category.']}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFlows.map((ft) => <FlowTemplateCard key={ft.id} template={ft} onClone={cloneFlow} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
