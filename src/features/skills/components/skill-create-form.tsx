"use client";

import { Plus, X } from "lucide-react";
import { useSkillCreateForm, CATEGORIES, COMPATS, LICENSES } from "../hooks/use-skill-create-form";

const fc = "w-full h-8 px-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const lc = "block text-xs text-muted-foreground mb-0.5";

export function SkillCreateForm() {
  const { fields, setters, actions, canSubmit } = useSkillCreateForm();

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">New Skill</span>
        <button onClick={actions.cancel} className="p-1 rounded hover:bg-accent"><X className="h-3.5 w-3.5" /></button>
      </div>
      {/* Required: Name */}
      <div><label className={lc}>Name *</label>
        <input value={fields.name} onChange={(e) => setters.setName(e.target.value)} className={fc} autoFocus
          placeholder="My Awesome Skill" onKeyDown={(e) => { if (e.key === "Enter") actions.submit(); }} />
      </div>
      {/* Row: Category + Compatibility */}
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lc}>Category</label>
          <select value={fields.category} onChange={(e) => setters.setCategory(e.target.value)} className={fc}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label className={lc}>Compatibility</label>
          <select value={fields.compatibility} onChange={(e) => setters.setCompatibility(e.target.value)} className={fc}>
            {COMPATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {/* Description */}
      <div><label className={lc}>Description</label>
        <input value={fields.description} onChange={(e) => setters.setDescription(e.target.value)} className={fc} placeholder="Short description for LLM selection" />
      </div>
      {/* Toggle expanded */}
      <button onClick={actions.toggleExpanded} className="text-[10px] text-primary hover:underline">
        {fields.expanded ? "Less options" : "More options (author, license, tags, triggers)"}
      </button>
      {fields.expanded && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className={lc}>Author</label><input value={fields.author} onChange={(e) => setters.setAuthor(e.target.value)} className={fc} placeholder="Your name" /></div>
            <div><label className={lc}>License</label>
              <select value={fields.license} onChange={(e) => setters.setLicense(e.target.value)} className={fc}>
                {LICENSES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div><label className={lc}>Tags (comma-separated)</label><input value={fields.tagsStr} onChange={(e) => setters.setTagsStr(e.target.value)} className={fc} placeholder="nlp, search, utility" /></div>
          <div><label className={lc}>Triggers (comma-separated)</label><input value={fields.triggersStr} onChange={(e) => setters.setTriggersStr(e.target.value)} className={fc} placeholder="onMessage, onSchedule" /></div>
        </div>
      )}
      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={actions.submit} disabled={!canSubmit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent/90 disabled:opacity-40">
          <Plus className="h-3.5 w-3.5" /> Create
        </button>
        <button onClick={actions.cancel} className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted text-xs">Cancel</button>
      </div>
    </div>
  );
}