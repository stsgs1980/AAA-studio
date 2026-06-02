'use client';

/**
 * Command Palette — Ctrl+K quick actions overlay.
 * Uses cmdk for accessible, keyboard-first command search.
 */

import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { useFlowEditorStore } from '../store/flow-store';
import { useFlowActions } from '../hooks/use-flow-actions';
import { getNodeDefinition } from '../nodes/node-registry';

interface Cmd { id: string; label: string; group: string; icon?: string; action: () => void }

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const store = useFlowEditorStore();
  const { saveFlow, runFlow } = useFlowActions();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const commands: Cmd[] = [
    { id: 'assistant', label: 'Open Flow Assistant', group: 'Flow', action: () => { store.toggleAssistant(); close(); } },
    { id: 'save', label: 'Save Flow', group: 'Flow', action: () => { saveFlow(); close(); } },
    { id: 'run', label: 'Run Flow', group: 'Flow', action: () => { runFlow(); close(); } },
    { id: 'clear', label: 'Clear Canvas', group: 'Flow', action: () => { store.clearCanvas(); close(); } },
    { id: 'undo', label: 'Undo', group: 'Edit', action: () => { store.undo(); close(); } },
    { id: 'redo', label: 'Redo', group: 'Edit', action: () => { store.redo(); close(); } },
    { id: 'duplicate', label: 'Duplicate Selected Node', group: 'Edit', action: () => { duplicateSelected(store, close); } },
    { id: 'delete', label: 'Delete Selected Node', group: 'Edit', action: () => { if (store.selectedNodeId) { store.removeNodes([store.selectedNodeId]); close(); } } },
    { id: 'deselect', label: 'Deselect Node', group: 'View', action: () => { store.setSelectedNodeId(null); close(); } },
    { id: 'add-llm', label: 'Add LLM Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'llm'); close(); } },
    { id: 'add-agent', label: 'Add Agent Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'agent'); close(); } },
    { id: 'add-router', label: 'Add Router Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'router'); close(); } },
    { id: 'add-prompt', label: 'Add Prompt Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'prompt'); close(); } },
    { id: 'add-rag', label: 'Add RAG Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'rag'); close(); } },
    { id: 'add-condition', label: 'Add Condition Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'condition'); close(); } },
    { id: 'add-transform', label: 'Add Transform Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'transform'); close(); } },
    { id: 'add-api', label: 'Add API Call Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'api'); close(); } },
    { id: 'add-input', label: 'Add Input Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'input'); close(); } },
    { id: 'add-output', label: 'Add Output Node', group: 'Add Node', action: () => { addNodeAtCenter(store, 'output'); close(); } },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={close}>
      <div className="mx-auto mt-[20vh] w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <Command label="Command palette" className="rounded-xl border bg-card shadow-2xl overflow-hidden">
          <Command.Input placeholder="Type a command..." className="w-full border-b bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground" />
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-4 text-center text-sm text-muted-foreground">No results found.</Command.Empty>
            {grouped(commands).map(([group, cmds]) => (
              <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                {cmds.map((c) => (
                  <Command.Item key={c.id} onSelect={c.action} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-default data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground">
                    {c.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function grouped(cmds: Cmd[]): [string, Cmd[]][] {
  const map = new Map<string, Cmd[]>();
  for (const c of cmds) { const arr = map.get(c.group) ?? []; arr.push(c); map.set(c.group, arr); }
  return [...map.entries()];
}

function addNodeAtCenter(store: ReturnType<typeof useFlowEditorStore.getState>, type: string) {
  const def = getNodeDefinition(type);
  const count = store.nodes.length;
  store.addNode({
    id: `${type}-${Date.now()}`, type,
    position: { x: 100 + count * 30, y: 200 + count * 20 },
    data: { label: def?.label ?? type, ...def?.defaultData },
  });
}

function duplicateSelected(store: ReturnType<typeof useFlowEditorStore.getState>, close: () => void) {
  const sel = store.selectedNodeId;
  if (!sel) return;
  const orig = store.nodes.find((n) => n.id === sel);
  if (!orig) return;
  store.addNode({
    id: `${orig.type}-${Date.now()}`,
    type: orig.type,
    position: { x: (orig.position?.x ?? 0) + 40, y: (orig.position?.y ?? 0) + 40 },
    data: JSON.parse(JSON.stringify(orig.data)),
  });
  close();
}
