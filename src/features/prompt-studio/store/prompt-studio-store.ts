import { create } from "zustand";
import type { ComparisonResult } from "@stsgs/prompting";

export type StudioTab = "write" | "formulas" | "frameworks" | "compare";
export type ViewMode = "grid" | "list";

interface PromptStudioStore {
  activeTab: StudioTab;
  viewMode: ViewMode;
  editorText: string;
  compareA: string;
  compareB: string;
  comparisonResult: ComparisonResult | null;

  setActiveTab: (tab: StudioTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setEditorText: (text: string) => void;
  setCompareA: (text: string) => void;
  setCompareB: (text: string) => void;
  setComparisonResult: (result: ComparisonResult | null) => void;
  insertFormula: (template: string) => void;
  loadToEditor: (text: string) => void;
}

export const usePromptStudioStore = create<PromptStudioStore>((set) => ({
  activeTab: "write",
  viewMode: "grid",
  editorText: "",
  compareA: "",
  compareB: "",
  comparisonResult: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setEditorText: (text) => set({ editorText: text }),
  setCompareA: (text) => set({ compareA: text }),
  setCompareB: (text) => set({ compareB: text }),
  setComparisonResult: (result) => set({ comparisonResult: result }),

  insertFormula: (template) =>
    set((s) => ({
      editorText: s.editorText
        ? `${s.editorText}\n\n${template}`
        : template,
      activeTab: "write",
    })),

  loadToEditor: (text) =>
    set({ editorText: text, activeTab: "write" }),
}));
