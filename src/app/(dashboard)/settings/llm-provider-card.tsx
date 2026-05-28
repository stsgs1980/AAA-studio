'use client';

import { useState, useCallback } from 'react';
import {
  Key, Zap, CheckCircle, XCircle, Loader2, Eye, EyeOff,
} from 'lucide-react';
import type { LLMProviderId, LLMModel } from '@/lib/llm';
import { LLM_PROVIDERS, DEFAULT_LLM_SETTINGS } from '@/lib/llm';

const PROVIDER_IDS = Object.keys(LLM_PROVIDERS) as LLMProviderId[];

interface LLMProviderCardProps {
  settings: Record<string, string>;
  onSettingsChange: (s: Record<string, string>) => void;
  onProviderChange: (config: { providerId: LLMProviderId; apiKey: string; model: string }) => void;
}

export function LLMProviderCard({ settings, onProviderChange }: LLMProviderCardProps) {
  const [providerId, setProviderId] = useState<LLMProviderId>(
    (settings.llm_provider as LLMProviderId) ?? DEFAULT_LLM_SETTINGS.providerId,
  );
  const [apiKey, setApiKey] = useState(settings.llm_api_key ?? '');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(settings.llm_model ?? DEFAULT_LLM_SETTINGS.model);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const notify = useCallback(
    (pid: LLMProviderId, key: string, m: string) => onProviderChange({ providerId: pid, apiKey: key, model: m }),
    [onProviderChange],
  );

  const handleProviderChange = (pid: LLMProviderId) => {
    setProviderId(pid);
    const first = LLM_PROVIDERS[pid]?.models[0];
    const newModel = first ? first.id : model;
    setModel(newModel);
    notify(pid, apiKey, newModel);
  };

  const handleModelChange = (m: string) => { setModel(m); notify(providerId, apiKey, m); };
  const handleKeyChange = (k: string) => { setApiKey(k); notify(providerId, k, model); };

  const handleTest = useCallback(async () => {
    if (!apiKey) { setTestResult({ ok: false, msg: 'API key is required' }); return; }
    setTesting(true);
    setTestResult(null);
    try {
      const payload = { ...settings, llm_provider: providerId, llm_api_key: apiKey, llm_model: model };
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const res = await fetch('/api/llm/test');
      const data = await res.json();
      setTestResult(data.ok
        ? { ok: true, msg: `Connected: ${data.model} (${data.latencyMs}ms)` }
        : { ok: false, msg: data.error ?? 'Connection failed' });
    } catch {
      setTestResult({ ok: false, msg: 'Request failed' });
    } finally { setTesting(false); }
  }, [apiKey, providerId, model, settings]);

  const models = LLM_PROVIDERS[providerId]?.models ?? [];

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 lg:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-amber-500" />
        <h2 className="text-sm font-semibold">LLM Provider</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm shrink-0">Provider</label>
          <select
            value={providerId}
            onChange={(e) => handleProviderChange(e.target.value as LLMProviderId)}
            className="h-9 px-3 rounded-md border bg-background text-sm w-64"
          >
            {PROVIDER_IDS.map((id) => (
              <option key={id} value={id}>{LLM_PROVIDERS[id].name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm shrink-0">Model</label>
          <select value={model} onChange={(e) => handleModelChange(e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm w-64">
            {models.map((m: LLMModel) => (
              <option key={m.id} value={m.id}>
                {m.name}{m.inputPrice ? ` ($${m.inputPrice}/M in)` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm shrink-0">API Key</label>
          <div className="flex items-center gap-1 w-64">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
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
  );
}
