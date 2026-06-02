import type { ConnectionType } from '@stsgs/shared';
import { CONNECTION_TYPE_CONFIG } from '@stsgs/shared';

/** Resolve edge color with health overrides */
export function getEdgeColor(ct: ConnectionType, health?: string): string {
  if (health === 'conflict') return '#EF4444';
  if (health === 'warning') return '#F59E0B';
  return CONNECTION_TYPE_CONFIG[ct]?.color ?? 'hsl(220, 10%, 40%)';
}

/** Get dash pattern for a connection type */
export function getDash(ct?: ConnectionType): string {
  if (!ct) return 'none';
  return CONNECTION_TYPE_CONFIG[ct]?.strokeDasharray ?? 'none';
}

/** Whether particles should flow along this edge */
export function hasParticles(ct?: ConnectionType): boolean {
  if (!ct) return false;
  return CONNECTION_TYPE_CONFIG[ct]?.animated ?? false;
}

/** Build label border color based on state */
export function labelBorderColor(health: string, isExec: boolean, color: string): string {
  if (health === 'conflict') return 'rgba(239,68,68,0.4)';
  if (health === 'warning') return 'rgba(245,158,11,0.4)';
  if (isExec) return 'rgba(34,211,238,0.4)';
  return `${color}30`;
}

/** Build label text based on state */
export function labelText(isExec: boolean, health: string, edgeLabel: string): string {
  if (isExec) return 'EXECUTING';
  if (health === 'conflict') return '⚠ CONFLICT';
  if (health === 'warning') return '⚠ WARNING';
  return edgeLabel;
}
