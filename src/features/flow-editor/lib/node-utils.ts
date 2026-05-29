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

/** Safely evaluate simple conditions without eval(). Fails closed (returns false). */
export function safeEvalCondition(expr: string, ctx: Record<string, unknown>): boolean {
  const t = expr.trim().toLowerCase();
  if (t === "true" || t === "1") return true;
  if (t === "false" || t === "0") return false;

  // field === value  |  field !== value
  const eq = expr.match(/^(\w+)\s*(===|!==)\s*(.+)$/);
  if (eq) return (String(ctx[eq[1]] ?? "") === eq[3].trim()) === (eq[2] === "===");

  // field contains text
  const has = expr.match(/^(\w+)\s+contains\s+(.+)$/);
  if (has) return String(ctx[has[1]] ?? "").includes(has[2].trim());

  // field startsWith text
  const sw = expr.match(/^(\w+)\s+startsWith\s+(.+)$/);
  if (sw) return String(ctx[sw[1]] ?? "").startsWith(sw[2].trim());

  // field endsWith text
  const ew = expr.match(/^(\w+)\s+endsWith\s+(.+)$/);
  if (ew) return String(ctx[ew[1]] ?? "").endsWith(ew[2].trim());

  // field > | < | >= | <= number
  const cmp = expr.match(/^(\w+)\s*(>=|<=|>|<)\s*(-?[\d.]+)$/);
  if (cmp) {
    const v = Number(ctx[cmp[1]]);
    const n = Number(cmp[3]);
    if (cmp[2] === ">=") return v >= n;
    if (cmp[2] === "<=") return v <= n;
    if (cmp[2] === ">") return v > n;
    return v < n;
  }

  // field exists
  const ex = expr.match(/^(\w+)\s+exists$/);
  if (ex) return ctx[ex[1]] !== undefined && ctx[ex[1]] !== "";

  // field empty
  const em = expr.match(/^(\w+)\s+empty$/);
  if (em) return ctx[em[1]] === undefined || ctx[em[1]] === "";

  return false; // fail-safe: unrecognized expression → false
}
