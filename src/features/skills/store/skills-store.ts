import { create } from "zustand";
import { fetchFilesImpl, createFileImpl, updateFileImpl, deleteFileImpl } from "./file-ops";
import { validateCodeImpl } from "./validate-ops";
import { createSkillImpl, deleteSkillImpl, saveSkillImpl } from "./crud-ops";

export interface SkillFileItem {
  id: string; skillId: string; path: string; content: string;
  language: string; role: string; order: number; createdAt: string; updatedAt: string;
}

export interface ValidateResult {
  standardId: string; standardName: string; ruleId: string; ruleName: string;
  passed: boolean; message: string; match?: string;
}

export interface ValidateSummary {
  totalRules: number; passed: number; failed: number; standardsChecked: number;
}

export interface SkillItem {
  id: string; name: string; slug: string; version: string; skillId: string;
  category: string; description: string; longDescription: string;
  inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown>;
  code: string; tests: string; tags: string[]; triggers: string[];
  standardIds: string[]; compatibility: string;
  dependencies: { skillId: string; version: string }[];
  annotations: Record<string, boolean>;
  author: string; license: string;
  createdAt: string; updatedAt: string;
}

type Tab = "info" | "code" | "tests" | "files" | "standards" | "validate";

interface SkillStore {
  skills: SkillItem[]; selected: SkillItem | null; tab: Tab; loading: boolean;
  showNew: boolean; newName: string; files: SkillFileItem[];
  selectedFile: SkillFileItem | null; filesLoading: boolean;
  validateResults: ValidateResult[]; validateSummary: ValidateSummary | null; validateLoading: boolean;
  setSkills: (s: SkillItem[]) => void; setSelected: (s: SkillItem | null) => void;
  setTab: (t: Tab) => void; setLoading: (l: boolean) => void;
  setShowNew: (v: boolean) => void; setNewName: (n: string) => void;
  updateSelected: (patch: Partial<SkillItem>) => void;
  fetchSkills: () => Promise<void>; createSkill: (name: string, opts?: Record<string, unknown>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>; saveSkill: () => Promise<void>;
  addStandardId: (sid: string) => void; removeStandardId: (sid: string) => void;
  fetchFiles: (skillId: string) => Promise<void>; selectFile: (file: SkillFileItem | null) => void;
  createFile: (path: string) => Promise<void>; updateFile: (fileId: string, patch: Partial<SkillFileItem>) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>; saveFileContent: () => Promise<void>;
  validateCode: (skillId: string) => Promise<void>;
}

export const useSkillStore = create<SkillStore>((set, get) => ({
  skills: [], selected: null, tab: "info", loading: true,
  showNew: false, newName: "", files: [], selectedFile: null, filesLoading: false,
  validateResults: [], validateSummary: null, validateLoading: false,

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

  createSkill: (name, opts) => createSkillImpl(name, opts, get, set),
  deleteSkill: (id) => deleteSkillImpl(id, get, set),
  saveSkill: () => saveSkillImpl(get),

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
  validateCode: (skillId) => validateCodeImpl(skillId, get, set),
}));
