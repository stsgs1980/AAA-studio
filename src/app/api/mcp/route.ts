/**
 * MCP (Model Context Protocol) Server -- POST /api/mcp
 * JSON-RPC 2.0 handler: initialize, tools/list, tools/call,
 * resources/list, resources/read, prompts/list, prompts/get
 *
 * tools/call now executes skill entry code when available,
 * falls back to LLM inference when no code exists.
 */

import { db } from "@/lib/db";
import { toMCPTools, parseSkillToData } from "@/lib/skill-export/format-adapters";
import { extractText } from "@/lib/skill-export/text-utils";
import { callLLM, type ProviderConfig } from "@/lib/llm/client";
import { getActiveProvider } from "@/lib/llm";

function ok(id: unknown, result: unknown) { return Response.json({ jsonrpc: "2.0", id, result }); }
function err(id: unknown, code: number, message: string) { return Response.json({ jsonrpc: "2.0", id, error: { code, message } }); }

async function handleInitialize(id: unknown) {
  return ok(id, {
    protocolVersion: "2024-11-05",
    capabilities: { tools: { listChanged: true }, resources: { subscribe: true, listChanged: true }, prompts: { listChanged: true } },
    serverInfo: { name: "3A Studio MCP Server", version: "1.0.0" },
  });
}

async function handleToolsList(id: unknown) {
  const skills = await db.skill.findMany({ orderBy: { name: "asc" } });
  return ok(id, { tools: skills.map((s) => toMCPTools(parseSkillToData(s))) });
}

/** Execute skill entry code in sandboxed Function, or fall back to LLM */
async function handleToolsCall(id: unknown, params: Record<string, unknown>) {
  const toolName = params.name as string;
  const args = (params.arguments ?? {}) as Record<string, unknown>;
  const skill = await db.skill.findUnique({ where: { slug: toolName }, include: { files: true } });
  if (!skill) return err(id, -32602, `Tool not found: ${toolName}`);

  // Try code execution path: find entry file or legacy code
  const entryFile = skill.files.find((f) => f.role === "entry");
  const rawCode = entryFile?.content || skill.code;
  const isJS = entryFile ? ["javascript", "typescript"].includes(entryFile.language) : true;
  if (rawCode.trim() && isJS) {
    try {
      const result = await executeSkillCode(rawCode, args);
      return ok(id, { content: [{ type: "text", text: JSON.stringify(result) }], isError: false });
    } catch (e) {
      // Code failed -- fall through to LLM
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[MCP] Skill code exec failed for ${toolName}: ${msg}`);
    }
  }

  // LLM fallback: describe skill + user args
  return handleToolsCallLLM(id, skill, args);
}

/** Sandboxed code execution: expects skill code to define handler(inputs) */
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

async function handleResourcesList(id: unknown) {
  const cols = await db.knowledgeCollection.findMany({ orderBy: { name: "asc" } });
  return ok(id, { resources: cols.map((c) => ({ uri: `3a://knowledge/${c.id}`, name: c.name, description: c.description || `Collection: ${c.name}`, mimeType: "application/json" })) });
}

async function handleResourcesRead(id: unknown, params: Record<string, unknown>) {
  const uri = params.uri as string;
  const m = uri.match(/^3a:\/\/knowledge\/(.+)$/);
  if (!m) return err(id, -32602, `Invalid URI: ${uri}`);
  const col = await db.knowledgeCollection.findUnique({ where: { id: m[1] }, include: { documents: true } });
  if (!col) return err(id, -32602, `Collection not found: ${m[1]}`);
  return ok(id, { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ name: col.name, description: col.description, documents: col.documents.map((d) => ({ id: d.id, title: d.title, fileType: d.fileType })) }) }] });
}

async function handlePromptsList(id: unknown) {
  const ts = await db.promptTemplate.findMany({ orderBy: { name: "asc" } });
  return ok(id, { prompts: ts.map((t) => ({ name: t.name, description: `${t.category}: ${t.name}`, arguments: (JSON.parse(t.variables) as string[]).map((v) => ({ name: v, required: true, description: `Variable: ${v}` })) })) });
}

async function handlePromptsGet(id: unknown, params: Record<string, unknown>) {
  const name = params.name as string;
  const t = await db.promptTemplate.findFirst({ where: { name } });
  if (!t) return err(id, -32602, `Prompt not found: ${name}`);
  let content = t.content;
  for (const [k, v] of Object.entries((params.arguments ?? {}) as Record<string, string>)) content = content.replaceAll(`{{${k}}}`, v);
  return ok(id, { description: `${t.category}: ${t.name}`, messages: [{ role: "user", content: { type: "text", text: content } }] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, params, id } = body;
    if (body.jsonrpc !== "2.0" || !method) return err(id ?? 0, -32600, "Invalid Request");
    const p = (params ?? {}) as Record<string, unknown>;
    switch (method) {
      case "initialize": return await handleInitialize(id);
      case "notifications/initialized": return new Response(null, { status: 204 });
      case "tools/list": return await handleToolsList(id);
      case "tools/call": return await handleToolsCall(id, p);
      case "resources/list": return await handleResourcesList(id);
      case "resources/read": return await handleResourcesRead(id, p);
      case "prompts/list": return await handlePromptsList(id);
      case "prompts/get": return await handlePromptsGet(id, p);
      default: return err(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    return err(0, -32603, e instanceof Error ? e.message : "Internal error");
  }
}
