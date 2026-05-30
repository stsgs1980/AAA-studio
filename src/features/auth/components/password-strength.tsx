"use client";

import { useMemo } from "react";
import { cn } from "@stsgs/ui";

function getScore(password: string): number {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

const levels = [
  { label: "Weak", color: "bg-brand-red", width: "w-1/4" },
  { label: "Fair", color: "bg-brand-amber", width: "w-2/4" },
  { label: "Strong", color: "bg-yellow-400", width: "w-3/4" },
  { label: "Very Strong", color: "bg-brand-green", width: "w-full" },
] as const;

interface PasswordStrengthProps {
  password?: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const score = useMemo(() => (password ? getScore(password) : 0), [password]);

  if (!password) return null;

  const level = score > 0 ? levels[Math.min(score - 1, levels.length - 1)] : null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="h-1.5 w-full rounded-full bg-muted">
        {level && (
          <div
            className={cn("h-full rounded-full transition-all duration-300", level.color, level.width)}
          />
        )}
      </div>
      {level && (
        <p className={cn("text-xs", score <= 1 ? "text-brand-red" : score === 2 ? "text-brand-amber" : score === 3 ? "text-yellow-600" : "text-brand-green")}>
          {level.label}
        </p>
      )}
    </div>
  );
}
