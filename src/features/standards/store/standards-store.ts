import { create } from "zustand";
import type { Standard, StandardSeverity, StandardRule } from "@stsgs/shared";
import { generateRuleId } from "@stsgs/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EditForm = { name: string; category: string; description: string; severity: string };

interface StandardsStore {
  standards: Standard[];
  selectedId: string | null;
  loading: boolean;
  search: string;
  severityFilter: StandardSeverity | "all";
  editForm: EditForm | null;
  newRule: string;
  setSearch: (q: string) => void;
  setSeverityFilter: (s: StandardSeverity | "all") => void;
  selectStandard: (id: string | null) => void;
  fetchStandards: () => Promise<void>;
  createStandard: (name: string, severity: string) => Promise<void>;
  saveStandard: () => Promise<void>;
  deleteStandard: (id: string) => Promise<void>;
  startEdit: () => void;
  cancelEdit: () => void;
  patchEditForm: (patch: Partial<EditForm>) => void;
  setNewRule: (v: string) => void;
  addRule: () => Promise<void>;
  toggleRule: (ruleId: string) => Promise<void>;
  removeRule: (ruleId: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSelected(state: StandardsStore): Standard | undefined {
  return state.standards.find((s) => s.id === state.selectedId);
}

function syncRules(
  get: () => StandardsStore,
  set: (fn: (s: StandardsStore) => Partial<StandardsStore>) => void,
  mapper: (rules: StandardRule[]) => StandardRule[],
  extras?: Partial<StandardsStore>,
): Promise<void> {
  const std = getSelected(get());
  if (!std) return Promise.resolve();
  const rules = mapper(std.rules ?? []);
  return fetch(`/api/standards/${std.id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rules }),
  })
    .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
    .then(() => set((st) => ({ standards: st.standards.map((s) => (s.id === std.id ? { ...s, rules } : s)), ...extras })))
    .catch(() => { /* silent */ });
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useStandardsStore = create<StandardsStore>((set, get) => ({
  standards: [], selectedId: null, loading: true,
  search: "", severityFilter: "all", editForm: null, newRule: "",

  setSearch: (q) => set({ search: q }),
  setSeverityFilter: (s) => set({ severityFilter: s }),
  selectStandard: (id) => set({ selectedId: id, editForm: null, newRule: "" }),

  fetchStandards: async () => {
    try {
      set({ loading: true });
      const res = await fetch("/api/standards");
      if (!res.ok) throw new Error();
      set({ standards: await res.json(), loading: false });
    } catch { set({ loading: false }); }
  },

  createStandard: async (name, severity) => {
    try {
      const res = await fetch("/api/standards", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, severity }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      set((st) => ({ standards: [created, ...st.standards], selectedId: created.id }));
    } catch { /* silent */ }
  },

  saveStandard: async () => {
    const { editForm, selectedId } = get();
    if (!editForm || !selectedId) return;
    try {
      const res = await fetch(`/api/standards/${selectedId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, category: editForm.category, description: editForm.description, severity: editForm.severity }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      set((st) => ({ standards: st.standards.map((s) => (s.id === selectedId ? updated : s)), editForm: null }));
    } catch { /* silent */ }
  },

  deleteStandard: async (id) => {
    if (!confirm("Delete this standard?")) return;
    try {
      const res = await fetch(`/api/standards/${id}`, { method: "DELETE" });
      if (res.status === 409) {
        const d = await res.json();
        alert(d.error + "\n" + d.referencedBy.map((r: { name: string }) => "  - " + r.name).join("\n"));
        return;
      }
      if (!res.ok) throw new Error();
      set((st) => ({ standards: st.standards.filter((s) => s.id !== id), selectedId: st.selectedId === id ? null : st.selectedId }));
    } catch { /* silent */ }
  },

  startEdit: () => {
    const std = getSelected(get());
    if (!std) return;
    set({ editForm: { name: std.name, category: std.category, description: std.description, severity: std.severity } });
  },
  cancelEdit: () => set({ editForm: null }),
  patchEditForm: (patch) => {
    const form = get().editForm;
    if (form) set({ editForm: { ...form, ...patch } });
  },
  setNewRule: (v) => set({ newRule: v }),

  addRule: () => {
    const desc = get().newRule.trim();
    if (!desc) return Promise.resolve();
    return syncRules(get, set, (rules) => [...rules, { id: generateRuleId(), name: desc.slice(0, 40), description: desc, enabled: true }], { newRule: "" });
  },

  toggleRule: (ruleId) => syncRules(get, set, (rules) => rules.map((r) => r.id === ruleId ? { ...r, enabled: !r.enabled } : r)),

  removeRule: (ruleId) => syncRules(get, set, (rules) => rules.filter((r) => r.id !== ruleId)),
}));
