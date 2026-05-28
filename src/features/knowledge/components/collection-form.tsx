'use client';

import { useCallback, useState } from 'react';
interface Props {
  onCreate: (data: { name: string; description: string }) => void;
}

export function CollectionForm({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
    setOpen(false);
  }, [name, description, onCreate]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        New Collection
      </button>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col gap-1 flex-1 max-w-xs">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name" className="h-9 px-3 rounded-md border bg-background text-sm" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="h-9 px-3 rounded-md border bg-background text-sm" />
      </div>
      <button onClick={handleSubmit} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Create</button>
      <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-md border text-sm hover:bg-accent">Cancel</button>
    </div>
  );
}
