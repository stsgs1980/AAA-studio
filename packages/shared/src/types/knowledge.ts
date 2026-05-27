// ============================================================================
// Knowledge types
// ============================================================================

/** Knowledge collection */
export interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Knowledge document */
export interface KnowledgeDocument {
  id: string;
  collectionId: string;
  title: string;
  content: string;
  fileType: "pdf" | "txt" | "md" | "docx";
  tags: string[];
  createdAt: Date;
}
