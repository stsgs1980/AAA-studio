"use client";

import { cn } from "@stsgs/ui";
import { getIntentColor } from "@/features/prompt-studio/types";
import type { IntentResult } from "@/features/prompt-studio/types";

const INTENT_LABELS: Record<string, string> = {
  question: "Question",
  instruction: "Instruction",
  creative: "Creative",
  analysis: "Analysis",
  code: "Code",
  conversation: "Conversation",
  correction: "Correction",
};

export function IntentBadge({ intent }: { intent: IntentResult | null }) {
  if (!intent) return null;

  const label = INTENT_LABELS[intent.intent] ?? intent.intent;
  const pct = Math.round(intent.confidence * 100);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        getIntentColor(intent.intent),
      )}
    >
      {label}
      <span className="opacity-70">{pct}%</span>
    </span>
  );
}
