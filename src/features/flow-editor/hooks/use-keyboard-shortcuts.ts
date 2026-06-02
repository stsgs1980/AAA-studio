'use client';

import { useEffect } from 'react';
import { useFlowEditorStore } from '../store/flow-store';

/** Keyboard shortcuts: Ctrl+D duplicate, Delete/Backspace delete (when no input focused). */
export function useKeyboardShortcuts() {
  const { nodes, selectedNodeId, addNode, removeNodes, setSelectedNodeId } = useFlowEditorStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

      // Ctrl+D — duplicate selected node
      if (mod && e.key === 'd' && selectedNodeId) {
        e.preventDefault();
        const orig = nodes.find(n => n.id === selectedNodeId);
        if (!orig) return;
        const newId = `${orig.type}-${Date.now()}`;
        addNode({
          id: newId, type: orig.type,
          position: { x: (orig.position?.x ?? 0) + 40, y: (orig.position?.y ?? 0) + 40 },
          data: JSON.parse(JSON.stringify(orig.data)),
        });
        setSelectedNodeId(newId);
      }

      // Delete/Backspace — delete selected node (only when no input focused)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && selectedNodeId) {
        e.preventDefault();
        removeNodes([selectedNodeId]);
        setSelectedNodeId(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, selectedNodeId, addNode, removeNodes, setSelectedNodeId]);
}
