"use client";

import { cn } from "@stsgs/ui";
import { SEVERITY_OPTIONS, STANDARD_CATEGORIES } from "@stsgs/shared";

const SEV_BG: Record<string, string> = {
  error: "bg-brand-red/15 text-brand-red",
  warning: "bg-brand-amber/15 text-brand-amber",
  info: "bg-brand-accent/15 text-brand-accent",
};

interface EditStandardFormProps {
  name: string;
  category: string;
  description: string;
  severity: string;
  onNameChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSeverityChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditStandardForm({
  name, category, description, severity,
  onNameChange, onCategoryChange, onDescriptionChange, onSeverityChange,
  onSave, onCancel,
}: EditStandardFormProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-3 bg-background/30">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Name</label>
          <input value={name} onChange={(e) => onNameChange(e.target.value)} className="w-full h-8 px-2 mt-1 rounded-md border border-border bg-card text-sm text-foreground" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Category</label>
          <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="w-full h-8 px-2 mt-1 rounded-md border border-border bg-card text-sm text-foreground">
            {STANDARD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Description</label>
        <textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} rows={2} className="w-full px-2 py-1.5 mt-1 rounded-md border border-border bg-card text-sm text-foreground resize-none" />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Severity</label>
        <div className="flex gap-2 mt-1">
          {SEVERITY_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => onSeverityChange(o.value)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors", severity === o.value ? SEV_BG[o.value] : "bg-muted text-muted-foreground hover:text-foreground")}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-md text-xs border border-border text-muted-foreground hover:bg-muted">Cancel</button>
        <button onClick={onSave} className="px-4 py-1.5 rounded-md text-xs bg-brand-accent text-white hover:bg-brand-accent/90 font-medium">Save</button>
      </div>
    </div>
  );
}
