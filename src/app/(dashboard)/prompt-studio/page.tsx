"use client";

import { cn } from "@stsgs/ui";
import { Sparkles, PenLine, Braces, LayoutGrid, GitCompareArrows } from "lucide-react";
import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";
import type { StudioTab } from "@/features/prompt-studio/store/prompt-studio-store";
import { TabWrite } from "@/features/prompt-studio/components/tab-write";
import { TabFormulas } from "@/features/prompt-studio/components/tab-formulas";
import { TabFrameworks } from "@/features/prompt-studio/components/tab-frameworks";
import { TabCompare } from "@/features/prompt-studio/components/tab-compare";

const TABS: { id: StudioTab; label: string; icon: typeof PenLine }[] = [
  { id: "write", label: "Write", icon: PenLine },
  { id: "formulas", label: "Formulas", icon: Braces },
  { id: "frameworks", label: "Frameworks", icon: LayoutGrid },
  { id: "compare", label: "Compare", icon: GitCompareArrows },
];

const TAB_COMPONENTS: Record<StudioTab, React.ComponentType> = {
  write: TabWrite,
  formulas: TabFormulas,
  frameworks: TabFrameworks,
  compare: TabCompare,
};

export default function PromptStudioPage() {
  const activeTab = usePromptStudioStore((s) => s.activeTab);
  const setActiveTab = usePromptStudioStore((s) => s.setActiveTab);

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-2">
        <Sparkles className="h-6 w-6 text-brand-accent" />
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Prompt Studio
        </h1>
      </div>

      {/* Tab bar */}
      <div className="px-6 border-b border-midnight-border">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === id
                  ? "text-brand-accent border-brand-accent"
                  : "text-text-muted hover:text-text-secondary border-transparent",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
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
