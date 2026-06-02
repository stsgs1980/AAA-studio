/**
 * Connection validation logic for typed connections.
 * Validates data type compatibility and prevents invalid edges.
 */

import type { Connection, Edge, Node } from '@xyflow/react';
import type { DataType, ConnectionType } from '@stsgs/shared';
import { isDataTypeCompatible, CONNECTION_TYPE_CONFIG } from '@stsgs/shared';
import { getNodeDefinition } from '../nodes/node-registry';

/** Resolve the DataType of a source handle */
function getSourceDataType(
  sourceNode: Node,
  sourceHandleId: string | null | undefined,
): DataType {
  const def = getNodeDefinition(sourceNode.type ?? '');
  if (!def) return 'any';
  const handle = def.outputs.find((h) => h.id === (sourceHandleId ?? 'out'));
  return handle?.dataType ?? 'any';
}

/** Resolve the DataType of a target handle */
function getTargetDataType(
  targetNode: Node,
  targetHandleId: string | null | undefined,
): DataType {
  const def = getNodeDefinition(targetNode.type ?? '');
  if (!def) return 'any';
  const handle = def.inputs.find((h) => h.id === (targetHandleId ?? 'in'));
  return handle?.dataType ?? 'any';
}

/** Detect if a connection creates a feedback loop (back-edge in DAG) */
function isFeedbackLoop(
  sourceId: string,
  targetId: string,
  edges: Array<{ source: string; target: string }>,
): boolean {
  // BFS from target to see if we can reach source via existing edges
  // If yes, adding source→target creates a cycle = feedback loop
  const visited = new Set<string>();
  const queue = [targetId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === sourceId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const e of edges) {
      if (e.source === current) queue.push(e.target);
    }
  }
  return false;
}

/** Check if a connection is valid based on data types */
export function isValidConnection(
  connection: Connection | Edge,
  nodes: Node[],
  _edges?: Array<{ source: string; target: string }>,
): boolean {
  const sourceId = connection.source;
  const targetId = connection.target;
  const sourceNode = nodes.find((n) => n.id === sourceId);
  const targetNode = nodes.find((n) => n.id === targetId);

  if (!sourceNode || !targetNode) return false;
  if (sourceId === targetId) return false;

  const srcType = getSourceDataType(sourceNode, connection.sourceHandle);
  const tgtType = getTargetDataType(targetNode, connection.targetHandle);

  return isDataTypeCompatible(srcType, tgtType);
}

/** Suggest a connection type based on source/target categories + feedback detection */
export function suggestConnectionType(
  sourceNodeType: string,
  targetNodeType: string,
  isLoop?: boolean,
): ConnectionType | undefined {
  // Feedback loops always get the 'feedback' type
  if (isLoop) return 'feedback';

  const srcDef = getNodeDefinition(sourceNodeType);
  const tgtDef = getNodeDefinition(targetNodeType);
  if (!srcDef || !tgtDef) return undefined;

  const srcCat = srcDef.category;
  const tgtCat = tgtDef.category;

  for (const ct of Object.values(CONNECTION_TYPE_CONFIG)) {
    if (ct.fromCategories.includes(srcCat) && ct.toCategories.includes(tgtCat)) {
      return ct.type;
    }
  }
  return undefined;
}

/** Get validation error message for a rejected connection */
export function getConnectionError(
  connection: Connection | Edge,
  nodes: Node[],
): string | null {
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) return 'Node not found';
  if (connection.source === connection.target) return 'Self-connections not allowed';

  const srcType = getSourceDataType(sourceNode, connection.sourceHandle);
  const tgtType = getTargetDataType(targetNode, connection.targetHandle);

  if (!isDataTypeCompatible(srcType, tgtType)) {
    return `Incompatible types: ${srcType} → ${tgtType}`;
  }
  return null;
}

export { isFeedbackLoop };
