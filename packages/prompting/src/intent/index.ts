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

/** Detect the intent of a prompt */
export function detectIntent(prompt: string): IntentResult {
  const lower = prompt.toLowerCase().trim();
  const results: { intent: PromptIntent; score: number; signals: string[] }[] = [];

  // Question
  const questionScore = scoreQuestion(lower);
  if (questionScore > 0) {
    results.push({
      intent: "question",
      score: questionScore,
      signals: extractSignals(lower, questionPatterns),
    });
  }

  // Instruction
  const instructionScore = scoreInstruction(lower);
  if (instructionScore > 0) {
    results.push({
      intent: "instruction",
      score: instructionScore,
      signals: extractSignals(lower, instructionPatterns),
    });
  }

  // Code
  const codeScore = scoreCode(prompt);
  if (codeScore > 0) {
    results.push({
      intent: "code",
      score: codeScore,
      signals: extractSignals(lower, codePatterns),
    });
  }

  // Creative
  const creativeScore = scoreCreative(lower);
  if (creativeScore > 0) {
    results.push({
      intent: "creative",
      score: creativeScore,
      signals: extractSignals(lower, creativePatterns),
    });
  }

  // Analysis
  const analysisScore = scoreAnalysis(lower);
  if (analysisScore > 0) {
    results.push({
      intent: "analysis",
      score: analysisScore,
      signals: extractSignals(lower, analysisPatterns),
    });
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    return { intent: "conversation", confidence: 0.3, signals: ["no strong signal"] };
  }

  const best = results[0];
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const confidence = Math.min(0.95, best.score / totalScore);

  return { intent: best.intent, confidence, signals: best.signals };
}

const questionPatterns = [
  /\?/,
  /\b(what|why|how|when|where|who|which)\b/,
  /\b(can you|could you|would you|is it|does it)\b/,
  /\b(explain|describe|tell me|clarify)\b/,
];

const instructionPatterns = [
  /\b(create|build|write|make|generate|produce)\b/,
  /\b(implement|develop|design|configure)\b/,
  /\b(do not|don't|never|avoid|always|must)\b/,
  /\b(ensure|verify|check|validate)\b/,
];

const codePatterns = [
  /```/,
  /\b(function|class|interface|type|const|let|var|import|export)\b/,
  /\b(bug|error|fix|debug|refactor)\b/,
  /\b(component|module|api|endpoint|route)\b/,
];

const creativePatterns = [
  /\b(write|compose|draft|craft|create)\b/,
  /\b(story|poem|article|blog|essay|script)\b/,
  /\b(creative|imagine|invent|brainstorm)\b/,
  /\b(ideas|suggestions|alternatives|options)\b/,
];

const analysisPatterns = [
  /\b(analyze|analysis|evaluate|assess|compare)\b/,
  /\b(pros and cons|advantages|disadvantages|trade-offs)\b/,
  /\b(statistics|data|metrics|performance|benchmark)\b/,
  /\b(recommendation|conclusion|summary|findings)\b/,
];

function scoreQuestion(lower: string): number {
  return questionPatterns.reduce((score, pattern) => score + (pattern.test(lower) ? 1 : 0), 0);
}

function scoreInstruction(lower: string): number {
  return instructionPatterns.reduce((score, pattern) => score + (pattern.test(lower) ? 1 : 0), 0);
}

function scoreCode(prompt: string): number {
  const lower = prompt.toLowerCase();
  const codePatternScore = codePatterns.reduce((s, p) => s + (p.test(lower) ? 1 : 0), 0);
  const codeBlockScore = (prompt.match(/```/g) || []).length > 0 ? 3 : 0;
  return codePatternScore + codeBlockScore;
}

function scoreCreative(lower: string): number {
  return creativePatterns.reduce((score, pattern) => score + (pattern.test(lower) ? 1 : 0), 0);
}

function scoreAnalysis(lower: string): number {
  return analysisPatterns.reduce((score, pattern) => score + (pattern.test(lower) ? 1 : 0), 0);
}

function extractSignals(text: string, patterns: RegExp[]): string[] {
  return patterns.filter((p) => p.test(text)).map((_, i) => `pattern-${i + 1}`);
}
