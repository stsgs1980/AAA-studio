'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFlowEditorStore } from '../store/flow-store';
import { getReactFlowNodeTypes, getNodeDefinition } from '../nodes/node-registry';
import { AnimatedEdge } from '../edges';
import type { NodeType } from '@stsgs/shared';

const nodeTypes = getReactFlowNodeTypes();
const edgeTypes = { animated: AnimatedEdge };

/** Map node category colors for the minimap. */
function miniMapNodeColor(node: Node): string {
  const def = getNodeDefinition((node.type as NodeType) ?? '');
  const c = def?.colorClass ?? '';
  if (c.includes('blue')) return '#2563eb';
  if (c.includes('purple')) return '#9333ea';
  if (c.includes('emerald')) return '#059669';
  if (c.includes('amber')) return '#d97706';
  if (c.includes('orange')) return '#ea580c';
  if (c.includes('red')) return '#dc2626';
  return '#475569';
}

export function FlowCanvas() {
  const { screenToFlowPosition } = useReactFlow();
  const store = useFlowEditorStore();

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
      store.addNode({
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: def?.label ?? type, ...def?.defaultData },
      });
    },
    [screenToFlowPosition, store],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => store.setSelectedNodeId(node.id),
    [store],
  );

  const onPaneClick = useCallback(
    () => store.setSelectedNodeId(null),
    [store],
  );

  return (
    <ReactFlow
      nodes={store.nodes}
      edges={store.edges}
      onNodesChange={store.onNodesChange}
      onEdgesChange={store.onEdgesChange}
      onConnect={store.onConnect}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      snapToGrid
      snapGrid={[16, 16]}
      deleteKeyCode={['Backspace', 'Delete']}
      className="bg-background"
    >
      <Background gap={16} size={1} />
      <Controls
        position="bottom-right"
        className="!bg-card !border-border rounded-lg shadow-md [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-accent [&>button]:!rounded [&>button]:!border-0"
      />
      <MiniMap
        nodeColor={miniMapNodeColor}
        maskColor="rgba(0, 0, 0, 0.6)"
        className="!bg-card !border-border rounded-lg shadow-md"
        pannable
        zoomable
      />
    </ReactFlow>
  );
}
