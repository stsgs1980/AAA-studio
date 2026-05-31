// Skill CRUD operations -- extracted from skills-store.ts for anti-monolith compliance

import type { SkillItem } from "./skills-store";

interface CrudStoreShape {
  selected: SkillItem | null;
  newName: string;
  showNew: boolean;
}
type CrudSetFn = (partial: Partial<CrudStoreShape> | ((s: CrudStoreShape) => Partial<CrudStoreShape>)) => void;
interface CrudGetShape { fetchSkills: () => Promise<void>; selected: SkillItem | null; }
type CrudGetFn = () => CrudGetShape;

export async function createSkillImpl(
  name: string, standardIds: string[] | undefined, get: CrudGetFn, set: CrudSetFn,
) {
  try {
    const res = await fetch("/api/skills", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: "", standardIds: standardIds ?? [] }),
    });
    if (!res.ok) throw new Error();
    set({ newName: "", showNew: false });
    get().fetchSkills();
  } catch { /* silent */ }
}

export async function deleteSkillImpl(
  id: string, get: CrudGetFn, set: CrudSetFn,
) {
  if (!confirm("Delete this skill?")) return;
  try {
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (res.status === 409) { const d = await res.json(); alert(d.error); return; }
    if (!res.ok) throw new Error();
    if (get().selected?.id === id) set({ selected: null });
    get().fetchSkills();
  } catch { /* silent */ }
}

export async function saveSkillImpl(get: () => { selected: SkillItem | null; fetchSkills: () => Promise<void> }) {
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
}
