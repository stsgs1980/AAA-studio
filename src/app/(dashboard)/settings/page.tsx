'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Settings, Save, RotateCcw, Key, Zap,
  CheckCircle, XCircle, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';
import type { LLMSettings, LLMProviderId, LLMModel } from '@/lib/llm';
import { LLM_PROVIDERS, DEFAULT_LLM_SETTINGS } from '@/lib/llm';

const PROVIDER_IDS = Object.keys(LLM_PROVIDERS) as LLMProviderId[];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // LLM Provider state
  const [providerId, setProviderId] = useState<LLMProviderId>(DEFAULT_LLM_SETTINGS.providerId);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(DEFAULT_LLM_SETTINGS.model);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings(data);
      // Restore LLM settings
      if (data.llm_provider) setProviderId(data.llm_provider);
      if (data.llm_api_key) setApiKey(data.llm_api_key);
      if (data.llm_model) setModel(data.llm_model);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = useCallback(async () => {
    try {
      const payload = {
        ...settings,
        llm_provider: providerId,
        llm_api_key: apiKey,
        llm_model: model,
      };
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
  }, [settings, providerId, apiKey, model]);

  const handleReset = useCallback(async () => {
    if (!confirm('Reset all settings to defaults?')) return;
    const defaults: Record<string, string> = {
      theme: 'dark', language: 'en',
      llm_provider: DEFAULT_LLM_SETTINGS.providerId,
      llm_api_key: '', llm_model: DEFAULT_LLM_SETTINGS.model,
      max_tokens: String(DEFAULT_LLM_SETTINGS.maxTokens),
      temperature: String(DEFAULT_LLM_SETTINGS.temperature),
    };
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaults),
      });
      if (!res.ok) throw new Error();
      setSettings(defaults);
      setProviderId(DEFAULT_LLM_SETTINGS.providerId);
      setApiKey('');
      setModel(DEFAULT_LLM_SETTINGS.model);
    } catch { /* silent */ }
  }, []);

  const handleTest = useCallback(async () => {
    if (!apiKey) { setTestResult({ ok: false, msg: 'API key is required' }); return; }
    setTesting(true);
    setTestResult(null);
    try {
      // Save first so the server has the key
      const payload = { ...settings, llm_provider: providerId, llm_api_key: apiKey, llm_model: model };
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // Then test
      const res = await fetch('/api/llm/test');
      const data = await res.json();
      if (data.ok) {
        setTestResult({ ok: true, msg: `Connected: ${data.model} (${data.latencyMs}ms)` });
      } else {
        setTestResult({ ok: false, msg: data.error ?? 'Connection failed' });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Request failed' });
    } finally { setTesting(false); }
  }, [apiKey, providerId, model, settings]);

  const update = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const models = LLM_PROVIDERS[providerId]?.models ?? [];

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PageSkeleton rows={3} />
          <PageSkeleton rows={3} />
        </div>
      </div>
    );
  }

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
        {/* ===== LLM Provider Card ===== */}
        <div className="rounded-xl border bg-card shadow-sm p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-semibold">LLM Provider</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider selector */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm shrink-0">Provider</label>
              <select
                value={providerId}
                onChange={(e) => {
                  const pid = e.target.value as LLMProviderId;
                  setProviderId(pid);
                  // Auto-select first model
                  const first = LLM_PROVIDERS[pid]?.models[0];
                  if (first) setModel(first.id);
                }}
                className="h-9 px-3 rounded-md border bg-background text-sm w-64"
              >
                {PROVIDER_IDS.map((id) => (
                  <option key={id} value={id}>{LLM_PROVIDERS[id].name}</option>
                ))}
              </select>
            </div>
            {/* Model selector */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm shrink-0">Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm w-64">
                {models.map((m: LLMModel) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.inputPrice ? ` ($${m.inputPrice}/M in)` : ''}
                  </option>
                ))}
              </select>
            </div>
            {/* API Key */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm shrink-0">API Key</label>
              <div className="flex items-center gap-1 w-64">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={apiKey ? '••••••••' : 'Enter API key...'}
                    className="h-9 px-3 pr-9 rounded-md border bg-background text-sm w-full"
                  />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="h-9 px-3 rounded-md border text-sm hover:bg-accent disabled:opacity-50 shrink-0"
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
                </button>
              </div>
            </div>
            {/* Status */}
            <div className="flex items-center gap-2 text-sm">
              {testResult ? (
                testResult.ok ? (
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="h-4 w-4" /> {testResult.msg}</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500"><XCircle className="h-4 w-4" /> {testResult.msg}</span>
                )
              ) : apiKey ? (
                <span className="text-muted-foreground">Key set. Click Test to verify.</span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1"><Key className="h-3 w-3" /> No API key configured</span>
              )}
            </div>
          </div>
          {!apiKey && (
            <p className="text-xs text-muted-foreground mt-3 border-t pt-3">
              Get your API key: Z.ai → Others → API Keys | OpenAI → platform.openai.com | Anthropic → console.anthropic.com
            </p>
          )}
        </div>

        {/* ===== Appearance ===== */}
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm shrink-0">Theme</label>
              <select value={settings.theme ?? 'dark'} onChange={(e) => update('theme', e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm w-48">
                {['dark', 'light', 'system'].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm shrink-0">Language</label>
              <select value={settings.language ?? 'en'} onChange={(e) => update('language', e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm w-48">
                {['en', 'ru', 'zh'].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ===== LLM Defaults ===== */}
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">LLM Defaults</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm shrink-0">Max Tokens</label>
              <input type="number" value={settings.max_tokens ?? '4096'} onChange={(e) => update('max_tokens', e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm w-48" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm shrink-0">Temperature</label>
              <div className="flex items-center gap-2 w-48">
                <input type="range" min={0} max={2} step={0.1} value={settings.temperature ?? '0.7'} onChange={(e) => update('temperature', e.target.value)} className="flex-1" />
                <span className="text-sm tabular-nums w-8 text-right">{settings.temperature}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Editor ===== */}
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">Editor</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm shrink-0">Auto-save (ms)</label>
              <input type="number" value={settings.auto_save ?? ''} onChange={(e) => update('auto_save', e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm w-48" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm shrink-0">Snap to Grid</label>
              <select value={settings.snap_to_grid ?? 'false'} onChange={(e) => update('snap_to_grid', e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm w-48">
                {['true', 'false'].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
