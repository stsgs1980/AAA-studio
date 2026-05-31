"use client";

import { cn } from "@stsgs/ui";
import {
  Sparkles, PenLine, Braces, LayoutGrid, GitCompareArrows,
  Rows3, Grid2x2,
} from "lucide-react";
import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";
import type { StudioTab } from "@/features/prompt-studio/store/prompt-studio-store";
import { TabWrite } from "@/features/prompt-studio/components/tab-write";
import { TabFormulas } from "@/features/prompt-studio/components/tab-formulas";
import { TabFrameworks } from "@/features/prompt-studio/components/tab-frameworks";
import { TabCompare } from "@/features/prompt-studio/components/tab-compare";
import { useLanguage } from "@/lib/i18n/language-context";

const TAB_DEFS: { id: StudioTab; icon: typeof PenLine }[] = [
  { id: "write", icon: PenLine },
  { id: "formulas", icon: Braces },
  { id: "frameworks", icon: LayoutGrid },
  { id: "compare", icon: GitCompareArrows },
];

const TAB_COMPONENTS: Record<StudioTab, React.ComponentType> = {
  write: TabWrite,
  formulas: TabFormulas,
  frameworks: TabFrameworks,
  compare: TabCompare,
};

/** Tabs that show grid/list toggle */
const GRID_TABS = new Set<StudioTab>(["formulas", "frameworks"]);

export default function PromptStudioPage() {
  const activeTab = usePromptStudioStore((s) => s.activeTab);
  const setActiveTab = usePromptStudioStore((s) => s.setActiveTab);
  const viewMode = usePromptStudioStore((s) => s.viewMode);
  const setViewMode = usePromptStudioStore((s) => s.setViewMode);
  const { t } = useLanguage();

  const tabLabels: Record<StudioTab, string> = {
    write: t.pages['Write'],
    formulas: t.pages['Formulas'],
    frameworks: t.pages['Frameworks'],
    compare: t.pages['Compare'],
  };

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-2">
        <Sparkles className="h-6 w-6 text-brand-accent" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t.pages['Prompt Studio']}
        </h1>
        {GRID_TABS.has(activeTab) && (
          <div className="ml-auto flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "grid"
                  ? "bg-brand-accent text-white"
                  : "text-muted-foreground hover:text-muted-foreground",
              )}
              title={t.pages['Grid view']}
            >
              <Grid2x2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-brand-accent text-white"
                  : "text-muted-foreground hover:text-muted-foreground",
              )}
              title={t.pages['List view']}
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="px-6 border-b border-border">
        <nav className="flex gap-1 -mb-px">
          {TAB_DEFS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === id
                  ? "text-brand-accent border-brand-accent"
                  : "text-muted-foreground hover:text-muted-foreground border-transparent",
              )}
            >
              <Icon className="h-4 w-4" />
              {tabLabels[id]}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        <ActiveComponent />
      </div>
    </div>
  );
}
