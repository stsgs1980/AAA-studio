'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useSkillExport() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const download = useCallback(async (format: string) => {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/skills/export-formats?format=${format}`);
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skills-${format}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

  return { open, loading, ref, download, toggleOpen };
}
