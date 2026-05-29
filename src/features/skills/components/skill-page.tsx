'use client';

import { useEffect } from 'react';
import { Wrench, Plus } from 'lucide-react';
import { PageSkeleton } from '@/components/ui';
import { useSkillStore } from '../store/skills-store';
import { SkillList } from './skill-list';
import { SkillDetail } from './skill-detail';

export default function SkillForgePage() {
  const { loading, showNew, newName, setShowNew, setNewName, createSkill, fetchSkills } = useSkillStore();

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Skill Forge</h1>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Skill
        </button>
      </div>

      {showNew && (
        <div className="flex items-end gap-2 rounded-lg border bg-card p-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Skill name"
            className="h-9 px-3 rounded-md border bg-background text-sm flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createSkill(newName); }} />
          <button onClick={() => { if (newName.trim()) createSkill(newName); }}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Create</button>
          <button onClick={() => setShowNew(false)}
            className="h-9 px-3 rounded-md border text-sm hover:bg-accent">Cancel</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          <div className="rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={4} /></div>
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={3} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          <SkillList />
          <SkillDetail />
        </div>
      )}
    </div>
  );
}
