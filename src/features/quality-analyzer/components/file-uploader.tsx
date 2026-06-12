"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import { Upload, FolderOpen, Archive } from "lucide-react";
import { useQualityStore } from "../hooks/use-quality-store";
import { shouldSkipFile, MAX_FILE_SIZE, SKIP_DIRS } from "@/lib/scanner/file-filter";
import type { FilterLogEntry, FilterReason } from "../types";

const ACCEPTED = new Set([
  "txt", "md", "mdx", "json", "yaml", "yml",
  "ts", "tsx", "js", "jsx", "py", "toml", "cfg",
]);

function classifyReason(path: string): FilterReason | null {
  const segments = path.split("/");
  if (segments.some((s) => s.startsWith("."))) return "dot_dir";
  if (segments.some((s) => SKIP_DIRS.has(s))) return "skip_dir";
  const fileName = segments.pop() ?? path;
  if (shouldSkipFile(path)) return "skip_file";
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!ACCEPTED.has(ext)) return "wrong_ext";
  return null;
}

export function FileUploader() {
  const input = useQualityStore((s) => s.input);
  const loadFile = useQualityStore((s) => s.loadFile);
  const setFilterLog = useQualityStore((s) => s.setFilterLog);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const [zipProgress, setZipProgress] = useState<string | null>(null);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        loadFile(reader.result as string, file.name);
        setFilterLog(null);
      };
      reader.readAsText(file);
    },
    [loadFile, setFilterLog],
  );

  const handleFolder = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const allFiles = Array.from(e.target.files ?? []);
      if (!allFiles.length) return;
      const filtered: typeof allFiles = [];
      const log: FilterLogEntry[] = [];
      for (const f of allFiles) {
        const p = f.webkitRelativePath ?? f.name;
        const reason = classifyReason(p);
        if (reason) { log.push({ path: p, reason }); continue; }
        if (f.size > MAX_FILE_SIZE) { log.push({ path: p, reason: "too_large" }); continue; }
        filtered.push(f);
      }
      setFilterLog({ total: allFiles.length, accepted: filtered.length, entries: log });
      if (!filtered.length) return;
      const parts = await Promise.all(
        filtered.map((f) => f.text().then((t) => `=== ${f.webkitRelativePath || f.name} ===\n${t}`)),
      );
      loadFile(parts.join("\n\n"), `${filtered.length} files`);
    },
    [loadFile, setFilterLog],
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
        const log: FilterLogEntry[] = [];
        let total = 0;
        const tasks: Promise<void>[] = [];
        zip.forEach((relPath, entry) => {
          if (entry.dir) { log.push({ path: relPath, reason: "directory" }); total++; return; }
          total++;
          const reason = classifyReason(relPath);
          if (reason) { log.push({ path: relPath, reason }); return; }
          const ext = relPath.split(".").pop()?.toLowerCase() ?? "";
          if (!ACCEPTED.has(ext)) { log.push({ path: relPath, reason: "wrong_ext" }); return; }
          tasks.push(entry.async("string").then((t) => {
            if (t.length > MAX_FILE_SIZE) { log.push({ path: relPath, reason: "too_large" }); return; }
            entries.push({ name: relPath, content: t });
          }));
        });
        await Promise.all(tasks);
        setFilterLog({ total, accepted: entries.length, entries: log });
        if (!entries.length) {
          setZipProgress("No supported files found in archive.");
          setTimeout(() => setZipProgress(null), 3000);
          return;
        }
        entries.sort((a, b) => a.name.localeCompare(b.name));
        loadFile(entries.map((e) => `=== ${e.name} ===\n${e.content}`).join("\n\n"), `${file.name} (${entries.length} files)`);
        setZipProgress(null);
      } catch (err) {
        setZipProgress(`ZIP error: ${err instanceof Error ? err.message : String(err)}`);
        setTimeout(() => setZipProgress(null), 5000);
      }
    },
    [loadFile, setFilterLog],
  );

  const showPreview = input.fileName && !input.fileName.includes("files");

  return (
    <div className="flex flex-col gap-2">
      <input ref={fileRef} type="file" accept=".txt,.md,.mdx,.json,.yaml,.yml,.ts,.tsx,.js,.jsx,.py,.toml,.cfg" className="hidden" onChange={handleFile} />
      <input ref={folderRef} type="file" {...{ webkitdirectory: "", directory: "" }} className="hidden" onChange={handleFolder} />
      <input ref={zipRef} type="file" accept=".zip" className="hidden" onChange={handleZip} />
      <button onClick={() => fileRef.current?.click()}
        className="flex min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary">
        <Upload className="h-8 w-8" />
        <span className="text-sm">{showPreview ? `Loaded: ${input.fileName}` : "Click to upload a file"}</span>
        <span className="text-xs text-muted-foreground/60">.txt, .md, .json, .yaml, .ts, .tsx, .js, .jsx, .py, .toml</span>
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
    </div>
  );
}