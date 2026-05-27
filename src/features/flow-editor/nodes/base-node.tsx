'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@stsgs/ui';

interface BaseNodeProps extends NodeProps {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  showInput?: boolean;
  showOutput?: boolean;
}

/**
 * Base node component shared by all 18 node types.
 * Renders: colored header bar + icon + label, optional name,
 * description line, and input/output handles.
 */
export function BaseNode({
  icon,
  label,
  colorClass,
  showInput = true,
  showOutput = true,
  selected,
  data,
}: BaseNodeProps) {
  const d = data as Record<string, string>;
  return (
    <div
      className={cn(
        'min-w-[140px] max-w-[180px] rounded-lg border-2 bg-card shadow-sm transition-all',
        selected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-muted-foreground/50',
      )}
    >
      {showInput && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-2.5 !w-2.5 !bg-muted-foreground !border-2 !border-background"
        />
      )}
      <div className={cn('flex items-center gap-2 rounded-t-md px-3 py-1.5', colorClass)}>
        <span className="text-white shrink-0">{icon}</span>
        <span className="text-[11px] font-semibold text-white truncate">
          {label}
        </span>
      </div>
      {d.label && (
        <div className="px-3 py-1 border-b border-border">
          <p className="text-[11px] text-foreground truncate font-medium">
            {d.label}
          </p>
        </div>
      )}
      <div className="px-3 py-1">
        <p className="text-[10px] text-muted-foreground truncate">
          {d.description || 'Configure...'}
        </p>
      </div>
      {showOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-2.5 !w-2.5 !bg-muted-foreground !border-2 !border-background"
        />
      )}
    </div>
  );
}
