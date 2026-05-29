"use client";

import { useState } from "react";
import { Zap, RotateCcw, Loader2, FileCode, FolderGit2, Brain } from "lucide-react";
import {
  InputPanel, ScorePanel, StandardsPanel, RubricPanel, DeepAnalysisPanel,
  useQualityStore,
} from "@/features/quality-analyzer";
import { useAgentLoader } from "@/features/quality-analyzer/hooks/use-agent-loader";

type Tab = "scores" | "deep" | "standards" | "rubric";
const TABS: Tab[] = ["scores", "deep", "standards", "rubric"];

export default function QualityAnalyzerPage() {
  const [tab, setTab] = useState<Tab>("scores");
  const input = useQualityStore((s) => s.input);
  const isAnalyzing = useQualityStore((s) => s.isAnalyzing);
  const isDeepAnalyzing = useQualityStore((s) => s.isDeepAnalyzing);
  const analyze = useQualityStore((s) => s.analyze);
  const deepAnalyze = useQualityStore((s) => s.deepAnalyze);
  const reset = useQualityStore((s) => s.reset);
  const { agents, repoFiles, fetching, handleFetchUrl, handleRepoFileSelect, handleLoadAll, handleAgentSelect } = useAgentLoader();

  const hasText = input.text.trim().length > 0;

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Quality Analyzer</h1>
          <p className="text-xs text-muted-foreground">
            Evaluate prompts, agents, and configurations
          </p>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Input */}
        <div className="flex w-1/2 flex-col gap-3">
          {input.mode === "agent" && (
            <select value={input.agentId} onChange={(e) => handleAgentSelect(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Select an agent to evaluate...</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}
          {input.mode === "url" && (
            <button onClick={handleFetchUrl} disabled={!input.sourceUrl.trim() || fetching}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderGit2 className="h-4 w-4" />}
              {fetching ? "Fetching..." : "Fetch Content"}
            </button>
          )}
          {input.mode === "url" && repoFiles.length > 0 && (
            <div className="max-h-[200px] overflow-y-auto rounded-lg border bg-muted/20 p-2">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {repoFiles.length} files found -- click to load:
                </p>
                <button onClick={handleLoadAll} disabled={fetching}
                  className="flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs font-medium hover:bg-accent/80 disabled:opacity-50">
                  {fetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <FolderGit2 className="h-3 w-3" />}
                  Load All
                </button>
              </div>
              {repoFiles.map((f) => (
                <button key={f.path} onClick={() => handleRepoFileSelect(f)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent text-left">
                  <FileCode className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">{f.path}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-hidden"><InputPanel /></div>
          <div className="flex gap-2">
            <button onClick={analyze} disabled={!hasText || isAnalyzing}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </button>
            <button onClick={deepAnalyze} disabled={!hasText || isDeepAnalyzing}
              className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary disabled:opacity-50 hover:bg-primary/10">
              {isDeepAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Deep
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex w-1/2 flex-col gap-3 min-h-0">
          <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {tab === "scores" && <ScorePanel />}
            {tab === "deep" && <DeepAnalysisPanel />}
            {tab === "standards" && <StandardsPanel />}
            {tab === "rubric" && <RubricPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
