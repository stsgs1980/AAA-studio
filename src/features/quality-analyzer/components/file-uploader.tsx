"use client";

import { useCallback, useRef } from "react";
import { Upload, FolderOpen } from "lucide-react";
import { useQualityStore } from "../hooks/use-quality-store";

const ACCEPTED = new Set([
  "txt", "md", "json", "yaml", "yml", "ts", "js", "py", "toml", "cfg",
]);

export function FileUploader() {
  const input = useQualityStore((s) => s.input);
  const loadFile = useQualityStore((s) => s.loadFile);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => loadFile(reader.result as string, file.name);
      reader.readAsText(file);
    },
    [loadFile],
  );

  const handleFolder = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter(
        (f) => ACCEPTED.has(f.name.split(".").pop()?.toLowerCase() ?? ""),
      );
      if (!files.length) return;
      const parts = await Promise.all(
        files.map((f) => f.text().then((t) => `=== ${f.name} ===\n${t}`)),
      );
      loadFile(parts.join("\n\n"), `${files.length} files`);
    },
    [loadFile],
  );

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md,.json,.yaml,.yml,.ts,.js,.py,.toml,.cfg"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={folderRef}
        type="file"
        {...{ webkitdirectory: "", directory: "" }}
        className="hidden"
        onChange={handleFolder}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Upload className="h-8 w-8" />
        <span className="text-sm">
          {input.fileName && !input.fileName.includes("files")
            ? `Loaded: ${input.fileName}`
            : "Click to upload a file"}
        </span>
        <span className="text-xs text-muted-foreground/60">
          .txt, .md, .json, .yaml, .ts, .js, .py, .toml
        </span>
      </button>
      <button
        onClick={() => folderRef.current?.click()}
        className="flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        Upload Folder
      </button>
      {input.text && (
        <textarea
          value={input.text}
          readOnly
          className="min-h-[200px] w-full resize-none rounded-lg border bg-muted/30 px-3 py-2 text-xs font-mono"
        />
      )}
    </div>
  );
}
