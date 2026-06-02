"use client";

import { useState } from "react";
import { useSkillStore } from "../store/skills-store";

type S = {
  slug: string; version: string; skillId: string; category: string;
  description: string; longDescription: string; tags: string[]; triggers: string[];
  compatibility: string; author: string; license: string;
  inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown>;
  dependencies: { skillId: string; version: string }[];
  annotations: Record<string, boolean>;
};

export function SkillInfoEditor() {
  const { selected, updateSelected } = useSkillStore();
  if (!selected) return null;
  const s = selected as S;
  const u = (patch: Partial<S>) => updateSelected(patch);
  const fc = "w-full h-8 px-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
  const lc = "block text-xs text-muted-foreground mb-0.5";

  return (
    <div className="space-y-3 p-4 overflow-y-auto max-h-[70vh]">
      {/* Row: slug, version */}
      <div className="grid grid-cols-2 gap-3">
        <div><label className={lc}>Slug</label><input value={s.slug} onChange={(e) => u({ slug: e.target.value })} className={fc} /></div>
        <div><label className={lc}>Version</label><input value={s.version} onChange={(e) => u({ version: e.target.value })} className={fc} /></div>
      </div>
      {/* Row: skillId, category, compatibility */}
      <div className="grid grid-cols-3 gap-3">
        <div><label className={lc}>Skill ID</label><input value={s.skillId} onChange={(e) => u({ skillId: e.target.value })} className={fc} /></div>
        <div><label className={lc}>Category</label>
          <select value={s.category} onChange={(e) => u({ category: e.target.value })} className={fc}>
            {["general","code","data","security","communication","analysis"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label className={lc}>Compatibility</label>
          <select value={s.compatibility} onChange={(e) => u({ compatibility: e.target.value })} className={fc}>
            {["both","sandbox","local"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {/* Description */}
      <div><label className={lc}>Description</label>
        <input value={s.description} onChange={(e) => u({ description: e.target.value })} className={fc} placeholder="Short description for LLM selection" />
      </div>
      <div><label className={lc}>Full Description</label>
        <textarea value={s.longDescription} onChange={(e) => u({ longDescription: e.target.value })} rows={3} className={fc + " h-auto resize-y font-mono text-xs"} placeholder="Detailed description for SKILL.md body" />
      </div>
      {/* Author + License */}
      <div className="grid grid-cols-2 gap-3">
        <div><label className={lc}>Author</label><input value={s.author} onChange={(e) => u({ author: e.target.value })} className={fc} /></div>
        <div><label className={lc}>License</label>
          <select value={s.license} onChange={(e) => u({ license: e.target.value })} className={fc}>
            {["MIT","Apache-2.0","GPL-3.0","BSD-3-Clause","ISC","Unlicense"].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      {/* Tags + Triggers */}
      <TagsField label="Tags" values={s.tags} onChange={(tags) => u({ tags })} hint="Comma-separated" />
      <TagsField label="Triggers" values={s.triggers} onChange={(triggers) => u({ triggers })} hint="Comma-separated trigger names" />
      {/* Annotations */}
      <AnnotationsField annotations={s.annotations} onChange={(annotations) => u({ annotations })} />
      {/* Schemas */}
      <SchemaField label="Input Schema" value={s.inputSchema} onChange={(inputSchema) => u({ inputSchema })} />
      <SchemaField label="Output Schema" value={s.outputSchema} onChange={(outputSchema) => u({ outputSchema })} />
    </div>
  );
}

function TagsField({ label, values, onChange, hint }: { label: string; values: string[]; onChange: (v: string[]) => void; hint: string }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-0.5">{label}</label>
      <div className="flex gap-1 flex-wrap mb-1">
        {values.map((t) => (
          <span key={t} className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {t}<button onClick={() => onChange(values.filter((v) => v !== t))} className="hover:text-destructive">&times;</button>
          </span>
        ))}
      </div>
      <input placeholder={hint} className="w-full h-7 px-2 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget.value.trim()) { onChange([...values, e.currentTarget.value.trim()]); e.currentTarget.value = ""; } }} />
    </div>
  );
}

function AnnotationsField({ annotations, onChange }: { annotations: Record<string, boolean>; onChange: (v: Record<string, boolean>) => void }) {
  const keys = Object.keys(annotations);
  const toggle = (k: string) => onChange({ ...annotations, [k]: !annotations[k] });
  const add = (k: string) => { if (k && !Object.prototype.hasOwnProperty.call(annotations, k)) onChange({ ...annotations, [k]: false }); };
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-0.5">Annotations</label>
      {keys.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-1">
          {keys.map((k) => (
            <button key={k} onClick={() => toggle(k)} className={`text-[10px] px-2 py-0.5 rounded-full border ${annotations[k] ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-muted text-muted-foreground border-transparent"}`}>
              {k}: {String(annotations[k])}
            </button>
          ))}
        </div>
      )}
      <input placeholder="Add annotation key, Enter to add" className="w-full h-7 px-2 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget.value.trim()) { add(e.currentTarget.value.trim()); e.currentTarget.value = ""; } }} />
    </div>
  );
}

function SchemaField({ label, value, onChange }: { label: string; value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const start = () => { setText(JSON.stringify(value, null, 2)); setEditing(true); };
  const save = () => { try { onChange(JSON.parse(text)); setEditing(false); } catch { /* invalid json */ } };
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
        <button onClick={editing ? save : start} className="text-[10px] text-primary hover:underline">{editing ? "Apply" : "Edit JSON"}</button>
      </div>
      {editing ? (
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="w-full mt-0.5 p-2 rounded-md border border-border bg-background text-xs font-mono text-foreground resize-y focus:outline-none focus:ring-1 focus:ring-ring" />
      ) : (
        <pre className="mt-0.5 text-[10px] text-muted-foreground max-h-24 overflow-auto rounded bg-muted/30 p-2">{JSON.stringify(value, null, 2)}</pre>
      )}
    </div>
  );
}
