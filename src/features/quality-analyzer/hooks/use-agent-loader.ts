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
  const setAgentId = useQualityStore((s) => s.setAgentId);
  const loadAgent = useQualityStore((s) => s.loadAgent);
  const setText = useQualityStore((s) => s.setText);
  const input = useQualityStore((s) => s.input);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => setAgents(data.agents ?? []))
      .catch(() => {});
  }, []);

  const handleFetchUrl = useCallback(async () => {
    if (!input.sourceUrl.trim()) return;
    setFetching(true);
    setRepoFiles([]);
    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input.sourceUrl.trim() }),
      });
      const data = await res.json();
      if (data.type === "repo") {
        setRepoFiles(data.files ?? []);
      } else if (data.type === "content") {
        setText(data.content);
      } else if (data.error) {
        console.error("Fetch error:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch URL:", err);
    } finally {
      setFetching(false);
    }
  }, [input.sourceUrl, setText]);

  const handleRepoFileSelect = useCallback(
    async (file: RepoFile) => {
      if (!file.url) return;
      setFetching(true);
      try {
        const res = await fetch("/api/fetch-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: file.url }),
        });
        const data = await res.json();
        if (data.type === "content") {
          setText(data.content);
        }
      } catch (err) {
        console.error("Failed to fetch file:", err);
      } finally {
        setFetching(false);
      }
    },
    [setText],
  );

  const handleAgentSelect = useCallback(
    async (agentId: string) => {
      setAgentId(agentId);
      if (!agentId) return;
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        const agent = await res.json();
        if (agent.systemPrompt) loadAgent(agent.systemPrompt);
      } catch (err) {
        console.error("Failed to load agent:", err);
      }
    },
    [setAgentId, loadAgent],
  );

  const handleLoadAll = useCallback(async () => {
    if (repoFiles.length === 0) return;
    setFetching(true);
    try {
      const urls = repoFiles.map((f) => f.url).filter((u): u is string => !!u);
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input.sourceUrl, urls }),
      });
      const data = await res.json();
      if (data.type === "content") setText(data.content);
    } catch (err) {
      console.error("Failed to load all files:", err);
    } finally {
      setFetching(false);
    }
  }, [repoFiles, input.sourceUrl, setText]);

  return { agents, repoFiles, fetching, handleFetchUrl, handleRepoFileSelect, handleLoadAll, handleAgentSelect };
}
