"use client";

import { cn } from "@stsgs/ui";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { ComparisonResult } from "@/features/prompt-studio/types";
import { getScoreColor } from "@/features/prompt-studio/types";

interface CompareResultsProps {
  result: ComparisonResult | null;
}

export function CompareResults({ result }: CompareResultsProps) {
  if (!result) return null;

  const winnerText =
    result.winner === "a"
      ? "Prompt A wins"
      : result.winner === "b"
        ? "Prompt B wins"
        : "It's a tie";

  const winnerColor =
    result.winner === "a"
      ? "text-brand-accent"
      : result.winner === "b"
        ? "text-brand-purple"
        : "text-brand-amber";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-midnight-border bg-midnight-card p-5 space-y-4"
    >
      {/* Winner banner */}
      <div className="flex items-center gap-2">
        <Trophy className={cn("h-5 w-5", winnerColor)} />
        <span className={cn("text-lg font-bold", winnerColor)}>
          {winnerText}
        </span>
        <span className="text-xs text-text-muted ml-auto">
          A: {result.scoreA} / B: {result.scoreB}
        </span>
      </div>

      {/* Criteria rows */}
      <div className="space-y-3">
        {result.criteria.map((c) => {
          const diff = c.scoreA - c.scoreB;
          const diffText = diff > 0 ? `+${diff}` : diff === 0 ? "0" : `${diff}`;
          const diffColor = diff > 0 ? "text-brand-accent" : diff < 0 ? "text-brand-purple" : "text-text-muted";

          return (
            <div key={c.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">{c.name}</span>
                <span className={cn("font-medium tabular-nums", diffColor)}>
                  {diffText}
                </span>
              </div>
              <div className="flex gap-3 items-center">
                {/* A bar */}
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-4">A</span>
                  <div className="flex-1 h-2 rounded-full bg-midnight-elevated overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getScoreColor(c.scoreA)}`}
                      style={{ width: `${c.scoreA * 10}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary w-5 text-right tabular-nums">{c.scoreA}</span>
                </div>
                {/* B bar */}
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-4">B</span>
                  <div className="flex-1 h-2 rounded-full bg-midnight-elevated overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getScoreColor(c.scoreB)}`}
                      style={{ width: `${c.scoreB * 10}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary w-5 text-right tabular-nums">{c.scoreB}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
