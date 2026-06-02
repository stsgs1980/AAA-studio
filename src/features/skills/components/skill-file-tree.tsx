"use client";

import { File, Plus, Trash2, ChevronRight, FolderOpen } from "lucide-react";
import { cn } from "@stsgs/ui";
import { useSkillStore, SkillFileItem } from "../store/skills-store";

/** Role -> color map */
const ROLE_COLORS: Record<string, string> = {
  entry: "text-green-400",
  code: "text-blue-400",
  test: "text-amber-400",
  config: "text-purple-400",
  doc: "text-cyan-400",
  schema: "text-pink-400",
};

export function SkillFileTree() {
  const { files, selectedFile, selectFile, createFile, deleteFile } = useSkillStore();

  const grouped = groupByFolder(files);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">
          Files ({files.length})
        </span>
        <AddFileButton onAdd={createFile} />
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No files yet. Add a file to start coding.
          </div>
        ) : (
          Object.entries(grouped).map(([folder, items]) => (
            <FolderGroup
              key={folder}
              folder={folder}
              items={items}
              selectedId={selectedFile?.id ?? ""}
              onSelect={selectFile}
              onDelete={deleteFile}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FolderGroup({
  folder, items, selectedId, onSelect, onDelete,
}: {
  folder: string; items: SkillFileItem[];
  selectedId: string; onSelect: (f: SkillFileItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      {folder !== "." && (
        <div className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
          <ChevronRight className="h-3 w-3" />
          <FolderOpen className="h-3 w-3" />
          <span>{folder}/</span>
        </div>
      )}
      {items.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f)}
          className={cn(
            "w-full flex items-center gap-1.5 px-3 py-1 text-xs hover:bg-muted transition-colors text-left group",
            selectedId === f.id && "bg-brand-accent/10 text-brand-accent",
          )}
          style={{ paddingLeft: folder !== "." ? "1.75rem" : undefined }}
        >
          <File className={cn("h-3 w-3 shrink-0", ROLE_COLORS[f.role] ?? "text-muted-foreground")} />
          <span className="truncate flex-1">{folder !== "." ? f.path.slice(folder.length + 1) : f.path}</span>
          <span className={cn("text-[10px] opacity-60", ROLE_COLORS[f.role])}>{f.role}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(f.id); }}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </button>
      ))}
    </div>
  );
}

function AddFileButton({ onAdd }: { onAdd: (path: string) => void }) {
  const handleClick = () => {
    const path = prompt("File path (e.g. src/index.ts, tests/main.test.ts):");
    if (path?.trim()) onAdd(path.trim());
  };

  return (
    <button onClick={handleClick}
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
      <Plus className="h-3 w-3" /> Add
    </button>
  );
}

/** Group files by parent folder */
function groupByFolder(files: SkillFileItem[]): Record<string, SkillFileItem[]> {
  const groups: Record<string, SkillFileItem[]> = {};
  for (const f of files) {
    const parts = f.path.split("/");
    const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : ".";
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(f);
  }
  return groups;
}
