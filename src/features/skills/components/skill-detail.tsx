"use client";

import { Code2, TestTube2, Shield, Download, Files, FileArchive } from "lucide-react";
import { cn } from "@stsgs/ui";
import { CodeBlock } from "@/components/code-block";
import { useSkillStore } from "../store/skills-store";
import { StandardsPicker } from "./standards-picker";
import { SkillFileTree } from "./skill-file-tree";
import { SkillFileEditor } from "./skill-file-editor";
import { useEffect } from "react";

const TABS = ["info", "code", "tests", "files", "standards"] as const;

export function SkillDetail() {
  const { selected, tab, setTab, saveSkill } = useSkillStore();

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-border bg-background/50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground truncate">
          {selected ? selected.name : "Select a skill"}
        </h2>
        {selected && (
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("px-2 py-1 rounded text-xs font-medium transition-colors",
                  tab === t ? "bg-brand-accent text-white" : "text-muted-foreground hover:text-muted-foreground hover:bg-muted")}>
                {t === "code" && <Code2 className="h-3 w-3 inline mr-1" />}
                {t === "tests" && <TestTube2 className="h-3 w-3 inline mr-1" />}
                {t === "files" && <Files className="h-3 w-3 inline mr-1" />}
                {t === "standards" && <Shield className="h-3 w-3 inline mr-1" />}
                {t}
              </button>
            ))}
            <button onClick={saveSkill}
              className="px-2 py-1 rounded bg-brand-accent text-white text-xs font-medium ml-2 hover:bg-brand-accent/90">Save</button>
            <a href={`/api/skills/${selected.id}/export`} download
              className="px-2 py-1 rounded border border-border text-xs font-medium ml-1 text-muted-foreground hover:bg-muted transition-colors inline-flex items-center gap-1">
              <Download className="h-3 w-3" /> MD
            </a>
            <a href={`/api/skills/${selected.id}/export-zip`} download
              className="px-2 py-1 rounded border border-border text-xs font-medium ml-1 text-muted-foreground hover:bg-muted transition-colors inline-flex items-center gap-1">
              <FileArchive className="h-3 w-3" /> ZIP
            </a>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {selected ? <TabContent /> : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Select a skill to view</div>
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
      className="w-full h-full min-h-[300px] p-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
      placeholder="Write skill code here..." />
  );
  if (tab === "tests") return (
    <textarea value={selected.tests} onChange={(e) => updateSelected({ tests: e.target.value })}
      className="w-full h-full min-h-[300px] p-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
      placeholder="Write tests here..." />
  );
  if (tab === "files") return <FilesTab />;
  return <StandardsPicker />;
}

function FilesTab() {
  const { selected, fetchFiles, filesLoading } = useSkillStore();

  useEffect(() => {
    if (selected) fetchFiles(selected.id);
  }, [selected?.id]);

  if (filesLoading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading files...</div>;
  }

  return (
    <div className="flex h-full min-h-[400px]">
      <div className="w-56 shrink-0 border-r border-border bg-background/30 overflow-y-auto">
        <SkillFileTree />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <SkillFileEditor />
      </div>
    </div>
  );
}

function InfoTab({ skill }: { skill: { category: string; description: string; tags: string[]; inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown> } }) {
  return (
    <div className="space-y-3 p-4">
      <div>
        <span className="text-xs text-muted-foreground">Category</span>
        <p className="text-sm text-foreground mt-0.5">{skill.category}</p>
      </div>
      <div>
        <span className="text-xs text-muted-foreground">Description</span>
        <p className="text-sm text-muted-foreground mt-0.5">{skill.description || "No description"}</p>
      </div>
      <div>
        <span className="text-xs text-muted-foreground">Tags</span>
        <div className="flex gap-1 mt-1">
          {skill.tags.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>
      <div>
        <span className="text-xs text-muted-foreground">Input Schema</span>
        <CodeBlock code={JSON.stringify(skill.inputSchema, null, 2)} language="json" title="inputSchema" maxLines={20} className="mt-1" />
      </div>
      <div>
        <span className="text-xs text-muted-foreground">Output Schema</span>
        <CodeBlock code={JSON.stringify(skill.outputSchema, null, 2)} language="json" title="outputSchema" maxLines={20} className="mt-1" />
      </div>
    </div>
  );
}
