import { useState, useEffect, useCallback } from 'react';

export interface Agent {
  id: string;
  name: string;
  role: string;
  roleGroup: string;
  status: string;
}

export function useTeamData(agentId: string) {
  const [children, setChildren] = useState<Agent[]>([]);
  const [available, setAvailable] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents?parentId=${agentId}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setChildren(data.data?.agents || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [agentId]);

  const fetchAvailable = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const all: Agent[] = data.data?.agents || [];
        const childIds = new Set(children.map(c => c.id));
        setAvailable(all.filter(a => a.id !== agentId && !childIds.has(a.id)));
      }
    } catch { /* ignore */ }
  }, [agentId, children]);

  useEffect(() => {
    fetchChildren();
    fetchAvailable();
  }, [fetchChildren, fetchAvailable]);

  const addChild = useCallback(async (childId: string) => {
    try {
      const res = await fetch(`/api/agents/${childId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: agentId }),
      });
      if (res.ok) {
        setAvailable(prev => {
          const agent = prev.find(a => a.id === childId);
          if (agent) setChildren(c => [...c, agent]);
          return prev.filter(a => a.id !== childId);
        });
      }
    } catch { /* ignore */ }
  }, [agentId]);

  const removeChild = useCallback(async (childId: string) => {
    try {
      const res = await fetch(`/api/agents/${childId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: null }),
      });
      if (res.ok) {
        setChildren(prev => {
          const agent = prev.find(a => a.id === childId);
          if (agent) setAvailable(a2 => [...a2, agent]);
          return prev.filter(a => a.id !== childId);
        });
      }
    } catch { /* ignore */ }
  }, []);

  const refetch = useCallback(() => {
    fetchChildren();
    fetchAvailable();
  }, [fetchChildren, fetchAvailable]);

  return { children, available, loading, addChild, removeChild, refetch };
}