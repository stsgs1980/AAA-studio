'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { DragPanel } from './components/drag-panel';
import { FlowCanvas } from './components/flow-canvas';
import { Toolbar } from './components/toolbar';
import { NodeConfigPanel } from './components/node-config-panel';
import { useFlowEditorStore } from './store/flow-store';
import { useLoadFlow } from './hooks/use-load-flow';
import { useUndoRedoKeys } from './hooks/use-undo-redo-keys';

/**
 * Main Flow Editor composition.
 * Layout: Toolbar (top) | DragPanel (left) | Canvas (center) | ConfigPanel (right, conditional).
 */
export function FlowEditor() {
  const selectedNodeId = useFlowEditorStore((s) => s.selectedNodeId);
  useLoadFlow();
  useUndoRedoKeys();

  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col">
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <DragPanel />
          <div className="relative flex-1">
            <FlowCanvas />
          </div>
          {selectedNodeId && <NodeConfigPanel />}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
