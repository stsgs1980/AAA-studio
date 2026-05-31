'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { useRealtimeEvent } from '@/lib/ws/use-realtime';

interface Approval {
  id: string;
  action: string;
  actionType: string;
  riskLevel: string;
  status: string;
  payload: Record<string, unknown>;
  createdAt: string;
  expiresAt: string | null;
}

const RISK_COLORS: Record<string, string> = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
  critical: 'text-red-600',
};

export function ApprovalPanel() {
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

  if (!loading && approvals.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />Pending Approvals
        </h3>
        <p className="text-xs text-muted-foreground text-center py-4">No pending approvals</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        Pending Approvals
        <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">{approvals.length}</span>
      </h3>
      {loading ? <p className="text-xs text-muted-foreground text-center py-4">Loading...</p> : (
        <div className="space-y-2">
          {approvals.map((a) => (
            <div key={a.id} className="rounded-md border border-border p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{a.action}</p>
                  <p className="text-[10px] text-muted-foreground">{a.actionType} · <span className={RISK_COLORS[a.riskLevel] ?? ''}>{a.riskLevel}</span></p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(a.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(a.id, 'approved')}
                  className={cn('flex-1 flex items-center justify-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-emerald-600 text-white hover:bg-emerald-700')}>
                  <Check className="h-3 w-3" />Approve
                </button>
                <button onClick={() => handleAction(a.id, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-red-600 text-white hover:bg-red-700">
                  <X className="h-3 w-3" />Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
