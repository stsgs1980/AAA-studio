'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

/**
 * Animated edge with a dashed overlay that flows along the path.
 * Used for edges where data is actively being processed.
 */
export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      {/* Base edge line */}
      <BaseEdge
        id={id}
        path={edgePath}
        className="!stroke-muted-foreground !stroke-2"
      />
      {/* Animated dashed overlay */}
      <path
        d={edgePath}
        fill="none"
        stroke="hsl(221.2 83.2% 53.3%)"
        strokeWidth={2}
        strokeDasharray="8 4"
        opacity={0.7}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-24"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      {/* Optional label */}
      {label && (
        <EdgeLabelRenderer>
          <div className="absolute rounded-md bg-card border border-border px-2 py-0.5 text-[10px] text-foreground shadow-sm pointer-events-none">
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
