import { useCallback, useEffect, useState } from "react";
import type { Flow, Execution } from "../types";

interface PipelineState {
  flows: Flow[];
  executions: Execution[];
  selectedFlow: string | null;
  selectedExec: string | null;
  loading: boolean;
  running: boolean;
}

export function usePipelines() {
  const [state, setState] = useState<PipelineState>({
    flows: [], executions: [], selectedFlow: null, selectedExec: null,
    loading: true, running: false,
  });

  const fetchFlows = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true }));
      const res = await fetch("/api/flows");
      if (!res.ok) throw new Error();
      const flows: Flow[] = await res.json();
      setState((s) => ({ ...s, flows, loading: false }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const fetchExecutions = useCallback(async (flowId: string | null) => {
    if (!flowId) { setState((s) => ({ ...s, executions: [], selectedExec: null })); return; }
    try {
      const res = await fetch(`/api/flows/${flowId}/executions`);
      if (!res.ok) throw new Error();
      const executions: Execution[] = await res.json();
      setState((s) => ({ ...s, executions }));
    } catch {
      setState((s) => ({ ...s, executions: [] }));
    }
  }, []);

  const selectFlow = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedFlow: id, selectedExec: null }));
  }, []);

  const selectExec = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedExec: id }));
  }, []);

  const executeFlow = useCallback(async (flowId: string) => {
    setState((s) => ({ ...s, running: true }));
    try {
      const res = await fetch(`/api/flows/${flowId}/execute`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.executionId) {
        setState((s) => ({ ...s, selectedExec: data.executionId }));
      }
      await fetchExecutions(flowId);
    } catch {
      // execution failed -- refresh will show error status
    } finally {
      setState((s) => ({ ...s, running: false }));
    }
  }, [fetchExecutions]);

  const deleteFlow = useCallback(async (flowId: string) => {
    if (!confirm("Delete this flow and all its executions?")) return;
    try {
      const res = await fetch(`/api/flows/${flowId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setState((s) => ({
        ...s,
        selectedFlow: s.selectedFlow === flowId ? null : s.selectedFlow,
        selectedExec: null,
      }));
      await fetchFlows();
    } catch { /* silent */ }
  }, [fetchFlows]);

  useEffect(() => { fetchFlows(); }, [fetchFlows]);
  useEffect(() => {
    fetchExecutions(state.selectedFlow);
  }, [state.selectedFlow, fetchExecutions]);

  return { ...state, selectFlow, selectExec, executeFlow, deleteFlow };
}
