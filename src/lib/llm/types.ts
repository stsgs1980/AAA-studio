// ============================================================================
// 3A Studio -- Universal LLM Provider Types
// ============================================================================

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  id: string;
  content: string;
  model: string;
  finishReason: string;
  usage?: LLMUsage;
}

export type LLMProviderId = 'zai' | 'openai' | 'anthropic' | 'openrouter';
export type LLMProviderFormat = 'openai' | 'anthropic';

/** Stored per-provider config -- supports built-in + custom providers */
export interface ProviderConfig {
  id: string;            // unique key, e.g. 'zai', 'openai', 'my-groq'
  name: string;          // display name
  baseUrl: string;       // API endpoint
  apiKey: string;
  models: LLMModel[];
  enabled: boolean;
  format: LLMProviderFormat;  // API format
}

export interface LLMModel {
  id: string;
  name: string;
  inputPrice?: number;
  outputPrice?: number;
  contextWindow?: number;
}

/** Active LLM selection -- which provider + model is currently in use */
export interface LLMSettings {
  activeProviderId: string;  // which provider config to use
  activeModel: string;
  temperature: number;
  maxTokens: number;
}

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  activeProviderId: 'zai',
  activeModel: 'glm-4.7-flashx',
  temperature: 0.7,
  maxTokens: 4096,
};

export const LLM_PROVIDERS: Record<string, {
  id: LLMProviderId;
  name: string;
  baseUrl: string;
  models: LLMModel[];
}> = {
  zai: {
    id: 'zai',
    name: 'Z.ai (GLM)',
    baseUrl: 'https://api.z.ai/api/paas/v4',
    models: [
      { id: 'glm-5.1', name: 'GLM-5.1', inputPrice: 1.4, outputPrice: 4.4, contextWindow: 128000 },
      { id: 'glm-5', name: 'GLM-5', inputPrice: 1.0, outputPrice: 3.2, contextWindow: 128000 },
      { id: 'glm-5-turbo', name: 'GLM-5 Turbo', inputPrice: 1.2, outputPrice: 4.0, contextWindow: 128000 },
      { id: 'glm-4.7', name: 'GLM-4.7', inputPrice: 0.6, outputPrice: 2.2, contextWindow: 128000 },
      { id: 'glm-4.7-flashx', name: 'GLM-4.7 FlashX', inputPrice: 0.07, outputPrice: 0.4, contextWindow: 128000 },
      { id: 'glm-4.6', name: 'GLM-4.6', inputPrice: 0.6, outputPrice: 2.2, contextWindow: 128000 },
      { id: 'glm-4.5', name: 'GLM-4.5', inputPrice: 0.6, outputPrice: 2.2, contextWindow: 128000 },
    ],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', inputPrice: 2.5, outputPrice: 10.0, contextWindow: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', inputPrice: 0.15, outputPrice: 0.6, contextWindow: 128000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', inputPrice: 10.0, outputPrice: 30.0, contextWindow: 128000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', inputPrice: 0.5, outputPrice: 1.5, contextWindow: 16385 },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', inputPrice: 3.0, outputPrice: 15.0, contextWindow: 200000 },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', inputPrice: 3.0, outputPrice: 15.0, contextWindow: 200000 },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', inputPrice: 0.8, outputPrice: 4.0, contextWindow: 200000 },
    ],
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', inputPrice: 0.15, outputPrice: 0.6, contextWindow: 1000000 },
      { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', inputPrice: 0.2, outputPrice: 0.6, contextWindow: 128000 },
      { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3', inputPrice: 0.14, outputPrice: 0.28, contextWindow: 65536 },
    ],
  },
};

/** Convert a built-in provider into a ProviderConfig (empty apiKey, enabled=false) */
export function builtinToConfig(id: LLMProviderId): ProviderConfig {
  const p = LLM_PROVIDERS[id];
  if (!p) throw new Error(`Unknown built-in provider: ${id}`);
  return {
    id: p.id, name: p.name, baseUrl: p.baseUrl,
    apiKey: '', models: p.models, enabled: id === 'zai',
    format: id === 'anthropic' ? 'anthropic' : 'openai',
  };
}

/** Create a blank custom provider config */
export function blankCustomProvider(name?: string): ProviderConfig {
  return {
    id: name ? `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` : `custom-${Date.now()}`,
    name: name ?? 'New Provider',
    baseUrl: '', apiKey: '', models: [], enabled: true,
    format: 'openai',
  };
}
