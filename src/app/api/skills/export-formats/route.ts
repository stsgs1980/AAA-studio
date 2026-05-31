/**
 * GET /api/skills/export-formats?format=openai|mcp|a2a
 * Export all skills in industry-standard formats.
 */

import { db } from "@/lib/db";
import { handleError, BadRequest } from "@/lib/api-error";
import { toOpenAIToolsArray, toMCPToolsArray, parseSkillToData } from "@/lib/skill-export/format-adapters";
import type { A2ACard } from "@/lib/skill-export/format-adapters";

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
        // A2A exports per-agent cards; here we create a single card with all skills
        const card: A2ACard = {
          name: "3A Studio", description: "All skills from 3A Studio",
          url: "", version: "1.0.0",
          capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
          skills: data.map((s) => ({ id: s.slug, name: s.name, description: s.description, tags: [...s.tags, ...s.triggers] })),
          provider: { organization: "3A Studio", url: "https://github.com/stsgs1980/AAA-studio" },
        };
        return Response.json(card);
      }
      default:
        throw BadRequest(`Unknown format: ${format}. Use: openai, mcp, a2a`);
    }
  } catch (error) {
    return handleError(error);
  }
}
