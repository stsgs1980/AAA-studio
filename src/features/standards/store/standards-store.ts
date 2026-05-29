import { create } from "zustand";
import type { Standard, StandardSeverity } from "../types";
import { generateRuleId } from "../types";

interface StandardsStore {
  standards: Standard[];
  selectedId: string | null;
  loading: boolean;
  search: string;
  severityFilter: StandardSeverity | "all";

  setSearch: (q: string) => void;
  setSeverityFilter: (s: StandardSeverity | "all") => void;
  selectStandard: (id: string | null) => void;
  setLoading: (v: boolean) => void;
  setStandards: (list: Standard[]) => void;
  addStandard: (s: Standard) => void;
  updateStandard: (id: string, patch: Partial<Standard>) => void;
  removeStandard: (id: string) => void;
  toggleRule: (ruleId: string) => void;
  addRule: (description: string) => void;
  removeRule: (ruleId: string) => void;
}

export const useStandardsStore = create<StandardsStore>((set, get) => ({
  standards: [],
  selectedId: null,
  loading: true,
  search: "",
  severityFilter: "all",

  setSearch: (q) => set({ search: q }),
  setSeverityFilter: (s) => set({ severityFilter: s }),
  selectStandard: (id) => set({ selectedId: id }),
  setLoading: (v) => set({ loading: v }),

  setStandards: (list) => set({ standards: list, loading: false }),
  addStandard: (s) => set((st) => ({ standards: [s, ...st.standards] })),
  updateStandard: (id, patch) =>
    set((st) => ({
      standards: st.standards.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),
  removeStandard: (id) =>
    set((st) => ({
      standards: st.standards.filter((s) => s.id !== id),
      selectedId: st.selectedId === id ? null : st.selectedId,
    })),

  toggleRule: (ruleId) =>
    set((st) => ({
      standards: st.standards.map((s) =>
        s.id === st.selectedId
          ? { ...s, rules: s.rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)) }
          : s,
      ),
    })),

  addRule: (description) =>
    set((st) => ({
      standards: st.standards.map((s) =>
        s.id === st.selectedId
          ? { ...s, rules: [...s.rules, { id: generateRuleId(), name: description.slice(0, 40), description, enabled: true }] }
          : s,
      ),
    })),

  removeRule: (ruleId) =>
    set((st) => ({
      standards: st.standards.map((s) =>
        s.id === st.selectedId
          ? { ...s, rules: s.rules.filter((r) => r.id !== ruleId) }
          : s,
      ),
    })),
}));
