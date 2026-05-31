"use client";

import { useEffect } from "react";
import { Wrench, Plus } from "lucide-react";
import { PageSkeleton } from "@/components/ui";
import { useSkillStore } from "../store/skills-store";
import { SkillList } from "./skill-list";
import { SkillDetail } from "./skill-detail";
import { useLanguage } from "@/lib/i18n/language-context";

export default function SkillForgePage() {
  const { loading, showNew, newName, setShowNew, setNewName, createSkill, fetchSkills } = useSkillStore();
  const { t } = useLanguage();

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.pages['Skill Forge']}</h1>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90">
          <Plus className="h-4 w-4" /> {t.pages['New Skill']}
        </button>
      </div>

      {/* Create form */}
      {showNew && (
        <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder={t.pages['Skill name']}
            className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) createSkill(newName); }} />
          <button onClick={() => { if (newName.trim()) createSkill(newName); }}
            className="h-9 px-4 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90 disabled:opacity-40 disabled:pointer-events-none">{t.common['Create']}</button>
          <button onClick={() => setShowNew(false)}
            className="h-9 px-3 rounded-lg border border-border text-muted-foreground hover:bg-muted text-sm">{t.common['Cancel']}</button>
        </div>
      )}

      {/* Main layout */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 min-h-[60vh]">
          <div className="rounded-xl border border-border bg-card p-4"><PageSkeleton rows={4} /></div>
          <div className="rounded-xl border border-border bg-card p-4"><PageSkeleton rows={3} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 min-h-[60vh]">
          <SkillList />
          <div>
            <SkillDetail />
          </div>
        </div>
      )}
    </div>
  );
}
