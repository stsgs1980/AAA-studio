/**
 * LLM provider abstraction.
 * Frontend calls /api/llm which proxies to the configured LLM provider.
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  complete(request: LLMRequest): Promise<LLMResponse>;
}

/**
 * Create an LLM provider that calls the /api/llm endpoint.
 * Server-side route proxies to the active LLM provider configured in Settings.
 */
export function createLLMProvider(): LLMProvider {
  return {
    async complete(request: LLMRequest): Promise<LLMResponse> {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
        }),
      });
      if (!response.ok) {
        throw new Error(`LLM request failed: ${response.status}`);
      }
      const data = await response.json();
      return {
        content: data.choices?.[0]?.message?.content ?? '',
        model: data.model ?? request.model,
        usage: data.usage,
      };
    },
  };
}

/** Available models for the UI dropdown. */
export const AVAILABLE_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
] as const;
