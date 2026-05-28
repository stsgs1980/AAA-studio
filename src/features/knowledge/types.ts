export interface KnowledgeCollection {
  id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  _count?: { documents: number };
}

export interface KnowledgeDocument {
  id: string;
  collectionId: string;
  title: string;
  content: string;
  fileType: 'txt' | 'md' | 'pdf' | 'docx';
  tags: string[];
  createdAt: string;
}
