"use client";

import { cn } from "@stsgs/ui";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useStandardsStore } from "../store/standards-store";
import { EditStandardForm } from "./edit-standard-form";

const SEV_BG: Record<string, string> = {
  error: "bg-brand-red/15 text-brand-red",
  warning: "bg-brand-amber/15 text-brand-amber",
  info: "bg-brand-accent/15 text-brand-accent",
};

export function StandardDetail() {
  const standard = useStandardsStore((s) => {
    const sel = s.selectedId;
    return s.standards.find((st) => st.id === sel) ?? null;
  });
  const editForm = useStandardsStore((s) => s.editForm);
  const newRule = useStandardsStore((s) => s.newRule);

  const startEdit = useStandardsStore((s) => s.startEdit);
  const cancelEdit = useStandardsStore((s) => s.cancelEdit);
  const saveStandard = useStandardsStore((s) => s.saveStandard);
  const setNewRule = useStandardsStore((s) => s.setNewRule);
  const addRule = useStandardsStore((s) => s.addRule);
  const toggleRule = useStandardsStore((s) => s.toggleRule);
  const removeRule = useStandardsStore((s) => s.removeRule);

  if (!standard) {
    return (
      <div className="rounded-xl border border-midnight-border bg-midnight-card overflow-hidden">
        <div className="px-4 py-2 border-b border-midnight-border bg-midnight-base/50">
          <h2 className="text-sm font-semibold text-text-primary">Standard Details</h2>
        </div>
        <div className="flex items-center justify-center h-40 text-text-muted text-sm">Select a standard to view</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-midnight-border bg-midnight-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-midnight-border bg-midnight-base/50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary truncate">{standard.name}</h2>
        {!editForm && (
          <button onClick={startEdit} className="text-[11px] text-brand-accent hover:text-brand-accent/80 font-medium">Edit</button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Edit or badges */}
        {editForm ? (
          <EditStandardForm
            name={editForm.name} category={editForm.category}
            description={editForm.description} severity={editForm.severity}
            onNameChange={(v) => useStandardsStore.getState().patchEditForm({ name: v })}
            onCategoryChange={(v) => useStandardsStore.getState().patchEditForm({ category: v })}
            onDescriptionChange={(v) => useStandardsStore.getState().patchEditForm({ description: v })}
            onSeverityChange={(v) => useStandardsStore.getState().patchEditForm({ severity: v })}
            onSave={saveStandard} onCancel={cancelEdit}
          />
        ) : (
          <div className="flex flex-wrap gap-3 text-sm">
            <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", SEV_BG[standard.severity])}>{standard.severity}</span>
            <span className="text-[11px] text-text-muted">v{standard.version}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-midnight-elevated text-text-muted">{standard.category}</span>
          </div>
        )}

        {standard.description && !editForm && (
          <p className="text-sm text-text-secondary">{standard.description}</p>
        )}

        {/* Rules */}
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">
            Rules ({standard.rules.length})
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <input value={newRule} onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRule()}
              placeholder="Add a rule..."
              className="flex-1 h-8 px-3 rounded-md border border-midnight-border bg-midnight-card text-sm text-text-primary placeholder:text-text-muted" />
            <button onClick={addRule} disabled={!newRule.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent/90 disabled:opacity-40 disabled:pointer-events-none">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          {standard.rules.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">No rules yet. Add one above.</p>
          ) : (
            <div className="divide-y divide-midnight-border rounded-lg border border-midnight-border overflow-hidden">
              {standard.rules.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 group hover:bg-midnight-base/30 transition-colors">
                  <GripVertical className="h-3.5 w-3.5 text-text-muted/30 shrink-0" />
                  <button onClick={() => toggleRule(r.id)}
                    className={cn("h-4 w-4 rounded border-2 transition-colors shrink-0",
                      r.enabled ? "bg-brand-accent border-brand-accent" : "border-midnight-border hover:border-text-muted")} />
                  <span className={cn("text-sm flex-1", !r.enabled && "text-text-muted line-through")}>{r.description}</span>
                  <button onClick={() => removeRule(r.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-brand-red/15 hover:text-brand-red transition-all">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
