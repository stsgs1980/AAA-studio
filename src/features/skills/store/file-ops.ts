import type { SkillFileItem, SkillItem } from "./skills-store";

/** Minimal store shape needed by file operations */
interface StoreShape {
  selected: SkillItem | null;
  files: SkillFileItem[];
  selectedFile: SkillFileItem | null;
}
type SetFn = (partial: Partial<StoreShape> | ((s: StoreShape) => Partial<StoreShape>)) => void;
type GetFn = () => StoreShape;

export async function fetchFilesImpl(
  skillId: string, set: SetFn, _get: GetFn,
) {
  try {
    set({ filesLoading: true, selectedFile: null } as Partial<StoreShape>);
    const res = await fetch(`/api/skills/${skillId}/files`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    set({ files: data, filesLoading: false } as Partial<StoreShape>);
  } catch {
    set({ filesLoading: false } as Partial<StoreShape>);
  }
}

export async function createFileImpl(
  path: string, get: GetFn, set: SetFn,
) {
  const sel = get().selected;
  if (!sel) return;
  try {
    const res = await fetch(`/api/skills/${sel.id}/files`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) throw new Error();
    const file = await res.json();
    set({ files: [...get().files, file], selectedFile: file });
  } catch { /* silent */ }
}

export async function updateFileImpl(
  fileId: string, patch: Partial<SkillFileItem>, get: GetFn, set: SetFn,
) {
  const sel = get().selected;
  if (!sel) return;
  try {
    const res = await fetch(`/api/skills/${sel.id}/files/${fileId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error();
    const updated = await res.json();
    set({
      files: get().files.map((f) => (f.id === fileId ? { ...f, ...updated } : f)),
      selectedFile: get().selectedFile?.id === fileId
        ? { ...get().selectedFile, ...updated }
        : get().selectedFile,
    });
  } catch { /* silent */ }
}

export async function deleteFileImpl(
  fileId: string, get: GetFn, set: SetFn,
) {
  const sel = get().selected;
  if (!sel) return;
  try {
    const res = await fetch(`/api/skills/${sel.id}/files/${fileId}`, { method: "DELETE" });
    if (!res.ok) throw new Error();
    set({
      files: get().files.filter((f) => f.id !== fileId),
      selectedFile: get().selectedFile?.id === fileId ? null : get().selectedFile,
    });
  } catch { /* silent */ }
}
