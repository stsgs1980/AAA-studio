'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@stsgs/ui';
import type { HandleConfig } from '../types';

interface BaseNodeProps extends NodeProps {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  /** Explicit handle configs; overrides showInput/showOutput */
  inputs?: HandleConfig[];
  outputs?: HandleConfig[];
  /** Legacy props — ignored when inputs/outputs are provided */
  showInput?: boolean;
  showOutput?: boolean;
}

/** Spread multiple output handles evenly along the bottom */
function spreadPosition(_index: number, _total: number): Position {
  return Position.Bottom;
}

/** Calculate horizontal offset for multi-handle positioning */
function handleOffset(index: number, total: number): React.CSSProperties {
  if (total <= 1) return {};
  const pct = ((index + 1) / (total + 1)) * 100;
  return { left: `${pct}%`, transform: 'translateX(-50%)' };
}

/**
 * Base node component shared by all 18 node types.
 * Renders: colored header + icon + label, optional name,
 * description, and handles from registry config.
 */
export function BaseNode({
  icon,
  label,
  colorClass,
  selected,
  data,
  inputs,
  outputs,
  showInput = true,
  showOutput = true,
}: BaseNodeProps) {
  const d = data as Record<string, string>;

  // Use registry handles if provided, otherwise fall back to legacy mode
  const hasInputs = inputs && inputs.length > 0;
  const hasOutputs = outputs && outputs.length > 0;

  return (
    <div
      className={cn(
        'min-w-[140px] max-w-[180px] rounded-lg border-2 bg-card shadow-sm transition-all',
        selected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-muted-foreground/50',
      )}
    >
      {/* Input handles */}
      {hasInputs
        ? inputs.map((h, i) => (
            <Handle
              key={h.id}
              type="target"
              position={Position.Top}
              id={h.id}
              style={{ ...handleOffset(i, inputs.length), top: -4 }}
              className="!h-2.5 !w-2.5 !bg-muted-foreground !border-2 !border-background"
            />
          ))
        : showInput && (
            <Handle
              type="target"
              position={Position.Top}
              className="!h-2.5 !w-2.5 !bg-muted-foreground !border-2 !border-background"
            />
          )}

      <div className={cn('flex items-center gap-2 rounded-t-md px-3 py-1.5', colorClass)}>
        <span className="text-white shrink-0">{icon}</span>
        <span className="text-[11px] font-semibold text-white truncate">{label}</span>
      </div>

      {d.label && (
        <div className="px-3 py-1 border-b border-border">
          <p className="text-[11px] text-foreground truncate font-medium">{d.label}</p>
        </div>
      )}

      <div className="px-3 py-1">
        <p className="text-[10px] text-muted-foreground truncate">
          {d.description || 'Configure...'}
        </p>
      </div>

      {/* Output handles */}
      {hasOutputs
        ? outputs.map((h, i) => (
            <Handle
              key={h.id}
              type="source"
              position={spreadPosition(i, outputs.length)}
              id={h.id}
              style={{ ...handleOffset(i, outputs.length), bottom: -4 }}
              className="!h-2.5 !w-2.5 !bg-muted-foreground !border-2 !border-background"
            />
          ))
        : showOutput && (
            <Handle
              type="source"
              position={Position.Bottom}
              className="!h-2.5 !w-2.5 !bg-muted-foreground !border-2 !border-background"
            />
          )}
    </div>
  );
}
