'use client';
import { useState } from 'react';
import {
  CheckCircle, XCircle, Loader2, Eye, EyeOff,
  Plus, Trash2, ChevronDown, ChevronUp, GripVertical, ExternalLink,
} from 'lucide-react';
import type { ProviderConfig, LLMProviderFormat } from '@/lib/llm';
import { LLM_PROVIDERS } from '@/lib/llm';

const IC = 'h-8 px-2 rounded-md border bg-background text-sm';

export function ProviderRow({ provider, isActive, activeModel, expanded, isBuiltin,
  testing, testResult,
  onToggle, onUpdate, onRemove, onSelect, onAddModel, onRemoveModel, onTest,
}: {
  provider: ProviderConfig; isActive: boolean; activeModel: string;
  expanded: boolean; isBuiltin: boolean; testing: boolean;
  testResult?: { ok: boolean; msg: string };
  onToggle: () => void; onUpdate: (patch: Partial<ProviderConfig>) => void;
  onRemove: () => void; onSelect: (model: string) => void;
  onAddModel: (modelId: string) => void; onRemoveModel: (modelId: string) => void;
  onTest: () => void;
}) {
  const [showKey, setShowKey] = useState(false);
  const [newModel, setNewModel] = useState('');

  const badge = testResult ? (testResult.ok
    ? <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle className="h-3 w-3" />{testResult.msg}</span>
    : <span className="flex items-center gap-1 text-xs text-red-500"><XCircle className="h-3 w-3" />{testResult.msg}</span>) : null;

  return (
    <div className={`rounded-lg border transition-colors ${isActive ? 'border-primary/50 bg-primary/5' : 'bg-muted/30'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
        <button onClick={() => onUpdate({ enabled: !provider.enabled })}
          className={`w-8 h-4 rounded-full transition-colors relative ${provider.enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}>
          <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${provider.enabled ? 'left-4.5' : 'left-0.5'}`} />
        </button>
        <button onClick={onToggle} className="flex-1 text-left">
          <span className="text-sm font-medium">{provider.name}</span>
          {isActive && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">Active</span>}
          {!provider.enabled && <span className="ml-2 text-[10px] text-muted-foreground">Disabled</span>}
        </button>
        <button onClick={onTest} disabled={testing || !provider.apiKey || !provider.baseUrl}
          className="h-7 px-2 rounded border text-xs hover:bg-accent disabled:opacity-40 flex items-center gap-1">
          {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}Test
        </button>
        {badge}
        <button onClick={onToggle} className="p-0.5 rounded hover:bg-accent text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded config */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t space-y-2">
          {!isBuiltin && (
            <Row label="Name">
              <input value={provider.name} onChange={e => onUpdate({ name: e.target.value })}
                className={`${IC} flex-1`} placeholder="e.g. Groq, Together AI" />
            </Row>
          )}
          <Row label="Endpoint">
            <div className="flex items-center gap-1 flex-1">
              <input value={provider.baseUrl} onChange={e => onUpdate({ baseUrl: e.target.value })}
                className={`${IC} flex-1 font-mono text-xs`}
                placeholder={isBuiltin ? LLM_PROVIDERS[provider.id]?.baseUrl : 'https://api.example.com/v1'} />
              {provider.baseUrl && (
                <a href={provider.baseUrl} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </Row>
          <Row label="API Key">
            <div className="relative flex-1">
              <input type={showKey ? 'text' : 'password'} value={provider.apiKey}
                onChange={e => onUpdate({ apiKey: e.target.value })}
                placeholder="Enter API key..." className={`${IC} pr-7 w-full font-mono text-xs`} />
              <button onClick={() => setShowKey(!showKey)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </Row>
          {!isBuiltin && (
            <Row label="Format">
              <select value={provider.format} onChange={e => onUpdate({ format: e.target.value as LLMProviderFormat })}
                className={`${IC} flex-1`}>
                <option value="openai">OpenAI-compatible</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </Row>
          )}
          <Row label="Models">
            <div className="flex-1 space-y-1.5">
              {provider.models.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {provider.models.map(m => (
                    <span key={m.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border cursor-pointer transition-colors ${
                        isActive && activeModel === m.id
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => onSelect(m.id)}>
                      {m.name}{m.inputPrice ? ` ($${m.inputPrice}/M)` : ''}
                      {!isBuiltin && (
                        <button onClick={e => { e.stopPropagation(); onRemoveModel(m.id); }}
                          className="ml-0.5 text-muted-foreground hover:text-red-500">
                          <XCircle className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-1">
                <input value={newModel} onChange={e => setNewModel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newModel.trim()) { onAddModel(newModel.trim()); setNewModel(''); } }}
                  placeholder="Add model ID..." className={`${IC} flex-1 font-mono text-xs`} />
                <button onClick={() => { if (newModel.trim()) { onAddModel(newModel.trim()); setNewModel(''); } }}
                  disabled={!newModel.trim()}
                  className="h-8 px-2 rounded-md border text-xs text-muted-foreground hover:bg-accent disabled:opacity-40">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Row>
          <div className="flex justify-end">
            <button onClick={onRemove}
              className="h-7 px-2 rounded border text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-1">
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><label className="text-xs text-muted-foreground w-16 shrink-0">{label}</label>{children}</div>;
}
