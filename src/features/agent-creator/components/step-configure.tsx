"use client";

import { useCreatorStore } from "../hooks/use-creator-store";
import { ROLE_GROUPS, MODELS } from "@/features/agents/types";
import type { RoleGroup } from "@stsgs/shared";
import { cn } from "@stsgs/ui";

const fc = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const lc = "text-xs font-medium text-muted-foreground mb-1 block";

export function StepConfigure() {
  const { form, setField } = useCreatorStore();

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <label className={lc}>Agent Name *</label>
        <input
          className={fc}
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Marketing Campaign Agent"
        />
      </div>

      <div>
        <label className={lc}>Description</label>
        <textarea
          className={cn(fc, "min-h-[80px] resize-y")}
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="What does this agent do?"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lc}>Group</label>
          <select
            className={fc}
            value={form.group}
            onChange={(e) => setField("group", e.target.value as RoleGroup)}
          >
            {ROLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={lc}>Model</label>
          <select
            className={fc}
            value={form.model}
            onChange={(e) => setField("model", e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lc}>
            Temperature: {form.temperature.toFixed(1)}
          </label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={form.temperature}
            onChange={(e) =>
              setField("temperature", parseFloat(e.target.value))
            }
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        <div>
          <label className={lc}>Max Tokens</label>
          <input
            type="number"
            className={fc}
            value={form.maxTokens}
            onChange={(e) =>
              setField("maxTokens", parseInt(e.target.value) || 1024)
            }
            min={256}
            max={32768}
            step={256}
          />
        </div>
      </div>
    </div>
  );
}
