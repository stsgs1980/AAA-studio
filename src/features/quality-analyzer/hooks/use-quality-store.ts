import { create } from 'zustand';
import { scorePrompt } from '@stsgs/prompting';
import {
  EvaluationInput, EvaluationResult, StandardsCheckResult,
  StandardsCheckItem, RubricScenario,
  EVAL_DEFAULTS,
} from '../types';
import { generateSuggestions, checkStandards, evaluateRubric } from '../lib/eval-helpers';
import type { ScannerReport } from '@/lib/scanner/types';

function fallbackResult(text: string): EvaluationResult {
  const s = scorePrompt(text);
  return { score: s, suggestions: generateSuggestions(s), standardsCheck: { checked: 0, passed: 0, failed: 0, details: [] }, rubricResult: null, llmAnalysis: null };
}

interface QualityState {
  input: EvaluationInput;
  result: EvaluationResult | null;
  isAnalyzing: boolean;
  isDeepAnalyzing: boolean;
  isScanning: boolean;
  scannerReport: ScannerReport | null;
  rubricScenario: RubricScenario;
  rubricThreshold: number;
  setInputMode: (mode: EvaluationInput['mode']) => void;
  setText: (text: string) => void;
  setSourceUrl: (url: string) => void;
  setAgentId: (id: string) => void;
  setRubricScenario: (s: RubricScenario) => void;
  setRubricThreshold: (t: number) => void;
  loadFile: (content: string, fileName: string) => void;
  loadFiles: (files: { name: string; content: string; size: number }[]) => void;
  loadAgent: (systemPrompt: string) => void;
  analyze: () => void;
  deepAnalyze: () => void;
  scannerAnalyze: () => void;
  reset: () => void;
  clearResults: () => void;
}

export const useQualityStore = create<QualityState>((set, get) => ({
  input: { ...EVAL_DEFAULTS },
  result: null,
  isAnalyzing: false,
  isDeepAnalyzing: false,
  isScanning: false,
  scannerReport: null,
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

  loadFiles: (files) => {
    const text = files.map((f) => `=== ${f.name} ===\n${f.content}`).join('\n\n');
    set((s) => ({
      input: { ...s.input, mode: 'file', text, fileName: `${files.length} files` },
    }));
  },

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
      .then(async (r) => { if (!r.ok) throw new Error(`Server ${r.status}`); return r.json(); })
      .then((data) => setDeepResult(data.analysis ?? 'No analysis returned'))
      .catch((err) => setDeepResult(`Error: ${err.message}`));
  },

  scannerAnalyze: () => {
    const { input } = get();
    const text = input.text.trim();
    if (!text) return;
    set({ isScanning: true, scannerReport: null });
    const parts = text.split(/^=== (.+) ===$/m).filter((_, i) => i % 2 === 1);
    const scannerFiles = parts.map((name) => {
      const idx = text.indexOf(`=== ${name} ===`);
      const nextIdx = text.indexOf('\n=== ', idx + 1);
      const content = text.slice(idx + name.length + 6, nextIdx === -1 ? undefined : nextIdx).trim();
      return { path: name, content, size: new TextEncoder().encode(content).length };
    });
    fetch('/api/scanner/analyze', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: scannerFiles, evaluate: true }),
    })
      .then(async (r) => { if (!r.ok) throw new Error(`Scanner ${r.status}`); return r.json(); })
      .then((report) => set({ scannerReport: report, isScanning: false }))
      .catch((err) => set((s) => ({
        scannerReport: {
          structure: s.scannerReport?.structure ?? { totalFiles: 0, totalSize: 0, skillsCount: 0, standardsCount: 0, fileTypes: {}, largestFiles: [] },
          skills: [], standards: [], references: [], antiPatterns: [],
          evaluation: {
            overall: 0, grade: 'F',
            dimensions: { completeness: 0, references: 0, consistency: 0, examples: 0, constraints: 0 },
            criticalIssues: [`Scanner error: ${err.message}`],
            recommendations: [],
          },
          timestamp: new Date().toISOString(),
        },
        isScanning: false,
      })));
  },

  reset: () => set({ input: { ...EVAL_DEFAULTS }, result: null, scannerReport: null }),
  clearResults: () => set({ result: null, scannerReport: null }),
}));
