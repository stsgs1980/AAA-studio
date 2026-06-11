"use client";

import { useWorkflowCreateForm } from "../hooks/use-workflow-create-form";
import { TRIGGER_TYPES } from "../types";

export function WorkflowCreateForm() {
  const { fields, setters, actions, canSubmit } = useWorkflowCreateForm();

  if (!fields.open) {
    return (
      <button
        onClick={actions.toggleOpen}
        className="w-full border border-dashed border-border rounded-lg p-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
      >
        + New Workflow
      </button>
    );
  }

  return (
    <form onSubmit={actions.submit} className="border border-border rounded-lg p-4 space-y-3">
      <input
        value={fields.name}
        onChange={(e) => setters.setName(e.target.value)}
        placeholder="Workflow name"
        className="w-full bg-background text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:border-primary"
        autoFocus
      />
      <textarea
        value={fields.description}
        onChange={(e) => setters.setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full bg-background text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:border-primary resize-none h-16"
      />
      <div className="flex items-center gap-2">
        <select
          value={fields.triggerType}
          onChange={(e) => setters.setTriggerType(e.target.value)}
          className="bg-background text-foreground text-sm border border-border rounded px-2 py-1 focus:outline-none focus:border-primary"
        >
          {TRIGGER_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          type="button"
          onClick={actions.toggleOpen}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded disabled:opacity-50"
        >
          Create
        </button>
      </div>
    </form>
  );
}