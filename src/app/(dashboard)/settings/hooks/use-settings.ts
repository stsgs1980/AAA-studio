'use client';
import { useEffect, useState, useCallback } from 'react';
import { DEFAULT_LLM_SETTINGS, builtinToConfig } from '@/lib/llm';
import type { ProviderConfig } from '@/lib/llm';
import type { Locale } from '@/lib/i18n/translations';

function defaults() {
  return (['zai', 'openai', 'anthropic', 'openrouter'] as const).map(id => builtinToConfig(id));
}

export function useSettings(locale: Locale, setLocale: (l: Locale) => void, t: { settings: Record<string, string> }) {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [activeId, setActiveId] = useState(DEFAULT_LLM_SETTINGS.activeProviderId);
  const [activeModel, setActiveModel] = useState(DEFAULT_LLM_SETTINGS.activeModel);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const put = useCallback(async (p: Record<string, string>) => {
    const r = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
    if (!r.ok) throw new Error();
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error();
      const d = await res.json();
      setSettings(d);
      if (d.llm_providers) { try { setProviders(JSON.parse(d.llm_providers)); } catch { /* */ } }
      else { setProviders(defaults()); }
      setActiveId(d.llm_active_provider ?? DEFAULT_LLM_SETTINGS.activeProviderId);
      setActiveModel(d.llm_active_model ?? DEFAULT_LLM_SETTINGS.activeModel);
      if (d.language && d.language in ['en', 'ru']) setLocale(d.language as Locale);
    } catch { /* */ } finally { setLoading(false); }
  }, [setLocale]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async () => {
    try {
      await put({ ...settings, llm_providers: JSON.stringify(providers), llm_active_provider: activeId,
        llm_active_model: activeModel, language: locale,
        max_tokens: settings.max_tokens ?? String(DEFAULT_LLM_SETTINGS.maxTokens),
        temperature: settings.temperature ?? String(DEFAULT_LLM_SETTINGS.temperature) });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch { /* */ }
  }, [settings, providers, activeId, activeModel, locale, put]);

  const reset = useCallback(async () => {
    if (!confirm(t.settings['Reset all settings to defaults?'])) return;
    const d = defaults();
    const p: Record<string, string> = { theme: 'dark', language: 'en',
      llm_providers: JSON.stringify(d),
      llm_active_provider: DEFAULT_LLM_SETTINGS.activeProviderId,
      llm_active_model: DEFAULT_LLM_SETTINGS.activeModel,
      max_tokens: String(DEFAULT_LLM_SETTINGS.maxTokens),
      temperature: String(DEFAULT_LLM_SETTINGS.temperature) };
    try {
      await put(p); setSettings(p); setProviders(d);
      setActiveId(DEFAULT_LLM_SETTINGS.activeProviderId);
      setActiveModel(DEFAULT_LLM_SETTINGS.activeModel); setLocale('en');
    } catch { /* */ }
  }, [put, setLocale, t]);

  const up = useCallback((k: string, v: string) => setSettings(prev => ({ ...prev, [k]: v })), []);

  return { mounted, loading, settings, providers, activeId, activeModel, saved, up, save, reset, setActiveId, setActiveModel, setProviders };
}