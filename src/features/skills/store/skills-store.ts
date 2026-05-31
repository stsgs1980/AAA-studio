import { create } from "zustand";
import { fetchFilesImpl, createFileImpl, updateFileImpl, deleteFileImpl } from "./file-ops";

export interface SkillFileItem {
  id: string;
  skillId: string;
  path: string;
  content: string;
  language: string;
  role: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

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

type Tab = "info" | "code" | "tests" | "files" | "standards";

interface SkillStore {
  skills: SkillItem[];
  selected: SkillItem | null;
  tab: Tab;
  loading: boolean;
  showNew: boolean;
  newName: string;
  files: SkillFileItem[];
  selectedFile: SkillFileItem | null;
  filesLoading: boolean;
  setSkills: (s: SkillItem[]) => void;
  setSelected: (s: SkillItem | null) => void;
  setTab: (t: Tab) => void;
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
  fetchFiles: (skillId: string) => Promise<void>;
  selectFile: (file: SkillFileItem | null) => void;
  createFile: (path: string) => Promise<void>;
  updateFile: (fileId: string, patch: Partial<SkillFileItem>) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  saveFileContent: () => Promise<void>;
}

export const useSkillStore = create<SkillStore>((set, get) => ({
  skills: [], selected: null, tab: "info", loading: true,
  showNew: false, newName: "", files: [], selectedFile: null, filesLoading: false,

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
      set({ skills: data.items ?? data, loading: false });
    } catch { set({ loading: false }); }
  },

  createSkill: async (name, standardIds) => {
    try {
      const res = await fetch("/api/skills", {
        method: "POST", headers: { "Content-Type": "application/json" },
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
      if (res.status === 409) { const d = await res.json(); alert(d.error); return; }
      if (!res.ok) throw new Error();
      if (get().selected?.id === id) set({ selected: null, files: [], selectedFile: null });
      get().fetchSkills();
    } catch { /* silent */ }
  },

  saveSkill: async () => {
    const sel = get().selected;
    if (!sel) return;
    try {
      const res = await fetch(`/api/skills/${sel.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sel.code, tests: sel.tests, standardIds: sel.standardIds }),
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

  fetchFiles: (skillId) => fetchFilesImpl(skillId, set, get),
  selectFile: (file) => set({ selectedFile: file }),
  createFile: (path) => createFileImpl(path, get, set),
  updateFile: (fileId, patch) => updateFileImpl(fileId, patch, get, set),
  deleteFile: (fileId) => deleteFileImpl(fileId, get, set),
  saveFileContent: async () => {
    const { selectedFile, selected } = get();
    if (!selectedFile || !selected) return;
    await get().updateFile(selectedFile.id, { content: selectedFile.content });
  },
}));
