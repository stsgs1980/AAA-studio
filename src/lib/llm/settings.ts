// ============================================================================
// 3A Studio — LLM Settings helper
// Stores provider list as JSON in Settings table + active selection.
// ============================================================================

import { db } from '@/lib/db';
import type { LLMSettings, ProviderConfig, LLMProviderId } from './types';
import { DEFAULT_LLM_SETTINGS, LLM_PROVIDERS, builtinToConfig } from './types';

// DB key for provider configs JSON array
const PROVIDERS_KEY = 'llm_providers';

// Active selection keys
const SETTINGS_MAP: Record<string, keyof LLMSettings> = {
  llm_active_provider: 'activeProviderId',
  llm_active_model: 'activeModel',
  llm_temperature: 'temperature',
  llm_max_tokens: 'maxTokens',
};

// ---- Raw SQL upsert helper ----
async function upsertSetting(key: string, value: string) {
  await db.$executeRawUnsafe(
    `INSERT INTO "Settings" (id, key, value, "updatedAt")
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $3, "updatedAt" = NOW()`,
    `cfg-${key}`, key, value,
  );
}

// ---- Provider configs (JSON array) ----

/** Get all provider configs from DB */
export async function getProviders(): Promise<ProviderConfig[]> {
  try {
    const row = await db.settings.findUnique({ where: { key: PROVIDERS_KEY } });
    if (!row?.value) return defaultProviders();
    const parsed = JSON.parse(row.value) as ProviderConfig[];
    if (!Array.isArray(parsed)) return defaultProviders();
    // Merge with built-in providers that aren't yet in the list
    return mergeWithBuiltins(parsed);
  } catch {
    return defaultProviders();
  }
}

/** Save all provider configs to DB */
export async function saveProviders(providers: ProviderConfig[]): Promise<void> {
  await upsertSetting(PROVIDERS_KEY, JSON.stringify(providers));
}

/** Get the currently active provider config + its selected model */
export async function getActiveProvider(): Promise<{
  provider: ProviderConfig;
  model: string;
  settings: LLMSettings;
} | null> {
  const settings = await getLLMSettings();
  const providers = await getProviders();
  const active = providers.find(p => p.id === settings.activeProviderId && p.enabled);
  if (!active) return null;
  return { provider: active, model: settings.activeModel, settings };
}

// ---- Active LLM selection ----

/** Read active LLM settings from DB, merge with defaults */
export async function getLLMSettings(): Promise<LLMSettings> {
  const rows = await db.settings.findMany({
    where: { key: { startsWith: 'llm_' } },
  });

  const map: Partial<LLMSettings> = {};
  for (const row of rows) {
    const field = SETTINGS_MAP[row.key];
    if (!field) continue;
    if (field === 'temperature') {
      map[field] = parseFloat(row.value) || DEFAULT_LLM_SETTINGS.temperature;
    } else if (field === 'maxTokens') {
      map[field] = parseInt(row.value, 10) || DEFAULT_LLM_SETTINGS.maxTokens;
    } else {
      map[field] = row.value;
    }
  }

  return { ...DEFAULT_LLM_SETTINGS, ...map };
}

/** Save active LLM settings (partial update) */
export async function saveLLMSettings(partial: Partial<LLMSettings>): Promise<void> {
  const ops = Object.entries(partial)
    .filter(([_, v]) => v !== undefined)
    .map(([key, val]) => {
      const dbKey = Object.entries(SETTINGS_MAP).find(([, v]) => v === key)?.[0];
      if (!dbKey) return null;
      return upsertSetting(dbKey, String(val));
    })
    .filter(Boolean);

  await Promise.all(ops);
}

/** Check if LLM is fully configured */
export function isLLMConfigured(settings: LLMSettings): boolean {
  return !!(settings.activeProviderId && settings.activeModel);
}

/** Get available models for a provider id (legacy compat) */
export function getAvailableModels(providerId: LLMProviderId) {
  return LLM_PROVIDERS[providerId]?.models ?? [];
}

// ---- Internal helpers ----

function defaultProviders(): ProviderConfig[] {
  return ['zai', 'openai', 'anthropic', 'openrouter'].map(
    id => builtinToConfig(id as LLMProviderId),
  );
}

/** Merge user saved providers with built-in ones not yet present */
function mergeWithBuiltins(saved: ProviderConfig[]): ProviderConfig[] {
  const savedIds = new Set(saved.map(p => p.id));
  const builtins = defaultProviders().filter(p => !savedIds.has(p.id));
  // Update model lists for built-in providers (they may have been extended)
  const updated = saved.map(p => {
    const builtin = LLM_PROVIDERS[p.id as LLMProviderId];
    if (builtin && (p.format === 'openai' || p.format === 'anthropic')) {
      // Keep user's apiKey, enabled, baseUrl — only refresh model list
      return { ...p, models: builtin.models, baseUrl: p.baseUrl || builtin.baseUrl };
    }
    return p;
  });
  return [...updated, ...builtins];
}
