import { create } from 'zustand';
import { scorePrompt } from '@stsgs/prompting';
import {
  EvaluationInput, EvaluationResult, StandardsCheckResult,
  StandardsCheckItem, RubricScenario,
  EVAL_DEFAULTS,
} from '../types';
import { generateSuggestions, checkStandards, evaluateRubric } from '../lib/eval-helpers';

function fallbackResult(text: string): EvaluationResult {
  const s = scorePrompt(text);
  return { score: s, suggestions: generateSuggestions(s), standardsCheck: { checked: 0, passed: 0, failed: 0, details: [] }, rubricResult: null, llmAnalysis: null };
}

interface QualityState {
  input: EvaluationInput;
  result: EvaluationResult | null;
  isAnalyzing: boolean;
  isDeepAnalyzing: boolean;
  rubricScenario: RubricScenario;
  rubricThreshold: number;
  setInputMode: (mode: EvaluationInput['mode']) => void;
  setText: (text: string) => void;
  setSourceUrl: (url: string) => void;
  setAgentId: (id: string) => void;
  setRubricScenario: (s: RubricScenario) => void;
  setRubricThreshold: (t: number) => void;
  loadFile: (content: string, fileName: string) => void;
  loadAgent: (systemPrompt: string) => void;
  analyze: () => void;
  deepAnalyze: () => void;
  reset: () => void;
  clearResults: () => void;
}

export const useQualityStore = create<QualityState>((set, get) => ({
  input: { ...EVAL_DEFAULTS },
  result: null,
  isAnalyzing: false,
  isDeepAnalyzing: false,
  rubricScenario: 'prompt',
  rubricThreshold: 6,

  setInputMode: (mode) => set((s) => ({ input: { ...s.input, mode } })),
  setText: (text) => set((s) => ({ input: { ...s.input, text } })),
  setSourceUrl: (url) => set((s) => ({ input: { ...s.input, sourceUrl: url } })),
  setAgentId: (id) => set((s) => ({ input: { ...s.input, agentId: id } })),
  setRubricScenario: (rubricScenario) => set({ rubricScenario }),
  setRubricThreshold: (rubricThreshold) => set({ rubricThreshold }),

  loadFile: (content, fileName) =>
    set((s) => ({ input: { ...s.input, mode: 'file', text: content, fileName } })),
  loadAgent: (systemPrompt) =>
    set((s) => ({ input: { ...s.input, mode: 'agent', text: systemPrompt } })),

  analyze: () => {
    const { input, rubricScenario, rubricThreshold } = get();
    const text = input.text.trim();
    if (!text) return;
    set({ isAnalyzing: true });
    const score = scorePrompt(text);
    const suggestions = generateSuggestions(score);
    let stdCheck: StandardsCheckResult = { checked: 0, passed: 0, failed: 0, details: [] };
    fetch('/api/standards').then((r) => r.json()).then((standards) => {
      const items: StandardsCheckItem[] = [];
      for (const std of standards) checkStandards(text, std.rules ?? []).forEach((i) => items.push({ ...i, standardId: std.id, standardName: std.name }));
      const passed = items.filter((i) => i.passed).length;
      stdCheck = { checked: items.length, passed, failed: items.length - passed, details: items };
    }).catch(() => {}).finally(() => {
      const rubricResult = evaluateRubric(text, rubricScenario, rubricThreshold);
      set({ result: { score, suggestions, standardsCheck: stdCheck, rubricResult, llmAnalysis: null }, isAnalyzing: false });
    });
  },

  deepAnalyze: () => {
    const { input, rubricScenario } = get();
    const text = input.text.trim();
    if (!text) return;
    set({ isDeepAnalyzing: true });
    const ctx = input.mode === 'url' ? `Source: ${input.sourceUrl}`
      : input.mode === 'agent' ? `Agent ID: ${input.agentId}`
      : input.mode === 'file' ? `File: ${input.fileName}` : undefined;

    const setDeepResult = (llmAnalysis: string) => set((s) => ({
      result: { ...(s.result ?? fallbackResult(text)), llmAnalysis },
      isDeepAnalyzing: false,
    }));

    fetch('/api/evaluate-deep', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context: ctx, scenario: rubricScenario }),
    })
      .then(async (r) => { if (!r.ok) throw new Error(`Server ${r.status}: ${(await r.text().catch(() => '')).slice(0, 200)}`); return r.json(); })
      .then((data) => { if (data.analysis) setDeepResult(data.analysis); else if (data.error) setDeepResult(`Error: ${data.error}`); else setDeepResult('Error: Unexpected response from server'); })
      .catch((err) => setDeepResult(`Error: ${err.message}`));
  },

  reset: () => set({ input: { ...EVAL_DEFAULTS }, result: null }),

  clearResults: () => set({ result: null }),
}));
