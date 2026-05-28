/** Extract text from upstream inputs for LLM context. */
export function buildInputText(inputs: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const val of Object.values(inputs)) {
    if (typeof val === "string") parts.push(val);
    else if (typeof val === "object" && val !== null) {
      const r = (val as Record<string, unknown>).response;
      if (typeof r === "string") parts.push(r);
    }
  }
  return parts.join("\n") || JSON.stringify(inputs);
}

/** Safely evaluate simple conditions. */
export function safeEvalCondition(expr: string, ctx: Record<string, unknown>): boolean {
  const t = expr.trim().toLowerCase();
  if (t === "true" || t === "1") return true;
  if (t === "false" || t === "0") return false;

  const eq = expr.match(/^(\w+)\s*(===|==)\s*(.+)$/);
  if (eq) return String(ctx[eq[1]] ?? "") === eq[3].trim();

  const has = expr.match(/^(\w+)\s+contains\s+(.+)$/);
  if (has) return String(ctx[has[1]] ?? "").includes(has[2].trim());

  return true;
}
