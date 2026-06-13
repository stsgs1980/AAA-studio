'use client';

import { useState, useCallback, useEffect } from 'react';

export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  details: string | null;
  timestamp: string;
}

export function useAuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter ? `?entityType=${filter}` : '';
      const res = await fetch(`/api/audit${params}`);
      if (!res.ok) throw new Error();
      setLogs(await res.json());
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const refresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, filter, setFilter, loading, fetchLogs, refresh };
}