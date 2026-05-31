'use client';

import { useFlowEditorStore } from '../store/flow-store';
import { getNodeDefinition } from '../nodes/node-registry';
import type { DataType } from '@stsgs/shared';

interface DataContractOverlayProps {
  selectedEdgeId: string;
  onClose: () => void;
}

/** Shows data types flowing through a selected edge */
export function DataContractOverlay({ selectedEdgeId, onClose }: DataContractOverlayProps) {
  const edges = useFlowEditorStore((s) => s.edges);
  const nodes = useFlowEditorStore((s) => s.nodes);

  const edge = edges.find((e) => e.id === selectedEdgeId);
  if (!edge) return null;

  const srcNode = nodes.find((n) => n.id === edge.source);
  const tgtNode = nodes.find((n) => n.id === edge.target);
  if (!srcNode || !tgtNode) return null;

  const srcDef = getNodeDefinition(srcNode.type ?? '');
  const tgtDef = getNodeDefinition(tgtNode.type ?? '');

  const srcHandle = srcDef?.outputs.find((h) => h.id === (edge.sourceHandle ?? 'out'));
  const tgtHandle = tgtDef?.inputs.find((h) => h.id === (edge.targetHandle ?? 'in'));

  const srcType: DataType = srcHandle?.dataType ?? 'any';
  const tgtType: DataType = tgtHandle?.dataType ?? 'any';
  const compatible = srcType === 'any' || tgtType === 'any' || srcType === tgtType;
  const connType = (edge.data as Record<string, unknown>)?.connectionType as string | undefined;

  return (
    <div className="absolute bottom-4 left-4 z-20 bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-foreground">Data Contract</h4>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono">{srcType}</span>
        <span className="text-muted-foreground">→</span>
        <span className={`px-2 py-0.5 rounded font-mono ${compatible ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>{tgtType}</span>
      </div>
      <p className={`text-[10px] mt-1.5 ${compatible ? 'text-emerald-600' : 'text-red-500'}`}>
        {compatible ? '✓ Types compatible' : '✗ Types incompatible — may fail at runtime'}
      </p>
      {connType && <p className="text-[10px] text-muted-foreground mt-1">Connection: <span className="font-medium text-foreground">{connType}</span></p>}
    </div>
  );
}
