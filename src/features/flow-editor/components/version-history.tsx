'use client';

import { Clock, RotateCcw, X, Save } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { useVersionHistory } from '../hooks/use-version-history';

export function VersionHistory({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { versions, loading, desc, setDesc, creating, createVersion, restoreVersion, flowId } = useVersionHistory(open, onClose);

  if (!open) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-border z-30 flex flex-col shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Version History</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-accent">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="px-4 py-3 border-b border-border space-y-2">
        <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="Version description..."
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={createVersion} disabled={creating || !flowId}
          className={cn('w-full flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90', (creating || !flowId) && 'opacity-50 pointer-events-none')}>
          <Save className="h-3 w-3" />{creating ? 'Saving...' : 'Save Version'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {loading && <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>}
        {!loading && versions.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No versions yet</p>}
        {versions.map((v) => (
          <div key={v.id} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent group">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">v{v.version}</p>
              {v.description && <p className="text-[10px] text-muted-foreground truncate">{v.description}</p>}
              <p className="text-[10px] text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={() => restoreVersion(v.version)} title="Restore"
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 text-primary">
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
