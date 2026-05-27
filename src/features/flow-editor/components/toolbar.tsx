'use client';

import { useFlowEditorStore } from '../store/flow-store';
import { cn } from '@stsgs/ui';
import { Undo2, Redo2, Save, Play, Trash2 } from 'lucide-react';

/** Top toolbar with flow name, undo/redo, save, run, and clear. */
export function Toolbar() {
  const { flowName, isDirty, canUndo, canRedo, undo, redo, clearCanvas } =
    useFlowEditorStore();

  return (
    <div className="flex items-center gap-1 border-b bg-card px-3 py-1.5 shrink-0">
      {/* Flow name */}
      <div className="flex items-center gap-2 mr-4 min-w-0">
        <h2 className="text-sm font-semibold truncate">{flowName}</h2>
        {isDirty && (
          <span className="text-[10px] text-amber-500 font-medium shrink-0">
            unsaved
          </span>
        )}
      </div>

      <div className="flex-1" />

      {/* Undo / Redo */}
      <TButton icon={Undo2} label="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo} />
      <TButton icon={Redo2} label="Redo (Ctrl+Y)" disabled={!canRedo} onClick={redo} />

      <div className="w-px h-5 bg-border mx-1" />

      {/* Save */}
      <TButton icon={Save} label="Save flow" onClick={() => {}} />

      {/* Execute */}
      <TButton icon={Play} label="Run flow" variant="primary" onClick={() => {}} />

      <div className="w-px h-5 bg-border mx-1" />

      {/* Clear */}
      <TButton icon={Trash2} label="Clear canvas" variant="danger" onClick={clearCanvas} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal toolbar button
// ---------------------------------------------------------------------------

interface TButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}

function TButton({ icon: Icon, label, onClick, disabled, variant = 'default' }: TButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        variant === 'default' && 'hover:bg-accent text-muted-foreground hover:text-foreground',
        variant === 'primary' && 'text-primary hover:bg-primary hover:text-primary-foreground',
        variant === 'danger' && 'text-destructive hover:bg-destructive hover:text-destructive-foreground',
        disabled && 'opacity-40 pointer-events-none',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
