"use client";

import { useState } from "react";
import { useWorkflowStore } from "../hooks/use-workflow-store";
import type { Workflow } from "../types";

export function WorkflowList() {
  const { workflows, loading, executeWorkflow, deleteWorkflow } = useWorkflowStore();
  const [runningId, setRunningId] = useState<string | null>(null);

  if (loading && workflows.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Loading workflows...</div>;
  }

  if (workflows.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No workflows yet. Create one to orchestrate agents.
      </div>
    );
  }

  const handleRun = async (wf: Workflow) => {
    setRunningId(wf.id);
    try {
      await executeWorkflow(wf.id);
    } catch {
      // Workflow execution error handled silently
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-2">
      {workflows.map((wf: Workflow) => (
        <div
          key={wf.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{wf.name}</p>
            {wf.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{wf.description}</p>
            )}
          </div>

          <span className="text-xs bg-muted px-2 py-0.5 rounded">
            {wf._count?.steps ?? 0} steps
          </span>

          <span className="text-xs bg-muted px-2 py-0.5 rounded">
            {wf.triggerType}
          </span>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleRun(wf)}
              disabled={runningId === wf.id}
              className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded hover:bg-green-500/20 disabled:opacity-50"
            >
              {runningId === wf.id ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={() => deleteWorkflow(wf.id)}
              className="text-xs text-red-600 hover:text-red-400 px-1"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
