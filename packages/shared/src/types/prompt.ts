// ============================================================================
// Prompt template types
// ============================================================================

/** Prompt template */
export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  framework?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
