// ============================================================================
// Standard types
// ============================================================================

/** Standard definition */
export interface Standard {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: StandardRule[];
  severity: "info" | "warning" | "error";
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StandardRule {
  id: string;
  name: string;
  description: string;
  pattern?: string;
}
