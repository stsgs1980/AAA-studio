'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRealtimeEvent } from '@/lib/ws/use-realtime';

export interface Approval {
  id: string;
  action: string;
  actionType: string;
  riskLevel: string;
  status: string;
  payload: Record<string, unknown>;
  createdAt: string;
  expiresAt: string | null;
}

export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch('/api/approvals?status=pending');
      if (res.ok) setApprovals(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  // Initial load + fallback polling (10s)
  useEffect(() => {
    fetchApprovals();
    const i = setInterval(fetchApprovals, 10000);
    return () => clearInterval(i);
  }, [fetchApprovals]);

  // Real-time: new approval pushed via WS
  useRealtimeEvent<{ id: string; action: string; riskLevel: string }>(
    ['approvals'], 'new',
    (data) => {
      setApprovals((prev) => {
        if (prev.some((a) => a.id === data.id)) return prev;
        return [...prev, {
          id: data.id, action: data.action, actionType: 'hitl',
          riskLevel: data.riskLevel, status: 'pending',
          payload: {}, createdAt: new Date().toISOString(), expiresAt: null,
        }];
      });
    },
  );

  // Real-time: approval decided via WS
  useRealtimeEvent<{ id: string; status: 'approved' | 'rejected' }>(
    ['approvals'], 'decided',
    (data) => setApprovals((prev) => prev.filter((a) => a.id !== data.id)),
  );

  const handleAction = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, respondedBy: 'admin' }),
      });
      if (res.ok) setApprovals((prev) => prev.filter((a) => a.id !== id));
    } catch { /* ignore */ }
  }, []);

  return { approvals, loading, handleAction };
}
