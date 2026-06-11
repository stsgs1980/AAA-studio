'use client';

/**
 * useFlowAssistant — encapsulates all wizard state and logic
 * for the 5-stage Flow Assistant guided flow.
 */

import { useState, useCallback } from 'react';
import { useFlowEditorStore } from '../store/flow-store';
import { STAGES } from '../components/flow-assistant-data';
import { generateFlow } from '../components/flow-assistant-generate';

export function useFlowAssistant() {
  const { toggleAssistant } = useFlowEditorStore();

  const [si, setSi] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flowName, setFlowName] = useState('');
  const [flowDesc, setFlowDesc] = useState('');
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  /* ── computed ────────────────────────────────────────── */
  const stage = STAGES[si];
  const cur = answers[stage.id];
  const hasAnswer =
    si === 3
      ? !!flowName.trim()
      : si === 4
        ? true
        : cur && !(Array.isArray(cur) && cur.length === 0);
  const progress = ((si + 1) / STAGES.length) * 100;

  /* ── actions ─────────────────────────────────────────── */
  const select = useCallback(
    (id: string) => {
      if (stage.multi) {
        const arr = (cur as string[]) ?? [];
        setAnswers({
          ...answers,
          [stage.id]: arr.includes(id) ? arr.filter((a) => a !== id) : [...arr, id],
        });
      } else {
        setAnswers({ ...answers, [stage.id]: id });
      }
    },
    [stage, cur, answers],
  );

  const next = useCallback(async () => {
    setError('');
    if (si === 4) {
      setGenerating(true);
      try {
        const { nodes, edges } = generateFlow({
          goal: answers.goal as string,
          architecture: answers.architecture as string,
          features: (answers.features as string[]) ?? [],
          config: (answers.config as string) ?? 'later',
          flowName: flowName || 'Untitled Flow',
          flowDescription: flowDesc,
        });
        const store = useFlowEditorStore.getState();
        store.clearCanvas();
        for (const n of nodes) store.addNode(n);
        useFlowEditorStore.setState({
          edges: edges.map((e) => ({ ...e, type: 'smoothstep' })),
          flowName: flowName || 'Untitled Flow',
        });
        setGenerating(false);
        setDone(true);
        setTimeout(() => {
          toggleAssistant();
          reset();
        }, 1500);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Generation failed');
        setGenerating(false);
      }
    } else {
      setSi(si + 1);
    }
  }, [si, answers, flowName, flowDesc, toggleAssistant]);

  const reset = useCallback(() => {
    setSi(0);
    setAnswers({});
    setFlowName('');
    setFlowDesc('');
    setDone(false);
    setGenerating(false);
    setError('');
  }, []);

  const close = useCallback(() => {
    toggleAssistant();
    setTimeout(reset, 300);
  }, [toggleAssistant, reset]);

  const back = useCallback(() => {
    if (si > 0) setSi(si - 1);
  }, [si]);

  const setAnswer = useCallback(
    (key: string, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return {
    si,
    stage,
    cur,
    hasAnswer,
    progress,
    answers,
    flowName,
    flowDesc,
    generating,
    done,
    error,
    setFlowName,
    setFlowDesc,
    select,
    next,
    back,
    reset,
    close,
    setAnswer,
  };
}