"use client";

import { useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import { cn } from "@stsgs/ui";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
}

export function OtpInput({ value, onChange, length = 6, error }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const values = value.padEnd(length, "").split("").slice(0, length);

  function handleChange(index: number, char: string) {
    if (!/^\d*$/.test(char)) return;
    const next = [...values];
    next[index] = char.slice(-1);
    const newVal = next.join("").replace(/ /g, "");
    onChange(newVal);
    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length) - 1;
    refs.current[Math.max(focusIdx, 0)]?.focus();
  }

  return (
    <div>
      <div className="flex gap-2">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={cn(
              "h-14 w-12 rounded-lg border border-border bg-card text-center",
              "text-lg font-semibold text-foreground outline-none transition-colors",
              "focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20",
              error && "border-brand-red"
            )}
          />
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-brand-red">{error}</p>}
    </div>
  );
}
