'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { ConnectionType } from '@stsgs/shared';
import { CONNECTION_TYPE_CONFIG } from '@stsgs/shared';

/** Get color for a connection type, with fallback */
function getConnectionColor(ct?: ConnectionType): string {
  if (!ct) return 'hsl(220, 10%, 40%)'; // default gray
  return CONNECTION_TYPE_CONFIG[ct]?.color ?? 'hsl(220, 10%, 40%)';
}

/** Get dash pattern for a connection type */
function getConnectionDash(ct?: ConnectionType): string {
  if (!ct) return 'none';
  return CONNECTION_TYPE_CONFIG[ct]?.strokeDasharray ?? 'none';
}

/** Whether a connection type has animated particles */
function isConnectionAnimated(ct?: ConnectionType): boolean {
  if (!ct) return false;
  return CONNECTION_TYPE_CONFIG[ct]?.animated ?? false;
}

/**
 * Typed edge — renders differently based on connectionType.
 * Falls back to standard smoothstep if no connectionType is set.
 */
export function TypedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  data,
}: EdgeProps) {
  const ct = (data as Record<string, unknown>)?.connectionType as ConnectionType | undefined;
  const color = getConnectionColor(ct);
  const dash = getConnectionDash(ct);
  const animated = isConnectionAnimated(ct);

  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    borderRadius: 8,
  });

  const config = ct ? CONNECTION_TYPE_CONFIG[ct] : null;
  const edgeLabel = (label as string) || config?.label || '';

  return (
    <>
      {/* Base edge line */}
      <BaseEdge id={id} path={edgePath} style={{ stroke: color, strokeWidth: 2 }} />
      {/* Typed dash overlay */}
      {ct && dash !== 'none' && (
        <path
          d={edgePath} fill="none" stroke={color} strokeWidth={2}
          strokeDasharray={dash} opacity={0.8}
        />
      )}
      {/* Animated particles for twin/delegate/feedback/broadcast */}
      {animated && ct && (
        <path
          d={edgePath} fill="none" stroke={color} strokeWidth={2.5}
          strokeDasharray="6 6" opacity={0.6}
        >
          <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.5s" repeatCount="indefinite" />
        </path>
      )}
      {/* Label with colored background */}
      {edgeLabel && (
        <EdgeLabelRenderer>
          <div
            className="absolute rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-sm pointer-events-none"
            style={{
              borderColor: color,
              backgroundColor: 'hsl(var(--card))',
              color,
            }}
          >
            {edgeLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
