'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

interface EntityPickerProps {
  entityType: 'skill' | 'standard';
  linked: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export function EntityPicker({ entityType, linked, onAdd, onRemove }: EntityPickerProps) {
  const [items, setItems] = useState<{ id: string; name: string; category: string }[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/${entityType}s`);
        if (res.ok) setItems(await res.json());
      } catch { /* */ }
    })();
  }, [entityType]);

  const filtered = query.trim()
    ? items.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) && !linked.includes(s.id))
    : items.filter((s) => !linked.includes(s.id));

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {linked.length === 0 && (
          <span className="text-[10px] text-muted-foreground">None assigned</span>
        )}
        {linked.map((id) => {
          const item = items.find((s) => s.id === id);
          return (
            <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border bg-primary/5">
              {item?.name ?? id}
              <button onClick={() => onRemove(id)} className="text-muted-foreground hover:text-destructive">&times;</button>
            </span>
          );
        })}
      </div>
      {open ? (
        <div className="border rounded-md p-2 space-y-1.5 bg-background">
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${entityType}s...`}
            className="w-full h-7 px-2 rounded border bg-background text-xs" autoFocus />
          <div className="max-h-28 overflow-y-auto divide-y">
            {filtered.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-1 text-xs hover:bg-accent/50 rounded">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate">{s.name}</span>
                  <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground shrink-0">{s.category}</span>
                </div>
                <button onClick={() => onAdd(s.id)} className="shrink-0 p-0.5 hover:bg-primary/20 rounded text-primary">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-[10px] text-muted-foreground p-1">No results</p>}
          </div>
          <button onClick={() => setOpen(false)} className="text-[10px] text-muted-foreground hover:text-foreground">Close</button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="text-[10px] text-primary hover:underline">+ Add {entityType}s</button>
      )}
    </div>
  );
}
