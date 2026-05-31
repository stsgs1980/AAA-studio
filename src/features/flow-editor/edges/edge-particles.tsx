'use client';

import type { ConnectionType } from '@stsgs/shared';
import { CONNECTION_TYPE_CONFIG } from '@stsgs/shared';

/** Animation duration per connection type (seconds) */
const EDGE_DURATIONS: Record<ConnectionType, number> = {
  command: 3,
  sync: 5,
  twin: 4,
  delegate: 3.5,
  feedback: 3,
  supervise: 6,
  broadcast: 2.5,
};

/** Three staggered particles at 0%, 33%, 66% path offset */
const PARTICLES = [
  { offset: 0, sizeMult: 1 },
  { offset: 0.33, sizeMult: 0.85 },
  { offset: 0.66, sizeMult: 0.7 },
] as const;

/** Animated flow particles that travel along an edge path */
export function EdgeParticles({
  id,
  edgePath,
  connectionType,
  isExecPath = false,
}: {
  id: string;
  edgePath: string;
  connectionType: ConnectionType;
  isExecPath?: boolean;
}) {
  const config = CONNECTION_TYPE_CONFIG[connectionType];
  const baseDur = EDGE_DURATIONS[connectionType] ?? 4;
  // Execution path: 2× speed, cyan color
  const dur = isExecPath ? baseDur * 0.5 : baseDur;
  const particleColor = isExecPath ? '#22D3EE' : config.color;
  const glowStd = isExecPath ? '3' : '2';
  const trailStd = isExecPath ? '6' : '4';

  return (
    <g>
      <defs>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={glowStd} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`trail-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={trailStd} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {PARTICLES.map((p, i) => {
        const baseR = isExecPath ? 3.5 : 2.5;
        const r = baseR * p.sizeMult;
        const begin = p.offset * dur;
        const durS = `${dur}s`;
        const beginS = `${begin}s`;
        const trailOp = isExecPath ? 0.25 : 0.15;
        const coreOp = isExecPath ? 0.9 : 0.7;
        const pulseVals = isExecPath ? '0.7;1;0.7' : '0.5;0.85;0.5';

        return (
          <g key={`${id}-p-${i}`}>
            {/* Trailing glow halo */}
            <circle
              r={r * 2.5}
              fill={particleColor}
              opacity={trailOp}
              filter={`url(#trail-${id})`}
            >
              <animateMotion
                path={edgePath} dur={durS} begin={beginS}
                repeatCount="indefinite" keyPoints="0;1"
                keyTimes="0;1" calcMode="linear"
              />
            </circle>
            {/* Core particle with pulsation */}
            <circle
              r={r}
              fill={particleColor}
              opacity={coreOp}
              filter={`url(#glow-${id})`}
            >
              <animateMotion
                path={edgePath} dur={durS} begin={beginS}
                repeatCount="indefinite" keyPoints="0;1"
                keyTimes="0;1" calcMode="linear"
              />
              <animate
                attributeName="opacity"
                values={pulseVals}
                dur={`${dur * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}
    </g>
  );
}
