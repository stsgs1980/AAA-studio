"use client";

import { useState, useEffect, useCallback } from "react";
import { useQualityStore } from "../hooks/use-quality-store";

export function useAgentLoader() {
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
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
    try {
      const res = await fetch(input.sourceUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setText(await res.text());
    } catch (err) {
      console.error("Failed to fetch URL:", err);
    }
  }, [input.sourceUrl, setText]);

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

  return { agents, handleFetchUrl, handleAgentSelect };
}
