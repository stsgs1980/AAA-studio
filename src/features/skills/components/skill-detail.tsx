"use client";

import { Code2, TestTube2, Shield, Download, Files, FileArchive, CheckCircle } from "lucide-react";
import { cn } from "@stsgs/ui";
import { useSkillStore } from "../store/skills-store";
import { SkillInfoEditor } from "./skill-info-editor";
import { SkillFileTree } from "./skill-file-tree";
import { SkillFileEditor } from "./skill-file-editor";
import { StandardsPicker } from "./standards-picker";
import { ValidateTab } from "./validate-tab";
import { useEffect } from "react";

const TABS = ["info", "code", "tests", "files", "standards", "validate"] as const;
const TAB_ICONS: Record<string, React.ElementType> = { code: Code2, tests: TestTube2, files: Files, standards: Shield, validate: CheckCircle };

export function SkillDetail() {
  const { selected, tab, setTab, saveSkill } = useSkillStore();
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-border bg-background/50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground truncate">{selected ? selected.name : "Select a skill"}</h2>
        {selected && (
          <div className="flex gap-1">
            {TABS.map((t) => { const Icon = TAB_ICONS[t]; return (
              <button key={t} onClick={() => setTab(t)}
                className={cn("px-2 py-1 rounded text-xs font-medium transition-colors", tab === t ? "bg-brand-accent text-white" : "text-muted-foreground hover:bg-muted")}>
                {Icon && <Icon className="h-3 w-3 inline mr-1" />}{t}
              </button>
            ); })}
            <button onClick={saveSkill} className="px-2 py-1 rounded bg-brand-accent text-white text-xs font-medium ml-2 hover:bg-brand-accent/90">Save</button>
            <a href={`/api/skills/${selected.id}/export`} download className="px-2 py-1 rounded border border-border text-xs font-medium ml-1 text-muted-foreground hover:bg-muted transition-colors inline-flex items-center gap-1"><Download className="h-3 w-3" /> MD</a>
            <a href={`/api/skills/${selected.id}/export-zip`} download className="px-2 py-1 rounded border border-border text-xs font-medium ml-1 text-muted-foreground hover:bg-muted transition-colors inline-flex items-center gap-1"><FileArchive className="h-3 w-3" /> ZIP</a>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {selected ? <TabContent /> : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Select a skill to view</div>}
      </div>
    </div>
  );
}

function TabContent() {
  const { selected, tab, updateSelected } = useSkillStore();
  if (!selected) return null;
  const taCls = "w-full h-full min-h-[300px] p-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent/30";
  if (tab === "info") return <SkillInfoEditor />;
  if (tab === "code") return <textarea value={selected.code} onChange={(e) => updateSelected({ code: e.target.value })} className={taCls} placeholder="Write skill code here..." />;
  if (tab === "tests") return <textarea value={selected.tests} onChange={(e) => updateSelected({ tests: e.target.value })} className={taCls} placeholder="Write tests here..." />;
  if (tab === "files") return <FilesTab />;
  if (tab === "validate") return <ValidateTab />;
  return <StandardsPicker />;
}

function FilesTab() {
  const { selected, fetchFiles, filesLoading } = useSkillStore();
  useEffect(() => { if (selected) fetchFiles(selected.id); }, [selected?.id]);
  if (filesLoading) return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading files...</div>;
  return (
    <div className="flex h-full min-h-[400px]">
      <div className="w-56 shrink-0 border-r border-border bg-background/30 overflow-y-auto"><SkillFileTree /></div>
      <div className="flex-1 overflow-y-auto p-3"><SkillFileEditor /></div>
    </div>
  );
}
