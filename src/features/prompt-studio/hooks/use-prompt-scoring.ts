"use client";

import { useState, useEffect } from "react";
import { scorePrompt, type PromptScore } from "@stsgs/prompting";

export function usePromptScoring(text: string, debounceMs = 300) {
  const [score, setScore] = useState<PromptScore | null>(null);

  useEffect(() => {
    if (!text.trim()) {
      setScore(null);
      return;
    }
    const t = setTimeout(() => setScore(scorePrompt(text)), debounceMs);
    return () => clearTimeout(t);
  }, [text, debounceMs]);

  return score;
}
