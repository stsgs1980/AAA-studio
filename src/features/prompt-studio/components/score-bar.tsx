"use client";

import { motion } from "framer-motion";
import { getScoreColor } from "@/features/prompt-studio/types";

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
}

export function ScoreBar({ label, value, max = 10 }: ScoreBarProps) {
  const pct = (value / max) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted w-[76px] shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-midnight-elevated overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getScoreColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-text-secondary w-5 text-right tabular-nums">
        {value}
      </span>
    </div>
  );
}
