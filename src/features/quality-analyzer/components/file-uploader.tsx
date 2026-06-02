"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import { Upload, FolderOpen, Archive } from "lucide-react";
import { useQualityStore } from "../hooks/use-quality-store";

const ACCEPTED = new Set([
  "txt", "md", "json", "yaml", "yml", "ts", "js", "py", "toml", "cfg",
]);
const SKIP_DIRS = new Set(["node_modules", "__pycache__", "vendor"]);

function shouldSkip(path: string) {
  return path.split("/").some((p) => p.startsWith(".") || SKIP_DIRS.has(p));
}

export function FileUploader() {
  const input = useQualityStore((s) => s.input);
  const loadFile = useQualityStore((s) => s.loadFile);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const [zipProgress, setZipProgress] = useState<string | null>(null);

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

  const handleZip = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setZipProgress("Reading archive...");
      try {
        const buffer = await file.arrayBuffer();
        setZipProgress("Extracting files...");
        const zip = await JSZip.loadAsync(buffer);
        const entries: { name: string; content: string }[] = [];
        const tasks: Promise<void>[] = [];
        zip.forEach((relPath, entry) => {
          if (entry.dir || shouldSkip(relPath)) return;
          const ext = relPath.split(".").pop()?.toLowerCase() ?? "";
          if (!ACCEPTED.has(ext)) return;
          tasks.push(entry.async("string").then((t) => { entries.push({ name: relPath, content: t }); }));
        });
        await Promise.all(tasks);
        if (!entries.length) { setZipProgress("No supported files found in archive."); setTimeout(() => setZipProgress(null), 3000); return; }
        entries.sort((a, b) => a.name.localeCompare(b.name));
        loadFile(entries.map((e) => `=== ${e.name} ===\n${e.content}`).join("\n\n"), `${file.name} (${entries.length} files)`);
        setZipProgress(null);
      } catch (err) {
        setZipProgress(`ZIP error: ${err instanceof Error ? err.message : String(err)}`);
        setTimeout(() => setZipProgress(null), 5000);
      }
    },
    [loadFile],
  );

  const showPreview = input.fileName && !input.fileName.includes("files");

  return (
    <div className="flex flex-col gap-2">
      <input ref={fileRef} type="file" accept=".txt,.md,.json,.yaml,.yml,.ts,.js,.py,.toml,.cfg" className="hidden" onChange={handleFile} />
      <input ref={folderRef} type="file" {...{ webkitdirectory: "", directory: "" }} className="hidden" onChange={handleFolder} />
      <input ref={zipRef} type="file" accept=".zip" className="hidden" onChange={handleZip} />
      <button onClick={() => fileRef.current?.click()}
        className="flex min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary">
        <Upload className="h-8 w-8" />
        <span className="text-sm">{showPreview ? `Loaded: ${input.fileName}` : "Click to upload a file"}</span>
        <span className="text-xs text-muted-foreground/60">.txt, .md, .json, .yaml, .ts, .js, .py, .toml</span>
      </button>
      <div className="flex gap-2">
        <button onClick={() => folderRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">
          <FolderOpen className="h-3.5 w-3.5" /> Upload Folder
        </button>
        <button onClick={() => zipRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">
          <Archive className="h-3.5 w-3.5" /> Upload ZIP
        </button>
      </div>
      {zipProgress && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
          <Archive className="h-3.5 w-3.5 animate-pulse" />{zipProgress}
        </div>
      )}
      {input.text && (
        <textarea value={input.text} readOnly
          className="min-h-[200px] w-full resize-none rounded-lg border bg-muted/30 px-3 py-2 text-xs font-mono" />
      )}
    </div>
  );
}
