"use client";

import { useEffect, useRef, useState } from "react";
import { Wrench, Plus, Upload, Download, ChevronDown } from "lucide-react";
import { PageSkeleton } from "@/components/ui";
import { useSkillStore } from "../store/skills-store";
import { SkillList } from "./skill-list";
import { SkillDetail } from "./skill-detail";
import { SkillCreateForm } from "./skill-create-form";
import { useLanguage } from "@/lib/i18n/language-context";

export default function SkillForgePage() {
  const { loading, showNew, setShowNew, fetchSkills } = useSkillStore();
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/skills/import", { method: "POST", body: fd });
      if (res.ok) fetchSkills();
      else alert("Import failed");
    } catch { alert("Import failed"); }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.pages['Skill Forge']}</h1>
        </div>
        <div className="flex gap-2">
          <ExportFormatsButton />
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors">
            <Upload className="h-4 w-4" /> Import
          </button>
          <input ref={fileRef} type="file" accept=".md,.zip" onChange={handleImport} className="hidden" />
          <button onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90">
            <Plus className="h-4 w-4" /> {t.pages['New Skill']}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showNew && <SkillCreateForm />}

      {/* Main layout */}
      {loading ? (
        <div className="flex flex-col lg:flex-row gap-4 min-h-[60vh]">
          <div className="w-full lg:w-56 shrink-0 rounded-xl border border-border bg-card p-4"><PageSkeleton rows={4} /></div>
          <div className="flex-1 min-w-0 rounded-xl border border-border bg-card p-4"><PageSkeleton rows={3} /></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 min-h-[60vh]">
          <div className="w-full lg:w-56 shrink-0">
            <SkillList />
          </div>
          <div className="flex-1 min-w-0">
            <SkillDetail />
          </div>
        </div>
      )}
    </div>
  );
}

/** Dropdown button to export all skills in OpenAI / MCP / A2A format */
function ExportFormatsButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const download = async (format: string) => {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/skills/export-formats?format=${format}`);
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skills-${format}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
      >
        <Download className="h-4 w-4" />
        {loading ? 'Exporting...' : 'Export Formats'}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg border border-border bg-card shadow-lg py-1">
          <button onClick={() => download('openai')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">OpenAI Tools</button>
          <button onClick={() => download('mcp')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">MCP Format</button>
          <button onClick={() => download('a2a')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">A2A Cards</button>
        </div>
      )}
    </div>
  );
}
