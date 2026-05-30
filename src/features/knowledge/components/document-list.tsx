'use client';

import { useState, useCallback } from 'react';
import type { KnowledgeDocument } from '../types';
import { Upload, Trash2, File } from 'lucide-react';
import { cn } from '@stsgs/ui';

interface Props {
  documents: KnowledgeDocument[];
  collectionId: string;
  onDelete: (docId: string) => void;
  onUpload: (collectionId: string, file: File) => void;
}

const FILE_COLORS: Record<string, string> = { txt: 'text-blue-500', md: 'text-purple-500', pdf: 'text-red-500', docx: 'text-blue-600 dark:text-blue-400' };

export function DocumentList({ documents, collectionId, onDelete, onUpload }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(collectionId, file);
  }, [collectionId, onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(collectionId, file);
    e.target.value = '';
  }, [collectionId, onUpload]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn('border-2 border-dashed rounded-lg p-6 text-center transition-colors', dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50')}
      >
        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Drop files here or</p>
        <label className="inline-block mt-1 px-3 py-1 rounded-md bg-primary/10 text-primary text-sm cursor-pointer hover:bg-primary/20 transition-colors">
          Browse
          <input type="file" accept=".txt,.md,.pdf,.docx" onChange={handleFileInput} className="hidden" />
        </label>
        <p className="text-xs text-muted-foreground mt-2">Supports .txt, .md, .pdf, .docx</p>
      </div>

      {documents.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No documents yet</p>
      )}

      <div className="divide-y rounded-lg border">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center gap-3 px-3 py-2.5 group hover:bg-accent/50 transition-colors">
            <File className={cn('h-4 w-4 shrink-0', FILE_COLORS[doc.fileType] ?? 'text-muted-foreground')} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{doc.title}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="uppercase font-mono">{doc.fileType}</span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                {doc.tags.length > 0 && <span className="text-primary">{doc.tags.length} tags</span>}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{doc.content.length} chars</span>
            <button
              onClick={() => onDelete(doc.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
