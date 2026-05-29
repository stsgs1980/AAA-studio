import { create } from 'zustand';
import { scorePrompt } from '@stsgs/prompting';
import type { PromptScore } from '@stsgs/prompting';
import { buildSystemPrompt } from '@stsgs/prompting';
import { getAgentRoles } from '@stsgs/prompting';
import { CREATOR_STEPS, CREATOR_DEFAULTS } from '../types';
import type { WizardForm } from '../types';

interface CreatorState {
  step: number;
  form: WizardForm;
  score: PromptScore | null;
  saving: boolean;
  error: string;
  done: boolean;
}

interface CreatorActions {
  setStep: (i: number) => void;
  next: () => void;
  prev: () => void;
  setField: <K extends keyof WizardForm>(k: K, v: WizardForm[K]) => void;
  applyRole: (roleId: string) => void;
  applyTemplate: (typeId: string, vars: Record<string, string>) => void;
  recalcScore: () => void;
  save: () => Promise<void>;
  reset: () => void;
  setError: (v: string) => void;
}

async function apiPost(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const useCreatorStore = create<CreatorState & CreatorActions>((set, get) => ({
  step: 0,
  form: { ...CREATOR_DEFAULTS },
  score: null,
  saving: false,
  error: '',
  done: false,

  setStep: (i) => set({ step: i }),
  next: () => set((s) => ({ step: Math.min(s.step + 1, CREATOR_STEPS.length - 1) })),
  prev: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  setError: (v) => set({ error: v }),

  setField: (key, value) => set((s) => ({
    form: { ...s.form, [key]: value },
  })),

  applyRole: (roleId) => {
    const role = getAgentRoles().find((r) => r.id === roleId);
    if (!role) return;
    set((s) => ({
      form: {
        ...s.form,
        agentRoleId: roleId,
        name: s.form.name || role.name,
        systemPrompt: role.systemPrompt,
        temperature: role.temperature,
        maxTokens: role.maxTokens,
      },
    }));
    get().recalcScore();
  },

  applyTemplate: (typeId, vars) => {
    const prompt = buildSystemPrompt(typeId, vars);
    if (prompt) set((s) => ({ form: { ...s.form, agentTypeId: typeId, systemPrompt: prompt } }));
    get().recalcScore();
  },

  recalcScore: () => {
    const { form } = get();
    if (!form.systemPrompt.trim()) { set({ score: null }); return; }
    const result = scorePrompt(form.systemPrompt);
    set({ score: result });
  },

  save: async () => {
    const { form } = get();
    if (!form.name.trim()) { set({ error: 'Agent name is required' }); return; }
    if (!form.systemPrompt.trim()) { set({ error: 'System prompt is required' }); return; }
    try {
      set({ saving: true, error: '' });
      await apiPost('/api/agents', {
        name: form.name,
        role: form.agentTypeId || form.agentRoleId,
        group: form.group,
        status: 'draft',
        model: form.model,
        temperature: form.temperature,
        maxTokens: form.maxTokens,
        systemPrompt: form.systemPrompt,
        tools: form.tools,
        skills: form.skillIds,
        standards: form.standardIds,
        description: form.description,
      });
      set({ done: true });
    } catch {
      set({ error: 'Failed to create agent' });
    } finally {
      set({ saving: false });
    }
  },

  reset: () => set({
    step: 0,
    form: { ...CREATOR_DEFAULTS },
    score: null,
    saving: false,
    error: '',
    done: false,
  }),
}));
