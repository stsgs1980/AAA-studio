'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sparkles } from 'lucide-react';

import { useFlowEditorStore } from '../store/flow-store';
import { getReactFlowNodeTypes, getNodeDefinition } from '../nodes/node-registry';
import { AnimatedEdge, TypedEdge } from '../edges';
import { isValidConnection } from '../lib/connection-validation';
import { DataContractOverlay } from './data-contract-overlay';
import type { NodeType } from '@stsgs/shared';

const nodeTypes = getReactFlowNodeTypes();
const edgeTypes = { animated: AnimatedEdge, typed: TypedEdge };

function miniMapNodeColor(node: Node): string {
  const def = getNodeDefinition((node.type as NodeType) ?? '');
  const c = def?.colorClass ?? '';
  if (c.includes('blue')) return 'var(--flow-blue-600)';
  if (c.includes('purple')) return 'var(--flow-purple-600)';
  if (c.includes('emerald')) return 'var(--flow-emerald-600)';
  if (c.includes('amber')) return 'var(--flow-amber-600)';
  if (c.includes('orange')) return 'var(--flow-orange-600)';
  if (c.includes('red')) return 'var(--flow-red-600)';
  return 'var(--flow-slate-600)';
}

export function FlowCanvas() {
  const { screenToFlowPosition } = useReactFlow();
  const store = useFlowEditorStore();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const def = getNodeDefinition(type);
      store.addNode({ id: `${type}-${Date.now()}`, type, position, data: { label: def?.label ?? type, ...def?.defaultData } });
    },
    [screenToFlowPosition, store],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => store.setSelectedNodeId(node.id), [store]);
  const onPaneClick = useCallback(() => { store.setSelectedNodeId(null); setSelectedEdgeId(null); }, [store]);
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => setSelectedEdgeId(edge.id), []);
  const validateConnection = useCallback((conn: Edge | Connection) => isValidConnection(conn, store.nodes), [store.nodes]);

  return (
    <>
      <ReactFlow
        nodes={store.nodes} edges={store.edges}
        onNodesChange={store.onNodesChange} onEdgesChange={store.onEdgesChange}
        onConnect={store.onConnect} onDragOver={onDragOver} onDrop={onDrop}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick} onEdgeClick={onEdgeClick}
        isValidConnection={validateConnection}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        fitView snapToGrid snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']} className="bg-background"
      >
        <Background gap={16} size={1} />
        <Controls position="bottom-right"
          className="!bg-card !border-border rounded-lg shadow-md [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-accent [&>button]:!rounded [&>button]:!border-0"
        />
        <MiniMap nodeColor={miniMapNodeColor} maskColor="rgba(0, 0, 0, 0.6)"
          className="!bg-card !border-border rounded-lg shadow-md" pannable zoomable
        />
        {store.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-3 pointer-events-auto">
              <p className="text-sm text-muted-foreground">Drag nodes from the left panel or</p>
              <button onClick={store.toggleAssistant}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                <Sparkles className="h-4 w-4" /> Use Flow Assistant
              </button>
            </div>
          </div>
        )}
      </ReactFlow>
      {selectedEdgeId && <DataContractOverlay selectedEdgeId={selectedEdgeId} onClose={() => setSelectedEdgeId(null)} />}
    </>
  );
}
