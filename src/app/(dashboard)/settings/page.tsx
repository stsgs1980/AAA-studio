'use client';
import type { ReactNode } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';
import { DEFAULT_LLM_SETTINGS } from '@/lib/llm';
import type { LLMProviderId } from '@/lib/llm';
import { LLMProviderCard } from './llm-provider-card';
const cls = 'h-9 px-3 rounded-md border bg-background text-sm w-48';
function F({ l, children }: { l: string; children: ReactNode }) {
  return <div className="flex items-center justify-between gap-4"><label className="text-sm shrink-0">{l}</label>{children}</div>;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pc, setPc] = useState({
    providerId: DEFAULT_LLM_SETTINGS.providerId as LLMProviderId,
    apiKey: '', model: DEFAULT_LLM_SETTINGS.model, baseUrl: '',
  });
  const [lk, setLk] = useState(0);
  const put = useCallback(async (payload: Record<string, string>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
  }, []);
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings(data);
      setPc({
        providerId: (data.llm_provider ?? DEFAULT_LLM_SETTINGS.providerId) as LLMProviderId,
        apiKey: data.llm_api_key ?? '',
        model: data.llm_model ?? DEFAULT_LLM_SETTINGS.model,
        baseUrl: data.llm_base_url ?? '',
      });
      setLk((k) => k + 1);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = useCallback(async () => {
    try {
      await put({ ...settings,
        llm_provider: pc.providerId, llm_api_key: pc.apiKey,
        llm_model: pc.model, llm_base_url: pc.baseUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
  }, [settings, pc, put]);

  const handleReset = useCallback(async () => {
    if (!confirm('Reset all settings to defaults?')) return;
    const d: Record<string, string> = {
      theme: 'dark', language: 'en',
      llm_provider: DEFAULT_LLM_SETTINGS.providerId,
      llm_api_key: '', llm_model: DEFAULT_LLM_SETTINGS.model,
      max_tokens: String(DEFAULT_LLM_SETTINGS.maxTokens),
      temperature: String(DEFAULT_LLM_SETTINGS.temperature),
    };
    try {
      await put(d);
      setSettings(d);
      setPc({ providerId: DEFAULT_LLM_SETTINGS.providerId, apiKey: '', model: DEFAULT_LLM_SETTINGS.model, baseUrl: '' });
      setLk((k) => k + 1);
    } catch { /* silent */ }
  }, [put]);

  const up = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><PageSkeleton rows={3} /><PageSkeleton rows={3} /></div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-accent">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button onClick={handleSave} className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90',
            saved && 'bg-emerald-600',
          )}>
            <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LLMProviderCard key={lk} settings={settings} onProviderChange={setPc} />
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <F l="Theme"><select value={settings.theme ?? 'dark'} onChange={(e) => up('theme', e.target.value)} className={cls}>
              {['dark', 'light', 'system'].map((o) => <option key={o} value={o}>{o}</option>)}
            </select></F>
            <F l="Language"><select value={settings.language ?? 'en'} onChange={(e) => up('language', e.target.value)} className={cls}>
              {['en', 'ru', 'zh'].map((o) => <option key={o} value={o}>{o}</option>)}
            </select></F>
          </div>
        </div>
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">LLM Defaults</h2>
          <div className="space-y-4">
            <F l="Max Tokens"><input type="number" value={settings.max_tokens ?? '4096'} onChange={(e) => up('max_tokens', e.target.value)} className={cls} /></F>
            <F l="Temperature">
              <div className="flex items-center gap-2 w-48">
                <input type="range" min={0} max={2} step={0.1} value={settings.temperature ?? '0.7'} onChange={(e) => up('temperature', e.target.value)} className="flex-1" />
                <span className="text-sm tabular-nums w-8 text-right">{settings.temperature}</span>
              </div>
            </F>
          </div>
        </div>
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">Editor</h2>
          <div className="space-y-4">
            <F l="Auto-save (ms)"><input type="number" value={settings.auto_save ?? ''} onChange={(e) => up('auto_save', e.target.value)} className={cls} /></F>
            <F l="Snap to Grid"><select value={settings.snap_to_grid ?? 'false'} onChange={(e) => up('snap_to_grid', e.target.value)} className={cls}>
              {['true', 'false'].map((o) => <option key={o} value={o}>{o}</option>)}
            </select></F>
          </div>
        </div>
      </div>
    </div>
  );
}
