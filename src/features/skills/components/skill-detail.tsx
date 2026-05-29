"use client";

import { Code2, TestTube2, Shield, Download } from "lucide-react";
import { cn } from "@stsgs/ui";
import { CodeBlock } from "@/components/code-block";
import { useSkillStore } from "../store/skills-store";
import { StandardsPicker } from "./standards-picker";

const TABS = ["info", "code", "tests", "standards"] as const;

export function SkillDetail() {
  const { selected, tab, setTab, saveSkill } = useSkillStore();

  return (
    <div className="rounded-xl border border-midnight-border bg-midnight-card overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-midnight-border bg-midnight-base/50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary truncate">
          {selected ? selected.name : "Select a skill"}
        </h2>
        {selected && (
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("px-2 py-1 rounded text-xs font-medium transition-colors",
                  tab === t ? "bg-brand-accent text-white" : "text-text-muted hover:text-text-secondary hover:bg-midnight-elevated")}>
                {t === "code" && <Code2 className="h-3 w-3 inline mr-1" />}
                {t === "tests" && <TestTube2 className="h-3 w-3 inline mr-1" />}
                {t === "standards" && <Shield className="h-3 w-3 inline mr-1" />}
                {t}
              </button>
            ))}
            <button onClick={saveSkill}
              className="px-2 py-1 rounded bg-brand-accent text-white text-xs font-medium ml-2 hover:bg-brand-accent/90">Save</button>
            <a href={`/api/skills/${selected.id}/export`} download
              className="px-2 py-1 rounded border border-midnight-border text-xs font-medium ml-1 text-text-secondary hover:bg-midnight-elevated transition-colors inline-flex items-center gap-1">
              <Download className="h-3 w-3" /> Export
            </a>
          </div>
        )}
      </div>
      <div className="flex-1 p-4">
        {selected ? <TabContent /> : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">Select a skill to view</div>
        )}
      </div>
    </div>
  );
}

function TabContent() {
  const { selected, tab, updateSelected } = useSkillStore();
  if (!selected) return null;

  if (tab === "info") return <InfoTab skill={selected} />;
  if (tab === "code") return (
    <textarea value={selected.code} onChange={(e) => updateSelected({ code: e.target.value })}
      className="w-full h-full min-h-[300px] p-3 rounded-lg border border-midnight-border bg-midnight-base text-sm font-mono text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
      placeholder="Write skill code here..." />
  );
  if (tab === "tests") return (
    <textarea value={selected.tests} onChange={(e) => updateSelected({ tests: e.target.value })}
      className="w-full h-full min-h-[300px] p-3 rounded-lg border border-midnight-border bg-midnight-base text-sm font-mono text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
      placeholder="Write tests here..." />
  );
  return <StandardsPicker />;
}

function InfoTab({ skill }: { skill: { category: string; description: string; tags: string[]; inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown> } }) {
  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs text-text-muted">Category</span>
        <p className="text-sm text-text-primary mt-0.5">{skill.category}</p>
      </div>
      <div>
        <span className="text-xs text-text-muted">Description</span>
        <p className="text-sm text-text-secondary mt-0.5">{skill.description || "No description"}</p>
      </div>
      <div>
        <span className="text-xs text-text-muted">Tags</span>
        <div className="flex gap-1 mt-1">
          {skill.tags.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-midnight-elevated text-text-muted">{t}</span>
          ))}
        </div>
      </div>
      <div>
        <span className="text-xs text-text-muted">Input Schema</span>
        <CodeBlock code={JSON.stringify(skill.inputSchema, null, 2)} language="json" title="inputSchema" maxLines={20} className="mt-1" />
      </div>
      <div>
        <span className="text-xs text-text-muted">Output Schema</span>
        <CodeBlock code={JSON.stringify(skill.outputSchema, null, 2)} language="json" title="outputSchema" maxLines={20} className="mt-1" />
      </div>
    </div>
  );
}
