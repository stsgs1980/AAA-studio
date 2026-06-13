'use client';

import { useState, useEffect, useMemo } from 'react';

export interface ExecutionRecord {
  id: string;
  status: string;
  duration: number | null;
  tokensUsed: number | null;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

export function useAgentExecutions(agentId: string | null) {
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!agentId) {
      setExecutions([]);
      return;
    }
    setLoading(true);
    fetch(`/api/agents/${agentId}?executions=true`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.executions) setExecutions(data.executions);
        else setExecutions([]);
      })
      .catch(() => setExecutions([]))
      .finally(() => setLoading(false));
  }, [agentId]);

  const successCount = useMemo(
    () => executions.filter((e) => e.status === 'completed').length,
    [executions],
  );

  const failCount = useMemo(
    () => executions.filter((e) => e.status === 'failed').length,
    [executions],
  );

  const avgDuration = useMemo(() => {
    const withDur = executions.filter((e) => e.duration !== null);
    if (withDur.length === 0) return null;
    return Math.round(withDur.reduce((s, e) => s + (e.duration ?? 0), 0) / withDur.length);
  }, [executions]);

  return { executions, loading, successCount, failCount, avgDuration };
}