"use client";

import { useState } from "react";
import { cn } from "@stsgs/ui";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import type { Framework } from "@/features/prompt-studio/types";

const TYPE_COLORS: Record<string, string> = {
  structured: "text-brand-accent bg-brand-accent/15",
  chain: "text-brand-purple bg-brand-purple/15",
  constraint: "text-brand-amber bg-brand-amber/15",
  meta: "text-brand-cyan bg-brand-cyan/15",
};

interface FrameworkCardProps {
  framework: Framework;
  onGenerate: (prompt: string) => void;
}

export function FrameworkCard({ framework, onGenerate }: FrameworkCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const typeColor = TYPE_COLORS[framework.type] ?? TYPE_COLORS.structured;

  const handleGenerate = () => {
    const filled = framework.sections.map((s) => ({
      id: s.id,
      label: s.label,
      placeholder: s.placeholder,
      value: values[s.id] ?? "",
      required: s.required,
    }));

    const prompt = filled
      .filter((s) => s.required || s.value)
      .map((s) => `## ${s.label}\n${s.value || s.placeholder}`)
      .join("\n\n");

    onGenerate(prompt);
  };

  const allRequiredFilled = framework.sections
    .filter((s) => s.required)
    .every((s) => values[s.id]?.trim());

  return (
    <div className="rounded-xl border border-midnight-border bg-midnight-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-midnight-elevated/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary">
            {framework.name}
          </span>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", typeColor)}>
            {framework.type}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-xs text-text-secondary leading-relaxed">
          {framework.description}
        </p>
      </div>

      {/* Expandable form */}
      {expanded && (
        <div className="border-t border-midnight-border p-4 space-y-3">
          {framework.sections.map((section) => (
            <div key={section.id} className="space-y-1.5">
              <label className="text-xs text-text-muted flex items-center gap-1">
                {section.label}
                {section.required && <span className="text-brand-red">*</span>}
              </label>
              <textarea
                value={values[section.id] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [section.id]: e.target.value }))}
                placeholder={section.placeholder}
                rows={2}
                className="w-full text-sm font-mono bg-midnight-base border border-midnight-border rounded-lg p-3 resize-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none text-text-primary placeholder:text-text-muted"
              />
            </div>
          ))}

          <button
            onClick={handleGenerate}
            disabled={!allRequiredFilled}
            className={cn(
              "flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              allRequiredFilled
                ? "bg-brand-accent text-white hover:bg-brand-accent/90"
                : "bg-midnight-elevated text-text-muted cursor-not-allowed",
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            Generate Prompt
          </button>
        </div>
      )}
    </div>
  );
}
