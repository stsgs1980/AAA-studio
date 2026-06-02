// Validate skill code against linked standards patterns

import type { SkillFileItem, SkillItem, ValidateResult, ValidateSummary } from "./skills-store";

interface ValidateStoreShape {
  selected: SkillItem | null;
  files: SkillFileItem[];
  validateResults: ValidateResult[];
  validateSummary: ValidateSummary | null;
  validateLoading: boolean;
}
type ValidateSetFn = (partial: Partial<ValidateStoreShape>) => void;
type ValidateGetFn = () => ValidateStoreShape;

export async function validateCodeImpl(
  _skillId: string,
  get: ValidateGetFn,
  set: ValidateSetFn,
) {
  const sel = get().selected;
  if (!sel) return;
  try {
    set({ validateLoading: true, validateResults: [], validateSummary: null });
    // Gather code from legacy fields + file contents
    const files = get().files;
    const codeParts: string[] = [];
    if (sel.code) codeParts.push(sel.code);
    for (const f of files) {
      if (f.role === "code" || f.role === "entry") codeParts.push(f.content);
    }
    const code = codeParts.join("\n\n");
    if (!code.trim()) {
      set({
        validateLoading: false,
        validateSummary: { totalRules: 0, passed: 0, failed: 0, standardsChecked: 0 },
      });
      return;
    }
    const body: Record<string, unknown> = { code };
    if (sel.standardIds.length > 0) body.standardIds = sel.standardIds;
    const res = await fetch("/api/standards/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    set({
      validateResults: data.results ?? [],
      validateSummary: data.summary ?? null,
      validateLoading: false,
    });
  } catch {
    set({ validateLoading: false });
  }
}
