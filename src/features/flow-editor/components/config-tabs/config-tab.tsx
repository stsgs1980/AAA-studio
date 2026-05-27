'use client';

import { useFlowEditorStore } from '../../store/flow-store';
import { getNodeDefinition } from '../../nodes/node-registry';

/**
 * Configuration tab — shows editable node fields:
 * name, model, temperature, maxTokens (for AI nodes).
 */
export function ConfigTab() {
  const { nodes, selectedNodeId, updateNodeData } = useFlowEditorStore();
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
      {/* Basic info */}
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

      {/* AI-specific fields */}
      {isAI && (
        <Group label="Model">
          <Field label="Model">
            <select
              value={(data.model as string) ?? 'gpt-4'}
              onChange={(e) => set('model', e.target.value)}
              className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            </select>
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
