"use client";

import { useState, useEffect } from "react";
import { detectIntent, type IntentResult } from "@stsgs/prompting";

export function useIntentDetection(text: string, debounceMs = 500) {
  const [result, setResult] = useState<IntentResult | null>(null);

  useEffect(() => {
    if (!text.trim()) {
      setResult(null);
      return;
    }
    const t = setTimeout(
      () => setResult(detectIntent(text)),
      debounceMs
    );
    return () => clearTimeout(t);
  }, [text, debounceMs]);

  return result;
}
