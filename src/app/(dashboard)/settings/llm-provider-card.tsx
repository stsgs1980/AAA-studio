'use client';
import { useState } from 'react';
import { Zap } from 'lucide-react';
import type { ProviderConfig } from '@/lib/llm';
import { LLM_PROVIDERS, builtinToConfig, blankCustomProvider } from '@/lib/llm';
import type { LLMProviderId } from '@/lib/llm';
import { AddMenu } from './add-provider-menu';
import { ProviderRow } from './provider-row';

interface Props {
  providers: ProviderConfig[];
  activeProviderId: string;
  activeModel: string;
  onProvidersChange: (providers: ProviderConfig[]) => void;
  onActiveChange: (providerId: string, model: string) => void;
}

export function LLMProviderCard({
  providers, activeProviderId, activeModel,
  onProvidersChange, onActiveChange,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(activeProviderId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const setTestResult = (id: string, r: { ok: boolean; msg: string }) =>
    setTestResults(prev => ({ ...prev, [id]: r }));

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  const addBuiltin = (id: LLMProviderId) => {
    if (providers.some(p => p.id === id)) return;
    onProvidersChange([...providers, builtinToConfig(id)]);
    setMenuOpen(false);
    setExpanded(id);
  };

  const addCustom = () => {
    const p = blankCustomProvider();
    onProvidersChange([...providers, p]);
    setExpanded(p.id);
    setMenuOpen(false);
  };

  const remove = (id: string) => {
    onProvidersChange(providers.filter(p => p.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const update = (id: string, patch: Partial<ProviderConfig>) => {
    onProvidersChange(providers.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  const updateModel = (id: string, model: string) => {
    const existing = providers.find(p => p.id === id)?.models ?? [];
    if (existing.some(m => m.id === model)) { onActiveChange(id, model); return; }
    update(id, { models: [...existing, { id: model, name: model }] });
    onActiveChange(id, model);
  };

  const removeModel = (id: string, modelId: string) => {
    const p = providers.find(pr => pr.id === id);
    if (!p) return;
    update(id, { models: p.models.filter(m => m.id !== modelId) });
  };

  const testProvider = async (p: ProviderConfig) => {
    setTestingId(p.id);
    setTestResult(p.id, { ok: false, msg: 'Testing...' });
    try {
      await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llm_providers: JSON.stringify(providers.map(pr =>
            pr.id === p.id ? { ...pr, apiKey: p.apiKey, baseUrl: p.baseUrl, enabled: true } : pr,
          )),
          llm_active_provider: p.id,
        }),
      });
      const res = await fetch('/api/llm/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: p.id, model: activeModel }),
      });
      const d = await res.json();
      setTestResult(p.id, d.ok
        ? { ok: true, msg: `${d.model} — ${d.latencyMs}ms` }
        : { ok: false, msg: d.error?.slice(0, 120) ?? 'Failed' });
    } catch { setTestResult(p.id, { ok: false, msg: 'Network error' }); }
    finally { setTestingId(null); }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 lg:col-span-2 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="text-sm font-semibold">LLM Providers</h2>
          <span className="text-xs text-muted-foreground">
            ({providers.filter(p => p.enabled).length} active)
          </span>
        </div>
        <AddMenu providers={providers} open={menuOpen} setOpen={setMenuOpen}
          addBuiltin={addBuiltin} addCustom={addCustom} />
      </div>

      <div className="space-y-2">
        {providers.map(p => (
          <ProviderRow key={p.id} provider={p}
            isActive={p.id === activeProviderId}
            activeModel={activeModel}
            expanded={expanded === p.id}
            isBuiltin={p.id in LLM_PROVIDERS}
            testing={testingId === p.id}
            testResult={testResults[p.id]}
            onToggle={() => toggle(p.id)}
            onUpdate={(patch) => update(p.id, patch)}
            onRemove={() => remove(p.id)}
            onSelect={(model) => onActiveChange(p.id, model)}
            onAddModel={(model) => updateModel(p.id, model)}
            onRemoveModel={(mid) => removeModel(p.id, mid)}
            onTest={() => testProvider(p)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-[11px] text-muted-foreground">
          Z.ai → docs.z.ai &ensp;|&ensp; OpenAI → platform.openai.com &ensp;|&ensp; Anthropic → console.anthropic.com
        </span>
      </div>
    </div>
  );
}
