'use client';
import { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';
import { DEFAULT_LLM_SETTINGS, builtinToConfig } from '@/lib/llm';
import type { ProviderConfig } from '@/lib/llm';
import { LLMProviderCard } from './llm-provider-card';

const cls = 'h-9 px-3 rounded-md border bg-background text-sm w-48';
const SEL = (opts: string[]) => opts.map(o => <option key={o} value={o}>{o}</option>);

function F({ l, children }: { l: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4"><label className="text-sm shrink-0">{l}</label>{children}</div>;
}

function defaults() {
  return (['zai', 'openai', 'anthropic', 'openrouter'] as const).map(id => builtinToConfig(id));
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [activeId, setActiveId] = useState(DEFAULT_LLM_SETTINGS.activeProviderId);
  const [activeModel, setActiveModel] = useState(DEFAULT_LLM_SETTINGS.activeModel);

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
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async () => {
    try {
      await put({ ...settings, llm_providers: JSON.stringify(providers), llm_active_provider: activeId,
        llm_active_model: activeModel, max_tokens: settings.max_tokens ?? String(DEFAULT_LLM_SETTINGS.maxTokens),
        temperature: settings.temperature ?? String(DEFAULT_LLM_SETTINGS.temperature) });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch { /* */ }
  }, [settings, providers, activeId, activeModel, put]);

  const reset = useCallback(async () => {
    if (!confirm('Reset all settings to defaults?')) return;
    const d = defaults();
    const p: Record<string, string> = { theme: 'dark', language: 'en', llm_providers: JSON.stringify(d),
      llm_active_provider: DEFAULT_LLM_SETTINGS.activeProviderId, llm_active_model: DEFAULT_LLM_SETTINGS.activeModel,
      max_tokens: String(DEFAULT_LLM_SETTINGS.maxTokens), temperature: String(DEFAULT_LLM_SETTINGS.temperature) };
    try { await put(p); setSettings(p); setProviders(d); setActiveId(DEFAULT_LLM_SETTINGS.activeProviderId); setActiveModel(DEFAULT_LLM_SETTINGS.activeModel); }
    catch { /* */ }
  }, [put]);

  const up = (k: string, v: string) => setSettings(prev => ({ ...prev, [k]: v }));

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3"><Settings className="h-6 w-6 text-muted-foreground" /><h1 className="text-2xl font-bold tracking-tight">Settings</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><PageSkeleton rows={3} /><PageSkeleton rows={3} /></div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Settings className="h-6 w-6 text-muted-foreground" /><h1 className="text-2xl font-bold tracking-tight">Settings</h1></div>
        <div className="flex gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-accent"><RotateCcw className="h-4 w-4" /> Reset</button>
          <button onClick={save} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90', saved && 'bg-emerald-600')}>
            <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save'}</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LLMProviderCard providers={providers} activeProviderId={activeId} activeModel={activeModel}
          onProvidersChange={setProviders} onActiveChange={(id, m) => { setActiveId(id); setActiveModel(m); }} />
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <F l="Theme"><select value={theme ?? 'dark'} onChange={e => { setTheme(e.target.value); up('theme', e.target.value); }} className={cls}>{SEL(['dark', 'light', 'system'])}</select></F>
          </div>
        </div>
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">LLM Defaults</h2>
          <div className="space-y-4">
            <F l="Max Tokens"><input type="number" value={settings.max_tokens ?? '4096'} onChange={e => up('max_tokens', e.target.value)} className={cls} /></F>
            <F l="Temperature"><div className="flex items-center gap-2 w-48">
              <input type="range" min={0} max={2} step={0.1} value={settings.temperature ?? '0.7'} onChange={e => up('temperature', e.target.value)} className="flex-1" />
              <span className="text-sm tabular-nums w-8 text-right">{settings.temperature}</span>
            </div></F>
          </div>
        </div>
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">Editor</h2>
          <div className="space-y-4">
            <F l="Auto-save"><input type="number" value={settings.auto_save ?? ''} onChange={e => up('auto_save', e.target.value)} className={cls} /></F>
            <F l="Snap Grid"><select value={settings.snap_to_grid ?? 'false'} onChange={e => up('snap_to_grid', e.target.value)} className={cls}>{SEL(['true', 'false'])}</select></F>
          </div>
        </div>
      </div>
    </div>
  );
}
