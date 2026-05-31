'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, User, Bot, GripVertical } from 'lucide-react';
import { cn } from '@stsgs/ui';

interface TreeNode {
  id: string; name: string; role: string; status: string; group: string;
  parentId: string | null; children: TreeNode[];
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500', inactive: 'bg-gray-400', draft: 'bg-amber-500',
};

export type { TreeNode };

export function TreeItem({ node, depth = 0, onDrop }: {
  node: TreeNode; depth?: number; onDrop: (dragId: string, targetId: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [dragOver, setDragOver] = useState(false);
  const hasChildren = node.children.length > 0;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dragId = e.dataTransfer.getData('text/plain');
    if (dragId && dragId !== node.id) onDrop(dragId, node.id);
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors',
          depth > 0 && 'ml-6',
          dragOver && 'bg-primary/10 ring-1 ring-primary/40',
        )}
        onClick={() => hasChildren && setExpanded(!expanded)}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDropEvent}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0 cursor-grab" />
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : <span className="w-3.5" />}
        <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_COLORS[node.status] ?? 'bg-gray-400')} />
        {node.group === 'orchestrator' ? <Bot className="h-4 w-4 text-primary shrink-0" /> : <User className="h-4 w-4 text-muted-foreground shrink-0" />}
        <div className="min-w-0">
          <span className="text-sm font-medium truncate">{node.name}</span>
          <span className="text-xs text-muted-foreground ml-2">{node.group}</span>
        </div>
        {hasChildren && <span className="text-xs text-muted-foreground ml-auto">{node.children.length}</span>}
      </div>
      {expanded && hasChildren && (
        <div className="ml-4 border-l border-border/50 pl-1">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} onDrop={onDrop} />
          ))}
        </div>
      )}
    </div>
  );
}
