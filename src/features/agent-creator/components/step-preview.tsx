"use client";

import { useCreatorStore } from "../hooks/use-creator-store";
import { getScoreLabel } from "@stsgs/prompting";
import { cn } from "@stsgs/ui";
import { CheckCircle, ArrowLeft, Save } from "lucide-react";

export function StepPreview() {
  const { form, score, saving, error, done, prev, save, reset } =
    useCreatorStore();

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-bold">Agent Created!</h2>
        <p className="text-sm text-muted-foreground">
          &quot;{form.name}&quot; has been saved as a draft.
        </p>
        <div className="flex gap-3">
          <a
            href="/agents"
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            View Agents
          </a>
          <button
            onClick={reset}
            className="px-4 py-2 text-sm rounded-md border hover:bg-accent"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <InfoCard label="Name" value={form.name || "-"} />
        <InfoCard label="Type" value={form.agentTypeId || form.agentRoleId || "Custom"} />
        <InfoCard label="Group" value={form.group} />
        <InfoCard label="Model" value={form.model} />
        <InfoCard label="Temperature" value={form.temperature.toFixed(1)} />
        <InfoCard
          label="Score"
          value={score ? `${score.overall}/10 (${getScoreLabel(score.overall)})` : "N/A"}
          highlight={
            score
              ? score.overall >= 7
                ? "green"
                : score.overall >= 5
                  ? "yellow"
                  : "red"
              : undefined
          }
        />
      </div>

      {/* Tools/Skills/Standards */}
      <div className="grid grid-cols-3 gap-4">
        <CountCard label="Tools" count={form.tools.length} />
        <CountCard label="Skills" count={form.skillIds.length} />
        <CountCard label="Standards" count={form.standardIds.length} />
      </div>

      {/* System Prompt Preview */}
      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="text-sm font-medium">System Prompt</h3>
        <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/50 rounded p-3 max-h-[300px] overflow-y-auto">
          {form.systemPrompt || "(empty)"}
        </pre>
      </div>

      {/* Description */}
      {form.description && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium mb-1">Description</h3>
          <p className="text-xs text-muted-foreground">{form.description}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={prev}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Create Agent"}
        </button>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "yellow" | "red";
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          "text-sm font-medium capitalize",
          highlight === "green" && "text-green-500",
          highlight === "yellow" && "text-yellow-500",
          highlight === "red" && "text-red-500"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CountCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className="text-lg font-bold">{count}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
