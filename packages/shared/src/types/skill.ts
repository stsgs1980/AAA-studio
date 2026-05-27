// ============================================================================
// Skill types
// ============================================================================

/** Skill definition */
export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  code: string;
  tests?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
