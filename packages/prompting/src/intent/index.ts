// ============================================================================
// @stsgs/prompting - Intent detection
// ============================================================================

export type PromptIntent =
  | "question"
  | "instruction"
  | "creative"
  | "analysis"
  | "code"
  | "conversation"
  | "correction";

export interface IntentResult {
  intent: PromptIntent;
  confidence: number;
  signals: string[];
}

const WEIGHTS: Record<PromptIntent, number> = {
  code: 1.5,
  instruction: 1.3,
  analysis: 1.2,
  creative: 1.2,
  question: 1.0,
  correction: 1.4,
  conversation: 0.5,
};

interface IntentDef {
  intent: PromptIntent;
  patterns: { re: RegExp; signal: string }[];
}

const INTENTS: IntentDef[] = [
  {
    intent: "code",
    patterns: [
      { re: /```/, signal: "code-block" },
      { re: /\b(function|class|interface|type|const|let|var|import|export)\b/, signal: "code-keyword" },
      { re: /\b(bug|error|fix|debug|refactor|deploy)\b/, signal: "code-action" },
      { re: /\b(component|module|api|endpoint|route|handler)\b/, signal: "code-structure" },
      { re: /\b(python|javascript|typescript|rust|java|go)\b/, signal: "language" },
    ],
  },
  {
    intent: "correction",
    patterns: [
      { re: /\b(fix|correct|repair|amend|revise)\b/, signal: "fix-verb" },
      { re: /\b(wrong|incorrect|broken|bug|mistake|error)\b/, signal: "error-noun" },
      { re: /\b(instead of|rather|should be|supposed to)\b/, signal: "correction-phrase" },
    ],
  },
  {
    intent: "instruction",
    patterns: [
      { re: /\b(create|build|write|make|generate|produce|set up|configure)\b/, signal: "create-verb" },
      { re: /\b(implement|develop|design|architect|integrate)\b/, signal: "dev-verb" },
      { re: /\b(do not|don't|never|avoid|always|must|ensure)\b/, signal: "constraint" },
      { re: /\b(verify|check|validate|test)\b/, signal: "verify-verb" },
    ],
  },
  {
    intent: "analysis",
    patterns: [
      { re: /\b(analyze|analysis|evaluate|assess|audit|review)\b/, signal: "analysis-verb" },
      { re: /\b(pros?\s+and\s+cons|advantages?|disadvantages?|trade-offs)\b/, signal: "comparison" },
      { re: /\b(statistics|data|metrics|performance|benchmark)\b/, signal: "data-term" },
      { re: /\b(recommendation|conclusion|summary|findings|report)\b/, signal: "output-type" },
    ],
  },
  {
    intent: "creative",
    patterns: [
      { re: /\b(write|compose|draft|craft|create)\b/, signal: "creative-verb" },
      { re: /\b(story|poem|article|blog|essay|script|song|novel)\b/, signal: "format" },
      { re: /\b(creative|imagine|invent|brainstorm|ideate)\b/, signal: "creative-word" },
      { re: /\b(ideas?|suggestions?|alternatives?|options?|variations?)\b/, signal: "exploration" },
    ],
  },
  {
    intent: "question",
    patterns: [
      { re: /\?/, signal: "question-mark" },
      { re: /\b(what|why|how|when|where|who|which)\b/, signal: "wh-word" },
      { re: /\b(can you|could you|would you|is it|does it|tell me)\b/, signal: "polite-request" },
      { re: /\b(explain|describe|clarify|elaborate)\b/, signal: "explain-verb" },
    ],
  },
];

/** Detect the intent of a prompt */
export function detectIntent(prompt: string): IntentResult {
  const lower = prompt.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).length;

  // Very short input → conversation fallback
  if (wordCount < 3) {
    return { intent: "conversation", confidence: 0.2, signals: ["too-short"] };
  }

  let bestIntent: PromptIntent = "conversation";
  let bestScore = 0;
  let bestSignals: string[] = ["no-strong-signal"];

  for (const def of INTENTS) {
    let score = 0;
    const signals: string[] = [];
    for (const { re, signal } of def.patterns) {
      if (re.test(lower)) {
        score += 1;
        signals.push(signal);
      }
    }
    const weighted = score * (WEIGHTS[def.intent] ?? 1);
    if (weighted > bestScore) {
      bestScore = weighted;
      bestIntent = def.intent;
      bestSignals = signals;
    }
  }

  // Confidence: map weighted score to 0-1 range
  // 0 signals = 0.2, 1 = 0.4, 2 = 0.6, 3+ = 0.8, 4+ with weight = 0.95
  const rawConf = Math.min(0.95, 0.2 + bestScore * 0.15);
  const confidence = Math.round(rawConf * 100) / 100;

  return { intent: bestIntent, confidence, signals: bestSignals };
}
