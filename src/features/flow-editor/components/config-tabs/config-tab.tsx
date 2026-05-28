'use client';

import { useEffect, useState } from 'react';
import { useFlowEditorStore } from '../../store/flow-store';
import { getNodeDefinition } from '../../nodes/node-registry';
import type { LLMModel, ProviderConfig } from '@/lib/llm';

/** AI-capable node types */
const AI_TYPES = new Set(['llm', 'rag', 'agent', 'orchestrator']);

/**
 * Configuration tab — editable node fields.
 * AI nodes get a provider + model dropdown from all configured providers.
 */
export function ConfigTab() {
  const { nodes, selectedNodeId, updateNodeData } = useFlowEditorStore();
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [activeProviderId, setActiveProviderId] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        setActiveProviderId(d.llm_active_provider ?? '');
        const raw = d.llm_providers ? JSON.parse(d.llm_providers) : [];
        setProviders(raw.filter((p: ProviderConfig) => p.enabled));
      })
      .catch(() => {});
  }, []);

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const def = getNodeDefinition(node.type ?? '');
  const data = node.data as Record<string, unknown>;
  const set = (key: string, value: unknown) => updateNodeData(node.id, { [key]: value });
  const isAI = AI_TYPES.has(node.type ?? '');

  // Resolve provider for model list (per-node override or global)
  const nodeProviderId = (data.providerId as string) || activeProviderId;
  const models: LLMModel[] = providers.find(p => p.id === nodeProviderId)?.models ?? [];

  const handleProviderChange = (pid: string) => {
    set('providerId', pid);
    // Reset model if not available in new provider
    if (data.model) {
      const np = providers.find(p => p.id === pid);
      if (np && !np.models.some(m => m.id === data.model)) set('model', '');
    }
  };

  return (
    <div className="space-y-4 p-1">
      <Grp label="Basic">
        <Fld label="Name">
          <input type="text" value={(data.label as string) ?? ''}
            onChange={(e) => set('label', e.target.value)}
            className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
        </Fld>
        <Fld label="Type">
          <span className="text-xs text-muted-foreground">{def?.label ?? node.type}</span>
        </Fld>
        <Fld label="Category">
          <span className="text-xs text-muted-foreground capitalize">{def?.category ?? ''}</span>
        </Fld>
      </Grp>

      {isAI && (
        <Grp label="Model">
          <Fld label="Provider">
            {providers.length > 0 ? (
              <select value={nodeProviderId} onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Default (from Settings)</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : <span className="text-[10px] text-muted-foreground italic">No providers configured</span>}
          </Fld>
          <Fld label="Model">
            {models.length > 0 ? (
              <select value={(data.model as string) || ''} onChange={(e) => set('model', e.target.value)}
                className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Default (from Settings)</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            ) : (
              <input type="text" placeholder="e.g. gpt-4o" value={(data.model as string) ?? ''}
                onChange={(e) => set('model', e.target.value)}
                className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            )}
          </Fld>
          <Fld label="Temperature">
            <input type="range" min="0" max="2" step="0.1"
              value={(data.temperature as number) ?? 0.7}
              onChange={(e) => set('temperature', parseFloat(e.target.value))} className="w-full" />
            <span className="text-[10px] text-muted-foreground">{String(data.temperature ?? 0.7)}</span>
          </Fld>
          <Fld label="Max Tokens">
            <input type="number" value={(data.maxTokens as number) ?? 4096}
              onChange={(e) => set('maxTokens', parseInt(e.target.value))}
              className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
          </Fld>
        </Grp>
      )}

      {def?.description && (
        <p className="text-[10px] text-muted-foreground italic px-1">{def.description}</p>
      )}
    </div>
  );
}

function Grp({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</h4>
      {children}
    </div>
  );
}

function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
