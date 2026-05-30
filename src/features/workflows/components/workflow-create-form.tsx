"use client";

import { useState } from "react";
import { useWorkflowStore } from "../hooks/use-workflow-store";
import { TRIGGER_TYPES } from "../types";

export function WorkflowCreateForm() {
  const { createWorkflow } = useWorkflowStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createWorkflow({ name: name.trim(), description: description.trim(), triggerType });
    setName("");
    setDescription("");
    setTriggerType("manual");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-dashed border-border rounded-lg p-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
      >
        + New Workflow
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Workflow name"
        className="w-full bg-transparent text-sm border border-border rounded px-3 py-2 focus:outline-none focus:border-primary"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full bg-transparent text-sm border border-border rounded px-3 py-2 focus:outline-none focus:border-primary resize-none h-16"
      />
      <div className="flex items-center gap-2">
        <select
          value={triggerType}
          onChange={(e) => setTriggerType(e.target.value)}
          className="bg-transparent text-sm border border-border rounded px-2 py-1 focus:outline-none focus:border-primary"
        >
          {TRIGGER_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded disabled:opacity-50"
        >
          Create
        </button>
      </div>
    </form>
  );
}
