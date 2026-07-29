/** Extract text from key-value inputs for LLM context. */

export function extractText(inputs: Record<string, unknown>): string {
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
