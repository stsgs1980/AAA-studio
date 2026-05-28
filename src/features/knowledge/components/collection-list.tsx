'use client';

import type { KnowledgeCollection } from '../types';
import { FileText, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@stsgs/ui';

interface Props {
  collections: KnowledgeCollection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CollectionList({ collections, selectedId, onSelect, onDelete }: Props) {
  if (collections.length === 0) {
    return <div className="text-sm text-muted-foreground p-4">No collections yet. Create one to get started.</div>;
  }

  return (
    <div className="divide-y">
      {collections.map((c) => (
        <div key={c.id} className={cn('flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors group', selectedId === c.id && 'bg-accent')}>
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0" onClick={() => onSelect(c.id)}>
            <div className="text-sm font-medium truncate">{c.name}</div>
            <div className="text-xs text-muted-foreground truncate">{c.description || 'No description'}</div>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{c._count?.documents ?? 0} docs</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
