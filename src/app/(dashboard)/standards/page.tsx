"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Shield, Plus, Search, Upload } from "lucide-react";
import { cn } from "@stsgs/ui";
import { PageSkeleton } from "@/components/ui";
import { useStandardsStore } from "@/features/standards/store/standards-store";
import type { StandardSeverity } from "@stsgs/shared";
import { SEVERITY_OPTIONS } from "@stsgs/shared";
import { StandardList } from "@/features/standards/components/standard-list";
import { StandardDetail } from "@/features/standards/components/standard-detail";
import { CreateStandardForm } from "@/features/standards/components/create-standard-form";

export default function StandardsManagerPage() {
  const loading = useStandardsStore((s) => s.loading);
  const fetchStandards = useStandardsStore((s) => s.fetchStandards);
  const createStandard = useStandardsStore((s) => s.createStandard);
  const search = useStandardsStore((s) => s.search);
  const setSearch = useStandardsStore((s) => s.setSearch);
  const severityFilter = useStandardsStore((s) => s.severityFilter);
  const setSeverityFilter = useStandardsStore((s) => s.setSeverityFilter);
  const [showNew, setShowNew] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchStandards(); }, [fetchStandards]);

  const handleCreate = (name: string, severity: string) => {
    createStandard(name, severity);
    setShowNew(false);
  };

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus("Importing...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/standards/import", { method: "POST", body: fd });
      const data = await res.json();
      if (res.status === 401) { setImportStatus("Please login first"); return; }
      if (!res.ok) {
        const msg = data.error?.message || data.error || "Import failed";
        setImportStatus(`Error: ${msg}`);
        return;
      }
      const { created, updated } = data.data ?? {};
      setImportStatus(`Imported: ${created} created, ${updated} updated`);
      await fetchStandards();
    } catch (err) {
      setImportStatus(`Import failed: ${err instanceof Error ? err.message : "unknown"}`);
    }
    finally {
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setImportStatus(null), 4000);
    }
  }, [fetchStandards]);

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Standards Manager</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
        <div className="rounded-xl border border-border bg-card p-4"><PageSkeleton rows={4} /></div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4"><PageSkeleton rows={3} /></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Standards Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".md" onChange={handleImport} className="hidden" aria-label="Upload standard file" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-card/80 transition-colors">
            <Upload className="h-4 w-4" /> Import
          </button>
          <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90">
            <Plus className="h-4 w-4" /> New Standard
          </button>
        </div>
      </div>

      {/* Import status */}
      {importStatus && (
        <div className={cn("px-4 py-2 rounded-lg text-sm font-medium max-w-xs", importStatus.includes("failed") ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30" : "bg-brand-accent/15 text-brand-accent border border-brand-accent/30")}>
          {importStatus}
        </div>
      )}

      {showNew && <CreateStandardForm onCreate={handleCreate} onClose={() => setShowNew(false)} />}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search standards..." className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="flex gap-1">
          {(["all", ...SEVERITY_OPTIONS.map((o) => o.value)] as const).map((v) => (
            <button key={v} onClick={() => setSeverityFilter(v as StandardSeverity | "all")} className={cn("px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors capitalize", severityFilter === v ? "bg-brand-accent/15 text-brand-accent" : "text-muted-foreground hover:text-muted-foreground")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
        <StandardList />
        <div className="lg:col-span-2"><StandardDetail /></div>
      </div>
    </div>
  );
}
