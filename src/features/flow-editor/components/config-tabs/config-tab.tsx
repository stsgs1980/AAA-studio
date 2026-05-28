'use client';

import { useEffect, useState } from 'react';
import { useFlowEditorStore } from '../../store/flow-store';
import { getNodeDefinition } from '../../nodes/node-registry';
import type { LLMModel } from '@/lib/llm';

/**
 * Configuration tab — shows editable node fields.
 * AI nodes get a model dropdown populated from active provider.
 */
export function ConfigTab() {
  const { nodes, selectedNodeId, updateNodeData } = useFlowEditorStore();
  const [models, setModels] = useState<LLMModel[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        const activeId = d.llm_active_provider;
        const providers = d.llm_providers
          ? JSON.parse(d.llm_providers) : [];
        const provider = providers.find(
          (p: { id: string }) => p.id === activeId,
        );
        if (provider?.models?.length) setModels(provider.models);
      })
      .catch(() => { /* use empty list */ });
  }, []);

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const def = getNodeDefinition(node.type ?? '');
  const data = node.data as Record<string, unknown>;
  const set = (key: string, value: unknown) => updateNodeData(node.id, { [key]: value });

  const isAI =
    node.type === 'llm' || node.type === 'rag' ||
    node.type === 'agent' || node.type === 'orchestrator';

  return (
    <div className="space-y-4 p-1">
      <Group label="Basic">
        <Field label="Name">
          <input
            type="text"
            value={(data.label as string) ?? ''}
            onChange={(e) => set('label', e.target.value)}
            className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="Type">
          <span className="text-xs text-muted-foreground">{def?.label ?? node.type}</span>
        </Field>
        <Field label="Category">
          <span className="text-xs text-muted-foreground capitalize">{def?.category ?? ''}</span>
        </Field>
      </Group>

      {isAI && (
        <Group label="Model">
          <Field label="Model">
            {models.length > 0 ? (
              <select
                value={(data.model as string) || ''}
                onChange={(e) => set('model', e.target.value)}
                className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Default (from Settings)</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="e.g. gpt-4o"
                value={(data.model as string) ?? ''}
                onChange={(e) => set('model', e.target.value)}
                className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
          </Field>
          <Field label="Temperature">
            <input
              type="range" min="0" max="2" step="0.1"
              value={(data.temperature as number) ?? 0.7}
              onChange={(e) => set('temperature', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-[10px] text-muted-foreground">{String(data.temperature ?? 0.7)}</span>
          </Field>
          <Field label="Max Tokens">
            <input
              type="number"
              value={(data.maxTokens as number) ?? 4096}
              onChange={(e) => set('maxTokens', parseInt(e.target.value))}
              className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
        </Group>
      )}

      {def?.description && (
        <p className="text-[10px] text-muted-foreground italic px-1">
          {def.description}
        </p>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h4>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
