"use client";

import { FRAMEWORKS } from "@stsgs/prompting";
import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";
import { FrameworkCard } from "./framework-card";

export function TabFrameworks() {
  const loadToEditor = usePromptStudioStore((s) => s.loadToEditor);

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Select a framework and fill in the sections to generate a structured prompt.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FRAMEWORKS.map((fw) => (
          <FrameworkCard
            key={fw.id}
            framework={fw}
            onGenerate={loadToEditor}
          />
        ))}
      </div>
    </div>
  );
}
