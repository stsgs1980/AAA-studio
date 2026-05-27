import { Wrench } from "lucide-react";

export default function SkillForgePage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Wrench className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Skill Forge</h1>
      </div>
      <p className="text-muted-foreground">
        Create and manage reusable agent skills with input/output schemas.
      </p>
      <div className="rounded-xl border bg-card p-12 shadow-sm flex items-center justify-center">
        <p className="text-muted-foreground">Coming Soon</p>
      </div>
    </div>
  );
}
