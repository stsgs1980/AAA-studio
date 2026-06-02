/**
 * MCP JSON-RPC handlers -- shared between POST and SSE transport.
 * Extracted from route.ts for anti-monolith compliance.
 */

import { db } from "@/lib/db";
import { toMCPTools, parseSkillToData } from "@/lib/skill-export/format-adapters";
import { extractText } from "@/lib/skill-export/text-utils";
import { callLLM, type ProviderConfig } from "@/lib/llm/client";
import { getActiveProvider } from "@/lib/llm";

export function ok(id: unknown, result: unknown) { return { jsonrpc: "2.0", id, result }; }
export function err(id: unknown, code: number, message: string) { return { jsonrpc: "2.0", id, error: { code, message } }; }

export async function handleInitialize(id: unknown) {
  return ok(id, {
    protocolVersion: "2024-11-05",
    capabilities: { tools: { listChanged: true }, resources: { subscribe: true, listChanged: true }, prompts: { listChanged: true } },
    serverInfo: { name: "3A Studio MCP Server", version: "1.0.0" },
  });
}

export async function handleToolsList(id: unknown) {
  const skills = await db.skill.findMany({ orderBy: { name: "asc" } });
  return ok(id, { tools: skills.map((s) => toMCPTools(parseSkillToData(s))) });
}

export async function handleToolsCall(id: unknown, params: Record<string, unknown>) {
  const toolName = params.name as string;
  const args = (params.arguments ?? {}) as Record<string, unknown>;
  const skill = await db.skill.findUnique({ where: { slug: toolName }, include: { files: true } });
  if (!skill) return err(id, -32602, `Tool not found: ${toolName}`);
  const entryFile = skill.files.find((f) => f.role === "entry");
  const rawCode = entryFile?.content || skill.code;
  const isJS = entryFile ? ["javascript", "typescript"].includes(entryFile.language) : true;
  if (rawCode.trim() && isJS) {
    try {
      const result = await executeSkillCode(rawCode, args);
      return ok(id, { content: [{ type: "text", text: JSON.stringify(result) }], isError: false });
    } catch (e) {
      console.warn(`[MCP] Skill code exec failed for ${toolName}: ${e instanceof Error ? e.message : e}`);
    }
  }
  return handleToolsCallLLM(id, skill, args);
}

async function executeSkillCode(code: string, inputs: Record<string, unknown>): Promise<unknown> {
  const clean = code.replace(/^export\s+/gm, "").replace(/^import\s+.*$/gm, "");
  const fn = new Function("inputs", clean + "\nreturn typeof handler==='function'?handler(inputs):undefined;");
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout 5s")), 5000));
  return Promise.race([fn(inputs), timeout]);
}

async function handleToolsCallLLM(id: unknown, skill: { name: string; description: string }, args: Record<string, unknown>) {
  try {
    const active = await getActiveProvider();
    if (!active) return err(id, -32603, "LLM not configured");
    const sys = skill.description ? `You are "${skill.name}". ${skill.description}` : `You are "${skill.name}".`;
    const resp = await callLLM({
      provider: active.provider as ProviderConfig, model: active.model,
      messages: [{ role: "system", content: sys }, { role: "user", content: extractText(args) || JSON.stringify(args) }],
      temperature: 0.3, maxTokens: 4096,
    });
    return ok(id, { content: [{ type: "text", text: resp.content }], isError: false });
  } catch (e) {
    return ok(id, { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : e}` }], isError: true });
  }
}

export async function handleResourcesList(id: unknown) {
  const cols = await db.knowledgeCollection.findMany({ orderBy: { name: "asc" } });
  return ok(id, { resources: cols.map((c) => ({ uri: `3a://knowledge/${c.id}`, name: c.name, description: c.description || `Collection: ${c.name}`, mimeType: "application/json" })) });
}

export async function handleResourcesRead(id: unknown, params: Record<string, unknown>) {
  const uri = params.uri as string;
  const m = uri.match(/^3a:\/\/knowledge\/(.+)$/);
  if (!m) return err(id, -32602, `Invalid URI: ${uri}`);
  const col = await db.knowledgeCollection.findUnique({ where: { id: m[1] }, include: { documents: true } });
  if (!col) return err(id, -32602, `Collection not found: ${m[1]}`);
  return ok(id, { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ name: col.name, description: col.description, documents: col.documents.map((d) => ({ id: d.id, title: d.title, fileType: d.fileType })) }) }] });
}

export async function handlePromptsList(id: unknown) {
  const ts = await db.promptTemplate.findMany({ orderBy: { name: "asc" } });
  return ok(id, { prompts: ts.map((t) => ({ name: t.name, description: `${t.category}: ${t.name}`, arguments: (JSON.parse(t.variables) as string[]).map((v) => ({ name: v, required: true, description: `Variable: ${v}` })) })) });
}

export async function handlePromptsGet(id: unknown, params: Record<string, unknown>) {
  const name = params.name as string;
  const t = await db.promptTemplate.findFirst({ where: { name } });
  if (!t) return err(id, -32602, `Prompt not found: ${name}`);
  let content = t.content;
  for (const [k, v] of Object.entries((params.arguments ?? {}) as Record<string, string>)) content = content.replaceAll(`{{${k}}}`, v);
  return ok(id, { description: `${t.category}: ${t.name}`, messages: [{ role: "user", content: { type: "text", text: content } }] });
}
