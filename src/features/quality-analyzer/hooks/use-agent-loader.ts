"use client";

import { useState, useEffect, useCallback } from "react";
import { useQualityStore } from "./use-quality-store";

export interface RepoFile {
  name: string;
  path: string;
  url: string | null;
}

export function useAgentLoader() {
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [fetching, setFetching] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string | null>(null);
  const setAgentId = useQualityStore((s) => s.setAgentId);
  const loadAgent = useQualityStore((s) => s.loadAgent);
  const setText = useQualityStore((s) => s.setText);
  const setFilterLog = useQualityStore((s) => s.setFilterLog);
  const input = useQualityStore((s) => s.input);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => setAgents(data.agents ?? []))
      .catch(() => {});
  }, []);

  const loadAllFiles = useCallback(async (files: RepoFile[], sourceUrl: string) => {
    if (files.length === 0) return;
    const validFiles = files.filter((f): f is RepoFile & { url: string } => !!f.url);
    const total = validFiles.length;
    const BATCH = 5;
    const parts: string[] = [];

    for (let i = 0; i < validFiles.length; i += BATCH) {
      const batch = validFiles.slice(i, i + BATCH);
      setLoadingProgress(`Loading ${Math.min(i + BATCH, total)}/${total}...`);
      try {
        const res = await fetch("/api/fetch-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: sourceUrl,
            urls: batch.map((f) => f.url),
            paths: batch.map((f) => f.path),
          }),
        });
        const data = await res.json();
        if (data.type === "content" && data.content) {
          parts.push(data.content);
        }
      } catch {
        // skip failed batch
      }
    }
    if (parts.length > 0) {
      setText(parts.join("\n\n"));
    }
    setLoadingProgress(null);
  }, [setText]);

  const handleFetchUrl = useCallback(async () => {
    if (!input.sourceUrl.trim()) return;
    setFetching(true);
    setRepoFiles([]);
    setLoadingProgress(null);
    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input.sourceUrl.trim() }),
      });
      const data = await res.json();
      if (data.type === "repo") {
        const files = data.files ?? [];
        setRepoFiles(files);
        if (data.filterLog) setFilterLog(data.filterLog);
        if (files.length > 0) {
          await loadAllFiles(files, input.sourceUrl.trim());
        }
      } else if (data.type === "content") {
        setText(data.content);
      } else if (data.error) {
        console.error("Fetch error:", data.error);
      }
    } catch {
      console.error("Failed to fetch URL");
    } finally {
      setFetching(false);
    }
  }, [input.sourceUrl, setText, setFilterLog, loadAllFiles]);

  const handleAgentSelect = useCallback(
    async (agentId: string) => {
      setAgentId(agentId);
      if (!agentId) return;
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        const agent = await res.json();
        if (agent.systemPrompt) loadAgent(agent.systemPrompt);
      } catch {
        console.error("Failed to load agent");
      }
    },
    [setAgentId, loadAgent],
  );

  return { agents, repoFiles, fetching, loadingProgress, handleFetchUrl, handleAgentSelect };
}