import { create } from "zustand";

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  code: string;
  tests: string;
  tags: string[];
  standardIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface SkillStore {
  skills: SkillItem[];
  selected: SkillItem | null;
  tab: "info" | "code" | "tests" | "standards";
  loading: boolean;
  showNew: boolean;
  newName: string;
  setSkills: (s: SkillItem[]) => void;
  setSelected: (s: SkillItem | null) => void;
  setTab: (t: 'info' | 'code' | 'tests' | 'standards') => void;
  setLoading: (l: boolean) => void;
  setShowNew: (v: boolean) => void;
  setNewName: (n: string) => void;
  updateSelected: (patch: Partial<SkillItem>) => void;
  fetchSkills: () => Promise<void>;
  createSkill: (name: string, standardIds?: string[]) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  saveSkill: () => Promise<void>;
  addStandardId: (sid: string) => void;
  removeStandardId: (sid: string) => void;
}

export const useSkillStore = create<SkillStore>((set, get) => ({
  skills: [],
  selected: null,
  tab: "info",
  loading: true,
  showNew: false,
  newName: "",

  setSkills: (s) => set({ skills: s }),
  setSelected: (s) => set({ selected: s }),
  setTab: (t) => set({ tab: t }),
  setLoading: (l) => set({ loading: l }),
  setShowNew: (v) => set({ showNew: v }),
  setNewName: (n) => set({ newName: n }),

  updateSelected: (patch) => {
    const sel = get().selected;
    if (sel) set({ selected: { ...sel, ...patch } });
  },

  fetchSkills: async () => {
    try {
      set({ loading: true });
      const res = await fetch("/api/skills");
      if (!res.ok) throw new Error();
      const data = await res.json();
      set({ skills: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createSkill: async (name, standardIds) => {
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: "", standardIds: standardIds ?? [] }),
      });
      if (!res.ok) throw new Error();
      set({ newName: "", showNew: false });
      get().fetchSkills();
    } catch { /* silent */ }
  },

  deleteSkill: async (id) => {
    if (!confirm("Delete this skill?")) return;
    try {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      if (res.status === 409) {
        const d = await res.json();
        alert(d.error + "\n" + d.referencedBy.map((r: { name: string }) => "  - " + r.name).join("\n"));
        return;
      }
      if (!res.ok) throw new Error();
      if (get().selected?.id === id) set({ selected: null });
      get().fetchSkills();
    } catch { /* silent */ }
  },

  saveSkill: async () => {
    const sel = get().selected;
    if (!sel) return;
    try {
      const res = await fetch(`/api/skills/${sel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: sel.code,
          tests: sel.tests,
          standardIds: sel.standardIds,
        }),
      });
      if (!res.ok) throw new Error();
      get().fetchSkills();
    } catch { /* silent */ }
  },

  addStandardId: (sid) => {
    const sel = get().selected;
    if (!sel || sel.standardIds.includes(sid)) return;
    get().updateSelected({ standardIds: [...sel.standardIds, sid] });
  },

  removeStandardId: (sid) => {
    const sel = get().selected;
    if (!sel) return;
    get().updateSelected({ standardIds: sel.standardIds.filter((id) => id !== sid) });
  },
}));
