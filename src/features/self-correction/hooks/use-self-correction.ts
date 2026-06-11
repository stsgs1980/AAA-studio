import { useState, useEffect, useCallback } from 'react';
import type { Session } from '../components/session-list';

export function useSelfCorrection() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/self-correction?limit=20');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.data?.sessions || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const run = useCallback(async () => {
    if (!input.trim() || running) return;
    setRunning(true);
    try {
      const res = await fetch('/api/self-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });
      if (res.ok) {
        const result = await res.json();
        const session = result.data as Session;
        setSessions(prev => [session, ...prev]);
        setSelected(session);
        setInput('');
      }
    } catch { /* ignore */ } finally { setRunning(false); }
  }, [input, running]);

  const selectSession = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/self-correction/${id}`);
      if (res.ok) { const data = await res.json(); setSelected(data.data as Session); }
    } catch { /* keep selected as-is */ }
  }, []);

  return { sessions, selected, input, loading, running, run, selectSession, setInput };
}