'use client';
import { useState, useCallback } from 'react';
import { Zap, CheckCircle, XCircle, Loader2, Eye, EyeOff, Plus } from 'lucide-react';
import type { LLMProviderId } from '@/lib/llm';
import { LLM_PROVIDERS, DEFAULT_LLM_SETTINGS } from '@/lib/llm';

const PIDS = Object.keys(LLM_PROVIDERS) as LLMProviderId[];
const IC = 'h-8 px-2 rounded-md border bg-background text-sm';

interface Props {
  settings: Record<string, string>;
  onProviderChange: (c: { providerId: LLMProviderId; apiKey: string; model: string; baseUrl: string }) => void;
}

export function LLMProviderCard({ settings, onProviderChange }: Props) {
  const [pid, setPid] = useState<LLMProviderId>(
    (settings.llm_provider as LLMProviderId) ?? DEFAULT_LLM_SETTINGS.providerId,
  );
  const [key, setKey] = useState(settings.llm_api_key ?? '');
  const [show, setShow] = useState(false);
  const [model, setModel] = useState(settings.llm_model ?? DEFAULT_LLM_SETTINGS.model);
  const [ep, setEp] = useState(settings.llm_base_url || LLM_PROVIDERS[pid]?.baseUrl || '');
  const [custom, setCustom] = useState(!PIDS.some(
    p => LLM_PROVIDERS[p].models.some(m => m.id === (settings.llm_model ?? '')),
  ));
  const [testing, setTesting] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null);

  const pick = (p: LLMProviderId) => {
    setPid(p);
    const url = LLM_PROVIDERS[p]?.baseUrl ?? '';
    setEp(url);
    const m = LLM_PROVIDERS[p]?.models[0]?.id ?? '';
    setModel(m); setCustom(false);
    onProviderChange({ providerId: p, apiKey: key, model: m, baseUrl: url });
  };

  const test = useCallback(async () => {
    if (!key || !ep) { setRes({ ok: false, msg: 'Endpoint + API key required' }); return; }
    setTesting(true); setRes(null);
    try {
      await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ llm_provider: pid, llm_api_key: key, llm_model: model, llm_base_url: ep }),
      });
      const d = await (await fetch('/api/llm/test')).json();
      setRes(d.ok ? { ok: true, msg: `${d.model} — ${d.latencyMs}ms` }
        : { ok: false, msg: d.error?.slice(0, 100) ?? 'Failed' });
    } catch { setRes({ ok: false, msg: 'Network error' }); }
    finally { setTesting(false); }
  }, [key, ep, pid, model]);

  const models = LLM_PROVIDERS[pid]?.models ?? [];
  const statusBadge = res ? (res.ok
    ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-3.5 w-3.5" />{res.msg}</span>
    : <span className="flex items-center gap-1 text-xs text-red-500"><XCircle className="h-3.5 w-3.5" />{res.msg}</span>) : null;

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /><h2 className="text-sm font-semibold">LLM Provider</h2></div>
        {statusBadge}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Row label="Provider">
          <select value={pid} onChange={e => pick(e.target.value as LLMProviderId)} className={`${IC} flex-1`}>
            {PIDS.map(id => <option key={id} value={id}>{LLM_PROVIDERS[id].name}</option>)}
          </select>
        </Row>
        <Row label="Endpoint">
          <input value={ep} onChange={e => setEp(e.target.value)}
            placeholder={LLM_PROVIDERS[pid]?.baseUrl} className={`${IC} flex-1 font-mono text-xs`} />
        </Row>
        <Row label="API Key">
          <div className="relative flex-1">
            <input type={show ? 'text' : 'password'} value={key} onChange={e => setKey(e.target.value)}
              placeholder="Enter API key..." className={`${IC} pr-7 w-full font-mono text-xs`} />
            <button onClick={() => setShow(!show)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </Row>
        <Row label="Model">
          {custom ? (
            <div className="flex gap-1 flex-1">
              <input value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. my-model"
                className={`${IC} flex-1 font-mono text-xs`} />
              <button onClick={() => { setCustom(false); setModel(LLM_PROVIDERS[pid]?.models[0]?.id ?? ''); }}
                className="h-8 px-2 rounded-md border text-xs text-muted-foreground hover:bg-accent">List</button>
            </div>
          ) : (
            <div className="flex gap-1 flex-1">
              <select value={model} onChange={e => setModel(e.target.value)} className={`${IC} flex-1`}>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}{m.inputPrice ? ` ($${m.inputPrice}/M)` : ''}</option>)}
              </select>
              <button onClick={() => { setCustom(true); setModel(''); }}
                className="h-8 px-1.5 rounded-md border text-muted-foreground hover:bg-accent"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          )}
        </Row>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t">
        <span className="text-[11px] text-muted-foreground">
          Z.ai → docs.z.ai &ensp;|&ensp; OpenAI → platform.openai.com &ensp;|&ensp; Anthropic → console.anthropic.com
        </span>
        <button onClick={test} disabled={testing || !key}
          className="h-8 px-4 rounded-md border text-sm font-medium hover:bg-accent disabled:opacity-40 flex items-center gap-1.5">
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}{testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><label className="text-xs text-muted-foreground w-16 shrink-0">{label}</label>{children}</div>;
}
