// ============================================================================
// 3A Studio — LLM Settings helper
// Reads/writes LLM config from DB Settings table.
// ============================================================================

import { db } from '@/lib/db';
import type { LLMSettings, LLMProviderId } from './types';
import { DEFAULT_LLM_SETTINGS, LLM_PROVIDERS } from './types';

const SETTINGS_PREFIX = 'llm_';

const SETTINGS_MAP: Record<string, keyof LLMSettings> = {
  llm_provider: 'providerId',
  llm_api_key: 'apiKey',
  llm_model: 'model',
  llm_temperature: 'temperature',
  llm_max_tokens: 'maxTokens',
};

/** Read LLM settings from DB, merge with defaults */
export async function getLLMSettings(): Promise<LLMSettings> {
  const rows = await db.settings.findMany({
    where: { key: { startsWith: SETTINGS_PREFIX } },
  });

  const map: Partial<LLMSettings> = {};
  for (const row of rows) {
    const field = SETTINGS_MAP[row.key];
    if (!field) continue;
    if (field === 'temperature') {
      map[field] = parseFloat(row.value) || DEFAULT_LLM_SETTINGS.temperature;
    } else if (field === 'maxTokens') {
      map[field] = parseInt(row.value, 10) || DEFAULT_LLM_SETTINGS.maxTokens;
    } else if (field === 'providerId') {
      map[field] = row.value as LLMProviderId;
    } else {
      map[field] = row.value;
    }
  }

  return { ...DEFAULT_LLM_SETTINGS, ...map };
}

/** Save LLM settings to DB (partial update) */
export async function saveLLMSettings(partial: Partial<LLMSettings>): Promise<void> {
  const ops = Object.entries(partial)
    .filter(([_, v]) => v !== undefined)
    .map(([key, val]) => {
      const dbKey = Object.entries(SETTINGS_MAP).find(([, v]) => v === key)?.[0];
      if (!dbKey) return null;
      const value = typeof val === 'number' ? String(val) : String(val);
      return db.settings.upsert({
        where: { key: dbKey },
        update: { value },
        create: { key: dbKey, value },
      });
    })
    .filter(Boolean);

  await Promise.all(ops);
}

/** Check if LLM is fully configured (has provider + API key) */
export function isLLMConfigured(settings: LLMSettings): boolean {
  return !!(settings.providerId && settings.apiKey);
}

/** Get available models for the current provider */
export function getAvailableModels(providerId: LLMProviderId) {
  return LLM_PROVIDERS[providerId]?.models ?? [];
}
