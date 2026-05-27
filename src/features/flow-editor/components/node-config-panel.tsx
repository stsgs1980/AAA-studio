'use client';

import { useState } from 'react';
import { useFlowEditorStore } from '../store/flow-store';
import { getNodeDefinition } from '../nodes/node-registry';
import { ConfigTab, IOSchemaTab, ExecutionTab } from './config-tabs';
import { cn } from '@stsgs/ui';
import { X } from 'lucide-react';

type TabId = 'config' | 'io' | 'execution';

const TABS: { id: TabId; label: string }[] = [
  { id: 'config', label: 'Config' },
  { id: 'io', label: 'I/O' },
  { id: 'execution', label: 'History' },
];

/**
 * Right-side panel that shows when a node is selected.
 * Displays 3 tabs: Configuration, I/O Schema, Execution History.
 * Uses 1 useState (activeTab).
 */
export function NodeConfigPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId } = useFlowEditorStore();
  const [activeTab, setActiveTab] = useState<TabId>('config');

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const def = getNodeDefinition(node.type ?? '');
  const d = node.data as Record<string, string>;

  return (
    <div className="w-72 border-l bg-card overflow-y-auto flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('h-3 w-3 rounded shrink-0', def?.colorClass ?? 'bg-slate-500')} />
          <h3 className="text-sm font-semibold truncate">{d.label ?? 'Node'}</h3>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground shrink-0"
          title="Close panel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 px-2 py-1.5 text-[11px] font-medium transition-colors border-b-2',
              activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {activeTab === 'config' && <ConfigTab />}
        {activeTab === 'io' && <IOSchemaTab />}
        {activeTab === 'execution' && <ExecutionTab />}
      </div>
    </div>
  );
}
