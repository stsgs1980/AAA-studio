/**
 * GET /api/skills/export-formats?format=openai|mcp|a2a
 * Export all skills in industry-standard formats.
 * A2A now produces per-agent cards (one card per agent with its skills).
 */

import { db } from "@/lib/db";
import { handleError, BadRequest } from "@/lib/api-error";
import { toOpenAIToolsArray, toMCPToolsArray, parseSkillToData, toA2ACard } from "@/lib/skill-export/format-adapters";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "openai";
    const skills = await db.skill.findMany({ orderBy: { name: "asc" } });
    const data = skills.map(parseSkillToData);

    switch (format) {
      case "openai":
        return Response.json({ tools: toOpenAIToolsArray(data) });
      case "mcp":
        return Response.json({ tools: toMCPToolsArray(data) });
      case "a2a": {
        const agents = await db.agent.findMany({ orderBy: { name: "asc" } });
        if (agents.length === 0) {
          // No agents yet -- single umbrella card
          return Response.json(toA2ACard({ name: "3A Studio", role: "orchestrator", description: "All skills from 3A Studio", skills: data }));
        }
        const cards = agents.map((agent) => {
          const skillIds: string[] = JSON.parse(agent.skills);
          const agentSkills = data.filter((s) => skillIds.includes(s.skillId) || skillIds.includes(s.slug));
          return toA2ACard({ name: agent.name, role: agent.role, description: agent.description || agent.role, skills: agentSkills.length > 0 ? agentSkills : data });
        });
        return Response.json({ agents: cards });
      }
      default:
        throw BadRequest(`Unknown format: ${format}. Use: openai, mcp, a2a`);
    }
  } catch (error) {
    return handleError(error);
  }
}
