"use client";

import { useEffect } from "react";
import { WorkflowList, WorkflowCreateForm, useWorkflowStore } from "@/features/workflows";

export default function WorkflowsPage() {
  const { fetchWorkflows } = useWorkflowStore();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workflows</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Orchestrate multi-step agent workflows
        </p>
      </div>

      <WorkflowCreateForm />
      <WorkflowList />
    </div>
  );
}
