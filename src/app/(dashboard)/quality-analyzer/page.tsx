"use client";

import { useState } from "react";
import { Zap, RotateCcw, Loader2 } from "lucide-react";
import {
  InputPanel, ScorePanel, StandardsPanel, RubricPanel,
  useQualityStore,
} from "@/features/quality-analyzer";
import { useAgentLoader } from "@/features/quality-analyzer/hooks/use-agent-loader";

type Tab = "scores" | "standards" | "rubric";
const TABS: Tab[] = ["scores", "standards", "rubric"];

export default function QualityAnalyzerPage() {
  const [tab, setTab] = useState<Tab>("scores");
  const input = useQualityStore((s) => s.input);
  const isAnalyzing = useQualityStore((s) => s.isAnalyzing);
  const analyze = useQualityStore((s) => s.analyze);
  const reset = useQualityStore((s) => s.reset);
  const { agents, handleFetchUrl, handleAgentSelect } = useAgentLoader();

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
            <button onClick={handleFetchUrl} disabled={!input.sourceUrl.trim()}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              Fetch Content
            </button>
          )}
          <div className="flex-1 min-h-0 overflow-hidden"><InputPanel /></div>
          <button onClick={analyze} disabled={!input.text.trim() || isAnalyzing}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
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
            {tab === "standards" && <StandardsPanel />}
            {tab === "rubric" && <RubricPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
