"use client";

import { useCreatorStore } from "../hooks/use-creator-store";
import { getSystemPromptTemplates, getAgentRoles } from "@stsgs/prompting";
import { cn } from "@stsgs/ui";
import type { AgentType, AgentRole } from "@stsgs/shared";

const templates = getSystemPromptTemplates();
const roles = getAgentRoles();

/** Icon mapping for agent types */
const TYPE_ICONS: Record<string, string> = {
  "tool-calling": "🔧", router: "🔀", specialist: "🎯",
  orchestrator: "🎼", evaluator: "✅",
};

export function StepAgentType() {
  const { form, setField, applyRole, applyTemplate } = useCreatorStore();
  const selected = templates.find((t) => t.id === form.agentTypeId);

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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{TYPE_ICONS[t.id] ?? "🤖"}</span>
                <p className="font-medium text-sm">{t.name}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Template Variables — shown when a type is selected */}
      {selected && (
        <TemplateVarsForm template={selected} />
      )}

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
                "text-left p-3 rounded-lg border transition-colors",
                form.agentRoleId === r.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <p className="font-medium text-sm">{r.name}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {r.strengths.slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Dynamic form for template variables */
function TemplateVarsForm({ template }: { template: AgentType }) {
  const { form, applyTemplate, setField } = useCreatorStore();

  // Get current variable values from form (stored in a separate field)
  const vars = form.templateVars ?? {};
  const setVar = (key: string, value: string) => {
    const next = { ...vars, [key]: value };
    setField("templateVars", next);
    applyTemplate(template.id, next);
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <span>{TYPE_ICONS[template.id] ?? "🤖"}</span>
        {template.name} — Configure Variables
      </h4>
      <p className="text-xs text-muted-foreground">
        Fill in the variables to auto-generate the system prompt.
      </p>
      <div className="space-y-3">
        {template.variables.map((v) => (
          <div key={v.key}>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {v.label} {v.required && <span className="text-red-400">*</span>}
            </label>
            {v.key === "categories" || v.key === "criteria" || v.key === "team" ? (
              <textarea
                value={vars[v.key] ?? v.defaultValue ?? ""}
                onChange={(e) => setVar(v.key, e.target.value)}
                placeholder={v.description}
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
              />
            ) : (
              <input
                type="text"
                value={vars[v.key] ?? v.defaultValue ?? ""}
                onChange={(e) => setVar(v.key, e.target.value)}
                placeholder={v.description}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
