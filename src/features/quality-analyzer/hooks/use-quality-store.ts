import { create } from 'zustand';
import { scorePrompt } from '@stsgs/prompting';
import {
  EvaluationInput, EvaluationResult, StandardsCheckResult,
  StandardsCheckItem, RubricScenario, RubricResult,
  EVAL_DEFAULTS,
} from '../types';
import { generateSuggestions, checkStandards, evaluateRubric } from '../lib/eval-helpers';

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

    let standardsCheck: StandardsCheckResult = {
      checked: 0, passed: 0, failed: 0, details: [],
    };

    fetch('/api/standards')
      .then((r) => r.json())
      .then((standards) => {
        const allItems: StandardsCheckItem[] = [];
        for (const std of standards) {
          const items = checkStandards(text, std.rules ?? []);
          items.forEach((item) => {
            allItems.push({ ...item, standardId: std.id, standardName: std.name });
          });
        }
        const passed = allItems.filter((i) => i.passed).length;
        standardsCheck = { checked: allItems.length, passed, failed: allItems.length - passed, details: allItems };
      })
      .catch(() => {})
      .finally(() => {
        const rubricResult: RubricResult = evaluateRubric(text, rubricScenario, rubricThreshold);
        set({ result: { score, suggestions, standardsCheck, rubricResult, llmAnalysis: null }, isAnalyzing: false });
      });
  },

  deepAnalyze: () => {
    const { input } = get();
    const text = input.text.trim();
    if (!text) return;
    set({ isDeepAnalyzing: true });

    const context = input.mode === 'url'
      ? `Source: ${input.sourceUrl}`
      : input.mode === 'agent'
        ? `Agent ID: ${input.agentId}`
        : input.mode === 'file'
          ? `File: ${input.fileName}`
          : undefined;

    fetch('/api/evaluate-deep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.analysis) {
          set((s) => ({
            result: s.result ? { ...s.result, llmAnalysis: data.analysis } : null,
            isDeepAnalyzing: false,
          }));
        } else if (data.error) {
          set((s) => ({
            result: s.result ? { ...s.result, llmAnalysis: `Error: ${data.error}` } : null,
            isDeepAnalyzing: false,
          }));
        }
      })
      .catch((err) => {
        set((s) => ({
          result: s.result ? { ...s.result, llmAnalysis: `Error: ${err.message}` } : null,
          isDeepAnalyzing: false,
        }));
      });
  },

  reset: () => set({ input: { ...EVAL_DEFAULTS }, result: null }),
}));
