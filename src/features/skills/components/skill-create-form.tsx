"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useSkillStore } from "../store/skills-store";

const CATEGORIES = ["general", "code", "data", "security", "communication", "analysis"];
const COMPATS = ["both", "sandbox", "local"];
const LICENSES = ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "ISC", "Unlicense"];

export function SkillCreateForm() {
  const { createSkill, setShowNew } = useSkillStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [compatibility, setCompatibility] = useState("both");
  const [license, setLicense] = useState("MIT");
  const [author, setAuthor] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [triggersStr, setTriggersStr] = useState("");
  const [expanded, setExpanded] = useState(false);
  const fc = "w-full h-8 px-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
  const lc = "block text-xs text-muted-foreground mb-0.5";

  const submit = () => {
    if (!name.trim()) return;
    createSkill(name.trim(), {
      category, description, compatibility, license, author,
      tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
      triggers: triggersStr ? triggersStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">New Skill</span>
        <button onClick={() => setShowNew(false)} className="p-1 rounded hover:bg-accent"><X className="h-3.5 w-3.5" /></button>
      </div>
      {/* Required: Name */}
      <div><label className={lc}>Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={fc} autoFocus
          placeholder="My Awesome Skill" onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
      </div>
      {/* Row: Category + Compatibility */}
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lc}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={fc}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label className={lc}>Compatibility</label>
          <select value={compatibility} onChange={(e) => setCompatibility(e.target.value)} className={fc}>
            {COMPATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {/* Description */}
      <div><label className={lc}>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className={fc} placeholder="Short description for LLM selection" />
      </div>
      {/* Toggle expanded */}
      <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-primary hover:underline">
        {expanded ? "Less options" : "More options (author, license, tags, triggers)"}
      </button>
      {expanded && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className={lc}>Author</label><input value={author} onChange={(e) => setAuthor(e.target.value)} className={fc} placeholder="Your name" /></div>
            <div><label className={lc}>License</label>
              <select value={license} onChange={(e) => setLicense(e.target.value)} className={fc}>
                {LICENSES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div><label className={lc}>Tags (comma-separated)</label><input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className={fc} placeholder="nlp, search, utility" /></div>
          <div><label className={lc}>Triggers (comma-separated)</label><input value={triggersStr} onChange={(e) => setTriggersStr(e.target.value)} className={fc} placeholder="onMessage, onSchedule" /></div>
        </div>
      )}
      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={submit} disabled={!name.trim()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent/90 disabled:opacity-40">
          <Plus className="h-3.5 w-3.5" /> Create
        </button>
        <button onClick={() => setShowNew(false)} className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted text-xs">Cancel</button>
      </div>
    </div>
  );
}
