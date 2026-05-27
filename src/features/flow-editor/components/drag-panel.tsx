'use client';

import { useState } from 'react';
import { cn } from '@stsgs/ui';
import { getNodesByCategory } from '../nodes/node-registry';
import { NODE_CATEGORIES } from '../types';
import {
  Brain, MessageSquare, Link2, GitBranch, Database,
  Bot, Users, UserCheck, GitFork,
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, Filter,
  FileSearch, HardDrive,
  Globe, Webhook,
  Play, Square, AlertTriangle,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Brain, MessageSquare, Link2, GitBranch, Database,
  Bot, Users, UserCheck, GitFork,
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, Filter,
  FileSearch, HardDrive,
  Globe, Webhook,
  Play, Square, AlertTriangle,
};

/**
 * Left sidebar panel with draggable node types grouped by category.
 * Dragging a node type onto the canvas creates a new node at drop position.
 */
export function DragPanel() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const grouped = getNodesByCategory();

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const toggle = (cat: string) =>
    setCollapsed((p) => ({ ...p, [cat]: !p[cat] }));

  return (
    <div className="w-52 border-r bg-card overflow-y-auto shrink-0">
      <div className="p-3 border-b">
        <h3 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest">
          Nodes
        </h3>
      </div>
      <div className="p-2 space-y-1">
        {NODE_CATEGORIES.map((cat) => {
          const nodes = grouped.get(cat.category) ?? [];
          const shut = collapsed[cat.category] ?? false;
          return (
            <div key={cat.category}>
              <button
                onClick={() => toggle(cat.category)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent rounded transition-colors"
              >
                {shut
                  ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                <span className={cn('h-2 w-2 rounded-full shrink-0', cat.colorClass)} />
                <span className="truncate">{cat.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {nodes.length}
                </span>
              </button>
              {!shut && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {nodes.map((node) => {
                    const Icon = ICON_MAP[node.icon] ?? Brain;
                    return (
                      <div
                        key={node.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type)}
                        className="flex items-center gap-2 px-2 py-1 rounded text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{node.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
