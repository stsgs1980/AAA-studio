"use client";

import { Save, FileCode } from "lucide-react";
import { cn } from "@stsgs/ui";
import { useSkillStore, SkillFileItem } from "../store/skills-store";

/** Map language → CodeBlock-compatible language */
const LANG_MAP: Record<string, string> = {
  typescript: "typescript",
  javascript: "javascript",
  python: "python",
  json: "json",
  yaml: "yaml",
  markdown: "markdown",
  bash: "bash",
  text: "text",
};

export function SkillFileEditor() {
  const { selectedFile, selectFile } = useSkillStore();

  if (!selectedFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <FileCode className="h-8 w-8 opacity-40" />
        <span className="text-sm">Select a file to edit</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <FileHeader file={selectedFile} />
      <div className="flex-1 overflow-hidden">
        <textarea
          value={selectedFile.content}
          onChange={(e) => {
            const updated = { ...selectedFile, content: e.target.value };
            selectFile(updated);
          }}
          className="w-full h-full min-h-[300px] p-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
          placeholder={`Write ${selectedFile.language} code here...`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function FileHeader({ file }: { file: SkillFileItem }) {
  const { saveFileContent } = useSkillStore();

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background/50">
      <div className="flex items-center gap-2">
        <FileCode className="h-3.5 w-3.5 text-brand-accent" />
        <span className="text-xs font-medium text-foreground">{file.path}</span>
        <RoleBadge role={file.role} />
        <span className="text-[10px] text-muted-foreground">{LANG_MAP[file.language] ?? file.language}</span>
      </div>
      <button onClick={saveFileContent}
        className="flex items-center gap-1 px-2 py-1 rounded bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent/90 transition-colors">
        <Save className="h-3 w-3" /> Save
      </button>
    </div>
  );
}

const ROLE_STYLES: Record<string, string> = {
  entry: "bg-green-500/15 text-green-400",
  code: "bg-blue-500/15 text-blue-400",
  test: "bg-amber-500/15 text-amber-400",
  config: "bg-purple-500/15 text-purple-400",
  doc: "bg-cyan-500/15 text-cyan-400",
  schema: "bg-pink-500/15 text-pink-400",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", ROLE_STYLES[role] ?? "bg-muted text-muted-foreground")}>
      {role}
    </span>
  );
}
