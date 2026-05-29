'use client';

import { useEffect, useState } from 'react';
import { useSkillStore } from '../store/skills-store';
import { Plus } from 'lucide-react';

export function StandardsPicker() {
  const { selected, addStandardId, removeStandardId } = useSkillStore();
  const [standards, setStandards] = useState<{ id: string; name: string; category: string }[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/standards');
        if (res.ok) setStandards(await res.json());
      } catch { /* */ }
    })();
  }, []);

  const linkedIds = selected?.standardIds ?? [];
  const filtered = query.trim()
    ? standards.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : standards;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Link standards this skill conforms to. Standards define rules and patterns for skill implementation.
      </p>
      <input value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search standards..." className="w-full h-8 px-2 rounded-md border bg-background text-sm" />

      {/* Linked standards */}
      {linkedIds.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Linked ({linkedIds.length})</span>
          {linkedIds.map((id) => {
            const std = standards.find((s) => s.id === id);
            return (
              <div key={id} className="flex items-center justify-between px-2 py-1 rounded-md border bg-primary/5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{std?.name ?? id}</span>
                  {std && <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">{std.category}</span>}
                </div>
                <button onClick={() => removeStandardId(id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Available standards */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Available</span>
        <div className="divide-y max-h-[40vh] overflow-y-auto">
          {filtered.filter((s) => !linkedIds.includes(s.id)).map((s) => (
            <div key={s.id} className="flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent/50 rounded">
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">{s.name}</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground shrink-0">{s.category}</span>
              </div>
              <button onClick={() => addStandardId(s.id)} className="shrink-0 p-0.5 rounded hover:bg-primary/20 text-primary">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-xs text-muted-foreground p-2">No standards found.</p>}
        </div>
      </div>
    </div>
  );
}
