// 3A Studio -- LLM Settings helper
// Stores provider list as JSON in Settings table + active selection.

import { db } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/crypto';
import type { LLMSettings, ProviderConfig, LLMProviderId } from './types';
import { DEFAULT_LLM_SETTINGS, LLM_PROVIDERS, builtinToConfig } from './types';
import { injectEnvKey } from './env-key';

const PROVIDERS_KEY = 'llm_providers';

const SETTINGS_MAP: Record<string, keyof LLMSettings> = {
  llm_active_provider: 'activeProviderId',
  llm_active_model: 'activeModel',
  llm_temperature: 'temperature',
  llm_max_tokens: 'maxTokens',
};

// ---- Provider configs (JSON array) ----

/** Get all provider configs from DB (apiKeys decrypted) */
export async function getProviders(): Promise<ProviderConfig[]> {
  try {
    const row = await db.settings.findUnique({ where: { key: PROVIDERS_KEY } });
    if (!row?.value) return defaultProviders();
    const parsed = JSON.parse(row.value) as ProviderConfig[];
    if (!Array.isArray(parsed)) return defaultProviders();
    const decrypted = parsed.map(p => ({
      ...p,
      apiKey: p.apiKey ? decrypt(p.apiKey) : '',
    }));
    return mergeWithBuiltins(decrypted);
  } catch {
    return defaultProviders();
  }
}

/** Save all provider configs to DB (apiKeys encrypted) */
export async function saveProviders(providers: ProviderConfig[]): Promise<void> {
  const encrypted = providers.map(p => ({
    ...p,
    apiKey: p.apiKey ? encrypt(p.apiKey) : '',
  }));
  await db.settings.upsert({
    where: { key: PROVIDERS_KEY },
    update: { value: JSON.stringify(encrypted) },
    create: { id: `cfg-${PROVIDERS_KEY}`, key: PROVIDERS_KEY, value: JSON.stringify(encrypted) },
  });
}

/** Get active provider — auto-injects ZAI_API_KEY env var when no key in DB */
export async function getActiveProvider(): Promise<{
  provider: ProviderConfig;
  model: string;
  settings: LLMSettings;
} | null> {
  const settings = await getLLMSettings();
  const providers = await getProviders();
  const active = providers.find(p => p.id === settings.activeProviderId && p.enabled);
  if (!active) return null;
  injectEnvKey(active);
  return { provider: active, model: settings.activeModel, settings };
}

// ---- Active LLM selection ----

export async function getLLMSettings(): Promise<LLMSettings> {
  try {
    const rows = await db.settings.findMany({ where: { key: { startsWith: 'llm_' } } });
    const map: Partial<LLMSettings> = {};
    for (const row of rows) {
      const field = SETTINGS_MAP[row.key];
      if (!field) continue;
      if (field === 'temperature') map[field] = parseFloat(row.value) || DEFAULT_LLM_SETTINGS.temperature;
      else if (field === 'maxTokens') map[field] = parseInt(row.value, 10) || DEFAULT_LLM_SETTINGS.maxTokens;
      else map[field] = row.value;
    }
    return { ...DEFAULT_LLM_SETTINGS, ...map };
  } catch (error) {
    console.error('[LLM Settings] Failed to read:', error instanceof Error ? error.message : error);
    return { ...DEFAULT_LLM_SETTINGS };
  }
}

export async function saveLLMSettings(partial: Partial<LLMSettings>): Promise<void> {
  const ops = Object.entries(partial)
    .filter(([_, v]) => v !== undefined)
    .map(([key, val]) => {
      const dbKey = Object.entries(SETTINGS_MAP).find(([, v]) => v === key)?.[0];
      if (!dbKey) return null;
      return db.settings.upsert({
        where: { key: dbKey },
        update: { value: String(val) },
        create: { id: `cfg-${dbKey}`, key: dbKey, value: String(val) },
      });
    })
    .filter(Boolean);
  await Promise.all(ops);
}

export function isLLMConfigured(settings: LLMSettings): boolean {
  return !!(settings.activeProviderId && settings.activeModel);
}

export function getAvailableModels(providerId: LLMProviderId) {
  return LLM_PROVIDERS[providerId]?.models ?? [];
}

function defaultProviders(): ProviderConfig[] {
  return ['zai', 'openai', 'anthropic', 'openrouter'].map(
    id => builtinToConfig(id as LLMProviderId),
  );
}

function mergeWithBuiltins(saved: ProviderConfig[]): ProviderConfig[] {
  const savedIds = new Set(saved.map(p => p.id));
  const builtins = defaultProviders().filter(p => !savedIds.has(p.id));
  const updated = saved.map(p => {
    const builtin = LLM_PROVIDERS[p.id as LLMProviderId];
    if (builtin && (p.format === 'openai' || p.format === 'anthropic')) {
      return { ...p, models: builtin.models, baseUrl: p.baseUrl || builtin.baseUrl };
    }
    return p;
  });
  return [...updated, ...builtins];
}
