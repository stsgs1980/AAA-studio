"use client";

import { useEffect, useState } from "react";
import { Shield, Plus, Search } from "lucide-react";
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

  useEffect(() => { fetchStandards(); }, [fetchStandards]);

  const handleCreate = (name: string, severity: string) => {
    createStandard(name, severity);
    setShowNew(false);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-text-muted" />
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Standards Manager</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          <div className="rounded-xl border border-midnight-border bg-midnight-card p-4"><PageSkeleton rows={4} /></div>
          <div className="lg:col-span-2 rounded-xl border border-midnight-border bg-midnight-card p-4"><PageSkeleton rows={3} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-text-muted" />
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Standards Manager</h1>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90"
        >
          <Plus className="h-4 w-4" /> New Standard
        </button>
      </div>

      {/* Create form */}
      {showNew && (
        <CreateStandardForm onCreate={handleCreate} onClose={() => setShowNew(false)} />
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search standards..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-midnight-border bg-midnight-card text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div className="flex gap-1">
          {(["all", ...SEVERITY_OPTIONS.map((o) => o.value)] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSeverityFilter(v as StandardSeverity | "all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors capitalize",
                severityFilter === v
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
        <StandardList />
        <div className="lg:col-span-2">
          <StandardDetail />
        </div>
      </div>
    </div>
  );
}
