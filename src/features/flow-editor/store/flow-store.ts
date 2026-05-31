import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import type { ExecutionResult } from '../lib/node-executor';

const MAX_HISTORY = 50;

interface Snapshot { nodes: Node[]; edges: Edge[] }

interface FlowEditorState {
  nodes: Node[]; edges: Edge[];
  selectedNodeId: string | null; flowId: string | null;
  flowName: string; isDirty: boolean;
  history: Snapshot[]; historyIndex: number;
  canUndo: boolean; canRedo: boolean;
  executionResults: ExecutionResult[];
  isRunning: boolean;
  showAssistant: boolean;
}

interface FlowEditorActions {
  onNodesChange: (c: NodeChange[]) => void;
  onEdgesChange: (c: EdgeChange[]) => void;
  onConnect: (conn: Connection) => void;
  addNode: (node: Node) => void;
  removeNodes: (ids: string[]) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  setSelectedNodeId: (id: string | null) => void;
  loadFlow: (n: Node[], e: Edge[], fid: string, name: string) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  setExecutionResults: (results: ExecutionResult[]) => void;
  toggleAssistant: () => void;
  _pushHistory: () => void;
}

const clone = (nodes: Node[], edges: Edge[]): Snapshot => ({
  nodes: JSON.parse(JSON.stringify(nodes)),
  edges: JSON.parse(JSON.stringify(edges)),
});
const EMPTY: Snapshot = { nodes: [], edges: [] };

export const useFlowEditorStore = create<FlowEditorState & FlowEditorActions>((set, get) => ({
    nodes: [], edges: [], selectedNodeId: null, flowId: null,
    flowName: 'Untitled Flow', isDirty: false,
    history: [{ ...EMPTY }], historyIndex: 0,
    canUndo: false, canRedo: false,
    executionResults: [], isRunning: false,
    showAssistant: false,

    _pushHistory: () => {
      const { history, historyIndex } = get();
      const snap = clone(get().nodes, get().edges);
      const trimmed = history.slice(0, historyIndex + 1);
      trimmed.push(snap);
      if (trimmed.length > MAX_HISTORY) trimmed.shift();
      set({
        history: trimmed,
        historyIndex: trimmed.length - 1,
        canUndo: trimmed.length > 1,
        canRedo: false,
        isDirty: true,
      });
    },

    onNodesChange: (c) => set({ nodes: applyNodeChanges(c, get().nodes), isDirty: true }),
    onEdgesChange: (c) => set({ edges: applyEdgeChanges(c, get().edges), isDirty: true }),
    onConnect: (conn) => {
      set({ edges: addEdge({ ...conn, type: 'smoothstep' }, get().edges) });
      get()._pushHistory();
    },
    addNode: (node) => { set({ nodes: [...get().nodes, node] }); get()._pushHistory(); },
    removeNodes: (ids) => {
      set({ nodes: get().nodes.filter((n) => !ids.includes(n.id)), selectedNodeId: null });
      get()._pushHistory();
    },
    updateNodeData: (id, data) => {
      set({ nodes: get().nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...data } } : n) });
      get()._pushHistory();
    },
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),

    loadFlow: (nodes, edges, flowId, name) => set({
      nodes, edges, flowId, flowName: name, isDirty: false,
      history: [clone(nodes, edges)], historyIndex: 0,
      canUndo: false, canRedo: false,
    }),

    clearCanvas: () => set({
      nodes: [], edges: [], selectedNodeId: null, flowId: null,
      flowName: 'Untitled Flow', isDirty: false,
      history: [{ ...EMPTY }], historyIndex: 0, canUndo: false, canRedo: false,
      executionResults: [], isRunning: false,
    }),

    setExecutionResults: (results) => set({ executionResults: results, isRunning: false }),
    toggleAssistant: () => set((s) => ({ showAssistant: !s.showAssistant })),

    undo: () => {
      const { historyIndex: hi, history: h } = get();
      if (hi <= 0) return;
      const i = hi - 1;
      set({ nodes: JSON.parse(JSON.stringify(h[i].nodes)), edges: JSON.parse(JSON.stringify(h[i].edges)), historyIndex: i, canUndo: i > 0, canRedo: true });
    },
    redo: () => {
      const { historyIndex: hi, history: h } = get();
      if (hi >= h.length - 1) return;
      const i = hi + 1;
      set({ nodes: JSON.parse(JSON.stringify(h[i].nodes)), edges: JSON.parse(JSON.stringify(h[i].edges)), historyIndex: i, canUndo: true, canRedo: i < h.length - 1 });
    },
  }),
);
