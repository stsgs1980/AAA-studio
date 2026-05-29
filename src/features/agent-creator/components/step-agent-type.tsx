"use client";

import { useCreatorStore } from "../hooks/use-creator-store";
import { getSystemPromptTemplates } from "@stsgs/prompting";
import { getAgentRoles } from "@stsgs/prompting";
import { cn } from "@stsgs/ui";

const templates = getSystemPromptTemplates();
const roles = getAgentRoles();

export function StepAgentType() {
  const { form, setField, applyRole } = useCreatorStore();

  return (
    <div className="space-y-6">
      {/* Agent Type */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          1. Choose Agent Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setField("agentTypeId", t.id)}
              className={cn(
                "text-left p-4 rounded-lg border transition-colors",
                form.agentTypeId === t.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <p className="font-medium text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Starter Role */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          2. Choose Starter Role (optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => applyRole(r.id)}
              className={cn(
                "text-left p-4 rounded-lg border transition-colors",
                form.agentRoleId === r.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <p className="font-medium text-sm">{r.name}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {r.systemPrompt.slice(0, 80)}...
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {r.strengths.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] bg-muted px-1.5 py-0.5 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Selecting a role auto-fills the system prompt, temperature, and max
        tokens. You can customize everything in the next steps.
      </p>
    </div>
  );
}
