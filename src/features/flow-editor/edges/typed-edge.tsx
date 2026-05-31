'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { ConnectionType } from '@stsgs/shared';
import { CONNECTION_TYPE_CONFIG } from '@stsgs/shared';
import { EdgeParticles } from './edge-particles';
import { getEdgeColor, getDash, hasParticles, labelBorderColor, labelText } from './edge-helpers';

interface TypedEdgeData {
  connectionType?: ConnectionType;
  isExecPath?: boolean;
  health?: string;
  strength?: number;
  flowAnimation?: boolean;
}

/** Typed edge with animated particles, glow effects, and execution-path awareness */
const TypedEdgeComponent = memo(function TypedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  data,
  selected,
}: EdgeProps) {
  const d = (data ?? {}) as TypedEdgeData;
  const ct = d.connectionType;
  const isExec = d.isExecPath ?? false;
  const health = d.health ?? '';
  const strength = d.strength ?? 1;
  const showParticles = (d.flowAnimation ?? true) && hasParticles(ct);

  const color = getEdgeColor(ct ?? 'command', health);
  const dash = getDash(ct);
  const config = ct ? CONNECTION_TYPE_CONFIG[ct] : null;
  const edgeLabel = (label as string) || config?.label || '';

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    borderRadius: 8,
  });

  const opacity = isExec ? 0.7 : selected ? 0.7 : 0.2 + strength * 0.2;
  const strokeW = isExec ? 2 : selected ? 1.5 : 0.5 + strength * 0.5;

  return (
    <>
      {isExec && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: color, strokeWidth: strokeW + 4,
            strokeOpacity: 0.1, filter: 'blur(4px)',
          }}
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color, strokeWidth: strokeW, strokeOpacity: opacity,
          transition: 'stroke-width 0.3s, stroke-opacity 0.3s, stroke 0.3s',
        }}
      />
      {ct && dash !== 'none' && (
        <path d={edgePath} fill="none" stroke={color}
          strokeWidth={strokeW} strokeDasharray={dash} opacity={0.8} />
      )}
      {showParticles && ct && (
        <EdgeParticles id={id} edgePath={edgePath}
          connectionType={ct} isExecPath={isExec} />
      )}
      {(selected || isExec || health === 'conflict' || health === 'warning' || edgeLabel) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              fontSize: isExec ? 9 : 8, fontWeight: 700,
              color: health === 'conflict' ? '#EF4444' : health === 'warning' ? '#F59E0B' : isExec ? '#22D3EE' : color,
              background: 'rgba(10,10,10,0.9)',
              padding: '1px 4px', borderRadius: 3,
              pointerEvents: 'none',
              border: `1px solid ${labelBorderColor(health, isExec, color)}`,
            }}
          >
            {labelText(isExec, health, edgeLabel)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export const TypedEdge = TypedEdgeComponent;
