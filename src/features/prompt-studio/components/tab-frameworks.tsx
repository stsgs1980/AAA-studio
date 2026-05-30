"use client";

import { FRAMEWORKS } from "@stsgs/prompting";
import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";
import { FrameworkCard } from "./framework-card";
import { FrameworkListItem } from "./framework-list-item";

export function TabFrameworks() {
  const loadToEditor = usePromptStudioStore((s) => s.loadToEditor);
  const viewMode = usePromptStudioStore((s) => s.viewMode);
  const isGrid = viewMode === "grid";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select a framework and fill in the sections to generate a structured prompt.
      </p>

      {isGrid ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {FRAMEWORKS.map((fw) => (
            <FrameworkCard
              key={fw.id}
              framework={fw}
              onGenerate={loadToEditor}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {FRAMEWORKS.map((fw) => (
            <FrameworkListItem
              key={fw.id}
              framework={fw}
              onGenerate={loadToEditor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
