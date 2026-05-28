import { create } from 'zustand';
import type { AgentRecord, AgentListResponse } from '../types';
import type { RoleGroup } from '@stsgs/shared';
import { DEFAULT_FORM } from '../types';

interface AgentState {
  agents: AgentRecord[];
  loading: boolean;
  search: string;
  filterGroup: string;
  filterStatus: string;
  editing: AgentRecord | null;
  form: typeof DEFAULT_FORM;
  showForm: boolean;
  saving: boolean;
  error: string;
}

interface AgentActions {
  setSearch: (v: string) => void;
  setFilterGroup: (v: string) => void;
  setFilterStatus: (v: string) => void;
  openCreate: () => void;
  openEdit: (agent: AgentRecord) => void;
  save: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clone: (id: string) => Promise<void>;
  setShowForm: (v: boolean) => void;
  setField: <K extends keyof typeof DEFAULT_FORM>(key: K, value: (typeof DEFAULT_FORM)[K]) => void;
  setError: (v: string) => void;
  fetchAgents: () => Promise<void>;
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

export const useAgentStore = create<AgentState & AgentActions>((set, get) => ({
  agents: [],
  loading: true,
  search: '',
  filterGroup: '',
  filterStatus: '',
  editing: null,
  form: { ...DEFAULT_FORM },
  showForm: false,
  saving: false,
  error: '',

  setSearch: (v) => set({ search: v }),
  setFilterGroup: (v) => set({ filterGroup: v }),
  setFilterStatus: (v) => set({ filterStatus: v }),
  setShowForm: (v) => set({ showForm: v }),
  setError: (v) => set({ error: v }),

  setField: (key, value) => set((s) => ({ form: { ...s.form, [key]: value } })),

  fetchAgents: async () => {
    try {
      set({ loading: true, error: '' });
      const { search, filterGroup, filterStatus } = get();
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterGroup) params.set('group', filterGroup);
      if (filterStatus) params.set('status', filterStatus);
      const data: AgentListResponse = await (await apiFetch(`/api/agents?${params}`)).json();
      set({ agents: data.agents });
    } catch {
      set({ error: 'Failed to load agents' });
    } finally {
      set({ loading: false });
    }
  },

  openCreate: () => set({ editing: null, form: { ...DEFAULT_FORM }, showForm: true, error: '' }),

  openEdit: (agent) => set({
    editing: agent,
    form: {
      name: agent.name, role: agent.role, group: agent.group as RoleGroup,
      status: agent.status, model: agent.model,
      temperature: agent.temperature, maxTokens: agent.maxTokens,
      systemPrompt: agent.systemPrompt, tools: agent.tools,
      skills: agent.skills, standards: agent.standards,
      parentId: agent.parentId, description: agent.description,
    },
    showForm: true, error: '',
  }),

  save: async () => {
    const { form, editing } = get();
    if (!form.name.trim()) { set({ error: 'Name is required' }); return; }
    try {
      set({ saving: true, error: '' });
      const body = {
        ...form,
        tools: JSON.parse(form.tools || '[]'),
        skills: JSON.parse(form.skills || '[]'),
        standards: JSON.parse(form.standards || '[]'),
      };
      const url = editing ? `/api/agents/${editing.id}` : '/api/agents';
      await apiFetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      set({ showForm: false });
      get().fetchAgents();
    } catch {
      set({ error: 'Failed to save agent' });
    } finally {
      set({ saving: false });
    }
  },

  remove: async (id) => {
    try {
      await apiFetch(`/api/agents/${id}`, { method: 'DELETE' });
      get().fetchAgents();
    } catch {
      set({ error: 'Failed to delete agent' });
    }
  },

  clone: async (id) => {
    try {
      await apiFetch(`/api/agents/${id}/clone`, { method: 'POST' });
      get().fetchAgents();
    } catch {
      set({ error: 'Failed to clone agent' });
    }
  },
}));
