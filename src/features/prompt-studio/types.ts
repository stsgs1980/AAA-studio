export interface Template {
  id: string; name: string; category: string; content: string;
  variables: string[]; framework: string | null; tags: string[];
}

export const CATEGORIES = ['general', 'system', 'user', 'agent', 'chain-of-thought', 'few-shot', 'evaluation'];

export function extractVars(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g);
  return [...new Set(matches?.map((m) => m.replace(/[{}]/g, '')) ?? [])];
}
