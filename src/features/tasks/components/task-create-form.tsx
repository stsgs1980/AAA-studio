"use client";

import { useState } from "react";
import { useTaskStore } from "../hooks/use-task-store";
import { TASK_PRIORITIES } from "../types";

export function TaskCreateForm() {
  const { createTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask({ title: title.trim(), description: description.trim(), priority });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-dashed border-border rounded-lg p-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
      >
        + New Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
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
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-transparent text-sm border border-border rounded px-2 py-1 focus:outline-none focus:border-primary"
        >
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
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
          disabled={!title.trim()}
          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded disabled:opacity-50"
        >
          Create
        </button>
      </div>
    </form>
  );
}
