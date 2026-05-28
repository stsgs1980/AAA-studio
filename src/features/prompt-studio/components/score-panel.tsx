"use client";

import { motion } from "framer-motion";
import { getScoreLabel } from "@stsgs/prompting";
import type { PromptScore } from "@/features/prompt-studio/types";
import { getScoreRingColor } from "@/features/prompt-studio/types";
import { ScoreBar } from "./score-bar";

const DIMENSIONS = [
  { key: "clarity" as const, label: "Clarity" },
  { key: "specificity" as const, label: "Specificity" },
  { key: "structure" as const, label: "Structure" },
  { key: "completeness" as const, label: "Completeness" },
  { key: "creativity" as const, label: "Creativity" },
  { key: "actionability" as const, label: "Actionability" },
];

export function ScorePanel({ score }: { score: PromptScore | null }) {
  if (!score) {
    return (
      <div className="rounded-xl border border-midnight-border bg-midnight-card p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-text-muted text-center">
          Start typing to see live prompt scoring
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-midnight-border bg-midnight-card p-6 space-y-5">
      {/* Overall score circle */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          key={score.overall}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold ${getScoreRingColor(score.overall)}`}
        >
          {score.overall}
        </motion.div>
        <span className="text-sm font-medium text-text-secondary">
          {getScoreLabel(score.overall)}
        </span>
      </div>

      {/* Dimension bars */}
      <div className="space-y-2.5">
        {DIMENSIONS.map(({ key, label }) => (
          <ScoreBar key={key} label={label} value={score[key]} />
        ))}
      </div>
    </div>
  );
}
