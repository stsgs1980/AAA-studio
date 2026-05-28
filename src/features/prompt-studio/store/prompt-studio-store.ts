import { create } from "zustand";
import type { ComparisonResult } from "@stsgs/prompting";

export type StudioTab = "write" | "formulas" | "frameworks" | "compare";

interface PromptStudioStore {
  activeTab: StudioTab;
  editorText: string;
  compareA: string;
  compareB: string;
  comparisonResult: ComparisonResult | null;

  setActiveTab: (tab: StudioTab) => void;
  setEditorText: (text: string) => void;
  setCompareA: (text: string) => void;
  setCompareB: (text: string) => void;
  setComparisonResult: (result: ComparisonResult | null) => void;
  insertFormula: (template: string) => void;
  loadToEditor: (text: string) => void;
}

export const usePromptStudioStore = create<PromptStudioStore>((set) => ({
  activeTab: "write",
  editorText: "",
  compareA: "",
  compareB: "",
  comparisonResult: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
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
