"use client";

import { useState } from "react";
import { Zap, RotateCcw, Loader2, Brain, Trash2, Scan } from "lucide-react";
import {
  InputPanel, ScorePanel, StandardsPanel, RubricPanel, DeepAnalysisPanel,
  ScannerPanel, FilterLogBtn, useQualityStore,
} from "@/features/quality-analyzer";
import { useAgentLoader } from "@/features/quality-analyzer/hooks/use-agent-loader";
import { useLanguage } from "@/lib/i18n/language-context";

type Tab = "scores" | "deep" | "standards" | "rubric" | "scanner";
const TABS: Tab[] = ["scores", "deep", "standards", "rubric", "scanner"];

export default function QualityAnalyzerPage() {
  const [tab, setTab] = useState<Tab>("scores");
  const input = useQualityStore((s) => s.input);
  const isAnalyzing = useQualityStore((s) => s.isAnalyzing);
  const isDeepAnalyzing = useQualityStore((s) => s.isDeepAnalyzing);
  const isScanning = useQualityStore((s) => s.isScanning);
  const analyze = useQualityStore((s) => s.analyze);
  const deepAnalyze = useQualityStore((s) => s.deepAnalyze);
  const scannerAnalyze = useQualityStore((s) => s.scannerAnalyze);
  const reset = useQualityStore((s) => s.reset);
  const clearResults = useQualityStore((s) => s.clearResults);
  const hasResult = useQualityStore((s) => s.result !== null || s.scannerReport !== null);
  const { agents, fetching, loadingProgress, handleFetchUrl, handleAgentSelect } = useAgentLoader();
  const { t } = useLanguage();
  const hasText = input.text.trim().length > 0;
  const tabLabels: Record<Tab, string> = {
    scores: t.pages['Scores'], deep: t.pages['Deep'],
    standards: t.pages['Standards'], rubric: t.pages['Rubric'],
    scanner: t.pages['Scanner'] || 'Scanner',
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t.pages['Quality Analyzer']}</h1>
          <p className="text-xs text-muted-foreground">{t.pages['Evaluate prompts, agents, and configurations']}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasResult && (
            <button onClick={clearResults} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
              <Trash2 className="h-3.5 w-3.5" /> {t.pages['Clear Results']}
            </button>
          )}
          <button onClick={reset} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">
            <RotateCcw className="h-3.5 w-3.5" /> {t.common['Reset']}
          </button>
        </div>
      </div>
      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex w-1/2 flex-col gap-3">
          {input.mode === "agent" && (
            <select value={input.agentId} onChange={(e) => handleAgentSelect(e.target.value)}
              className="w-full rounded-lg border bg-input text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">{t.pages['Select an agent to evaluate...']}</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}
          {input.mode === "url" && (
            <button onClick={handleFetchUrl} disabled={!input.sourceUrl.trim() || fetching}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
              {fetching ? (loadingProgress ?? t.pages['Fetching...']) : t.pages['Fetch Content']}
            </button>
          )}
          {fetching && !loadingProgress && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs text-primary">{t.pages['Loading files...']}</span>
            </div>
          )}
          {!fetching && hasText && (
            <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5">
              <span className="text-xs text-muted-foreground">{t.pages['Loaded:']} {input.text.length.toLocaleString()} {t.pages['chars']}</span>
              <span className="text-xs text-green-600 dark:text-green-400">Ready to Analyze</span>
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-hidden"><InputPanel /></div>
          <div className="flex gap-2">
            <button onClick={analyze} disabled={!hasText || isAnalyzing}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isAnalyzing ? t.pages['Analyzing...'] : t.pages['Analyze']}
            </button>
            <button onClick={() => { setTab("deep"); deepAnalyze(); }} disabled={!hasText || isDeepAnalyzing}
              className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary disabled:opacity-50 hover:bg-primary/10">
              {isDeepAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              {t.pages['Deep']}
            </button>
            <button onClick={() => { setTab("scanner"); scannerAnalyze(); }} disabled={!hasText || isScanning}
              className="flex items-center gap-2 rounded-lg border border-brand-accent px-4 py-2.5 text-sm font-medium text-brand-accent disabled:opacity-50 hover:bg-brand-accent/10">
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
              Scanner
            </button>
            <FilterLogBtn />
          </div>
        </div>
        <div className="flex w-1/2 flex-col gap-3 min-h-0">
          <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
            {TABS.map((tabKey) => (
              <button key={tabKey} onClick={() => setTab(tabKey)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === tabKey ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {tabLabels[tabKey]}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {tab === "scores" && <ScorePanel />}
            {tab === "deep" && <DeepAnalysisPanel />}
            {tab === "standards" && <StandardsPanel />}
            {tab === "rubric" && <RubricPanel />}
            {tab === "scanner" && <ScannerPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}