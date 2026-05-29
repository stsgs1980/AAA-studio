"use client";

import { useCreatorStore } from "../hooks/use-creator-store";
import { EntityPicker } from "@/components/ui/entity-picker";
import { cn } from "@stsgs/ui";

const TOOL_OPTIONS = [
  "web-search",
  "web-reader",
  "image-generation",
  "code-execution",
  "file-upload",
  "email",
  "calendar",
  "database-query",
  "api-call",
  "browser",
] as const;

export function StepTools() {
  const { form, setField } = useCreatorStore();

  const toggleTool = (tool: string) => {
    const current = form.tools;
    setField(
      "tools",
      current.includes(tool)
        ? current.filter((t) => t !== tool)
        : [...current, tool]
    );
  };

  const addSkill = (id: string) =>
    setField("skillIds", [...form.skillIds, id]);
  const removeSkill = (id: string) =>
    setField("skillIds", form.skillIds.filter((s) => s !== id));

  const addStandard = (id: string) =>
    setField("standardIds", [...form.standardIds, id]);
  const removeStandard = (id: string) =>
    setField("standardIds", form.standardIds.filter((s) => s !== id));

  return (
    <div className="space-y-6">
      {/* Tools */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Tools
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {TOOL_OPTIONS.map((tool) => (
            <button
              key={tool}
              onClick={() => toggleTool(tool)}
              className={cn(
                "text-xs p-2.5 rounded-md border transition-colors capitalize",
                form.tools.includes(tool)
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {tool.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Skills
        </h3>
        <EntityPicker
          entityType="skill"
          linked={form.skillIds}
          onAdd={addSkill}
          onRemove={removeSkill}
        />
      </div>

      {/* Standards */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Standards
        </h3>
        <EntityPicker
          entityType="standard"
          linked={form.standardIds}
          onAdd={addStandard}
          onRemove={removeStandard}
        />
      </div>
    </div>
  );
}
