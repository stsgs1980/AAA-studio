"use client";

import { useEffect } from "react";
import { WorkflowList, WorkflowCreateForm, useWorkflowStore } from "@/features/workflows";
import { useLanguage } from "@/lib/i18n/language-context";

export default function WorkflowsPage() {
  const { fetchWorkflows } = useWorkflowStore();
  const { t } = useLanguage();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.pages['Workflows']}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.pages['Orchestrate multi-step agent workflows']}
        </p>
      </div>

      <WorkflowCreateForm />
      <WorkflowList />
    </div>
  );
}
