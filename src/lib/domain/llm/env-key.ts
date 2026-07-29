// 3A Studio -- LLM env-key injection
// Auto-injects API keys from environment variables into provider configs.

import type { ProviderConfig } from './types';

/** Map of provider id → env var name for auto-injection */
const ENV_KEY_MAP: Record<string, string> = {
  zai: 'ZAI_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
};

/** Inject env var API key into provider config when no key stored in DB */
export function injectEnvKey(provider: ProviderConfig): void {
  if (provider.apiKey) return;
  const envName = ENV_KEY_MAP[provider.id];
  if (!envName) return;
  const envKey = process.env[envName];
  if (envKey) provider.apiKey = envKey;
}
