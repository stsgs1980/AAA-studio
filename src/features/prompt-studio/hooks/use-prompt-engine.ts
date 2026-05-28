"use client";

import { useState, useEffect } from "react";
import { scorePrompt, type PromptScore } from "@stsgs/prompting";
import { detectIntent, type IntentResult } from "@stsgs/prompting";

export function usePromptEngine(text: string, debounceMs = 300) {
  const [score, setScore] = useState<PromptScore | null>(null);
  const [intent, setIntent] = useState<IntentResult | null>(null);

  useEffect(() => {
    if (!text.trim()) {
      setScore(null);
      setIntent(null);
      return;
    }
    const t = setTimeout(() => {
      setScore(scorePrompt(text));
      setIntent(detectIntent(text));
    }, debounceMs);
    return () => clearTimeout(t);
  }, [text, debounceMs]);

  return { score, intent };
}
