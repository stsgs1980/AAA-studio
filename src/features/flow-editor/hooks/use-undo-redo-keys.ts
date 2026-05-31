'use client';

import { useEffect } from 'react';
import { useFlowEditorStore } from '../store/flow-store';

/** Keyboard shortcuts for undo/redo: Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y) */
export function useUndoRedoKeys() {
  const { canUndo, canRedo, undo, redo } = useFlowEditorStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || (e.key === 'y' && canRedo)) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);
}
