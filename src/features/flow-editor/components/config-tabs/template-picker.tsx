'use client';

/** Prompt Template Picker — dropdown in node config to apply a template. */
import { useEffect, useState } from 'react';
import { useFlowEditorStore } from '../../store/flow-store';

interface Template {
  id: string; name: string; description: string; category: string;
  systemPrompt: string; temperature: number; maxTokens: number;
  nodeType: string; content: string; tags: string[];
}

export function TemplatePicker() {
  const { nodes, selectedNodeId, updateNodeData } = useFlowEditorStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [open, setOpen] = useState(false);

  const node = nodes.find((n) => n.id === selectedNodeId);
  const nodeType = node?.type ?? 'llm';

  useEffect(() => {
    fetch('/api/prompt-templates').then((r) => r.json()).then((d) => {
      const list = d.data ?? d;
      setTemplates(Array.isArray(list) ? list : []);
    }).catch(() => {});
  }, []);

  const filtered = templates.filter((t) => t.nodeType === nodeType || (nodeType === 'agent' && t.nodeType === 'llm'));

  if (filtered.length === 0) return null;

  const apply = (t: Template) => {
    if (!node) return;
    const updates: Record<string, unknown> = {};
    if (t.systemPrompt) updates.systemPrompt = t.systemPrompt;
    if (t.temperature !== undefined) updates.temperature = t.temperature;
    if (t.maxTokens !== undefined) updates.maxTokens = t.maxTokens;
    if (t.content && nodeType === 'prompt') updates.template = t.content;
    if (t.content && nodeType !== 'prompt' && !t.systemPrompt) updates.systemPrompt = t.content;
    updateNodeData(node.id, updates);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-2 py-1.5 text-xs rounded border border-dashed border-muted-foreground/40 hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground">
        Apply template...
      </button>
      {open && (
        <div className="absolute z-20 left-0 right-0 top-full mt-1 rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((t) => (
            <button key={t.id} onClick={() => apply(t)} className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b last:border-0">
              <p className="text-xs font-medium">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
