"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SEVERITY_OPTIONS } from "@stsgs/shared";

interface CreateStandardFormProps {
  onCreate: (name: string, severity: string) => void;
  onClose: () => void;
}

export function CreateStandardForm({ onCreate, onClose }: CreateStandardFormProps) {
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState("info");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), severity);
    setName("");
  };

  return (
    <div className="flex items-end gap-2 rounded-xl border border-midnight-border bg-midnight-card p-3">
      <div className="flex-1">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Standard name"
          className="w-full h-9 px-3 rounded-lg border border-midnight-border bg-midnight-base text-sm text-text-primary placeholder:text-text-muted"
          autoFocus
        />
      </div>
      <select
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
        className="h-9 px-3 rounded-lg border border-midnight-border bg-midnight-base text-sm text-text-primary"
      >
        {SEVERITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button
        onClick={handleCreate}
        disabled={!name.trim()}
        className="h-9 px-4 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90 disabled:opacity-40 disabled:pointer-events-none"
      >
        Create
      </button>
      <button
        onClick={onClose}
        className="p-2 rounded-lg border border-midnight-border text-text-secondary hover:bg-midnight-elevated"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
