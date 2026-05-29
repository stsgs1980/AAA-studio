// 3A Studio — Model pricing table (per 1M tokens, USD)
// Used for cost estimation in flow executions.

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Z.ai (GLM)
  'glm-5.1': { input: 1.4, output: 4.4 },
  'glm-5': { input: 1.0, output: 3.2 },
  'glm-5-turbo': { input: 1.2, output: 4.0 },
  'glm-4.7': { input: 0.6, output: 2.2 },
  'glm-4.7-flashx': { input: 0.07, output: 0.4 },
  'glm-4.6': { input: 0.6, output: 2.2 },
  'glm-4.5': { input: 0.6, output: 2.2 },
  // OpenAI
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10.0, output: 30.0 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  // Anthropic
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'claude-3-5-haiku-20241022': { input: 0.8, output: 4.0 },
  // OpenRouter
  'google/gemini-2.5-flash-preview': { input: 0.15, output: 0.6 },
  'meta-llama/llama-4-maverick': { input: 0.2, output: 0.6 },
  'deepseek/deepseek-chat-v3-0324': { input: 0.14, output: 0.28 },
};

const DEFAULT_PRICING = { input: 1.0, output: 3.0 };

/** Get pricing for a model. Returns default if unknown. */
export function getModelPricing(model: string) {
  return MODEL_PRICING[model] ?? DEFAULT_PRICING;
}

/** Estimate cost in USD for a single LLM call. */
export function estimateCost(
  promptTokens: number,
  completionTokens: number,
  model: string,
): number {
  const p = getModelPricing(model);
  return (promptTokens / 1_000_000) * p.input +
    (completionTokens / 1_000_000) * p.output;
}

/** Format cost as USD string, e.g. "$0.0012" */
export function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}
