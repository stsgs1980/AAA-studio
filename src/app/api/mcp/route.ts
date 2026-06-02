/**
 * MCP Server -- POST/GET/DELETE /api/mcp
 * Streamable HTTP transport (MCP spec 2024-11-05):
 *   POST  — JSON-RPC requests/responses
 *   GET   — SSE stream for server-to-client notifications
 *   DELETE — close session
 */

import { handleInitialize, handleToolsList, handleToolsCall, handleResourcesList, handleResourcesRead, handlePromptsList, handlePromptsGet, ok, err } from "./handlers";

const sessions = new Map<string, { controller: ReadableStreamDefaultController }>();

export async function POST(request: Request) {
  try {
    const sessionId = request.headers.get("Mcp-Session-Id") ?? crypto.randomUUID();
    const body = await request.json();
    const { method, params, id } = body;
    if (body.jsonrpc !== "2.0" || !method) return Response.json(err(id ?? 0, -32600, "Invalid Request"), { headers: { "Mcp-Session-Id": sessionId } });
    const p = (params ?? {}) as Record<string, unknown>;
    let result;
    switch (method) {
      case "initialize": result = await handleInitialize(id); break;
      case "notifications/initialized": return new Response(null, { status: 204 });
      case "tools/list": result = await handleToolsList(id); break;
      case "tools/call": result = await handleToolsCall(id, p); break;
      case "resources/list": result = await handleResourcesList(id); break;
      case "resources/read": result = await handleResourcesRead(id, p); break;
      case "prompts/list": result = await handlePromptsList(id); break;
      case "prompts/get": result = await handlePromptsGet(id, p); break;
      default: result = err(id, -32601, `Method not found: ${method}`);
    }
    return Response.json(result, { headers: { "Mcp-Session-Id": sessionId } });
  } catch (e) {
    return Response.json(err(0, -32603, e instanceof Error ? e.message : "Internal error"));
  }
}

/** GET — SSE stream for server-to-client notifications (tools list changed, etc.) */
export async function GET(request: Request) {
  const sessionId = request.headers.get("Mcp-Session-Id") ?? crypto.randomUUID();
  const stream = new ReadableStream({
    start(controller) {
      sessions.set(sessionId, { controller });
      // Send endpoint event so client knows where to POST
      const endpoint = new URL("/api/mcp", request.url).href;
      controller.enqueue(`event: endpoint\ndata: ${endpoint}\n\n`);
      // Heartbeat every 30s to keep connection alive
      const hb = setInterval(() => { try { controller.enqueue(":heartbeat\n\n"); } catch { clearInterval(hb); } }, 30000);
      // Cleanup on close
      request.signal.addEventListener("abort", () => { clearInterval(hb); sessions.delete(sessionId); try { controller.close(); } catch { /* */ } });
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "Mcp-Session-Id": sessionId, "Access-Control-Allow-Origin": "*" },
  });
}

/** DELETE — close SSE session */
export async function DELETE(request: Request) {
  const sessionId = request.headers.get("Mcp-Session-Id");
  if (sessionId) {
    const session = sessions.get(sessionId);
    if (session) { try { session.controller.close(); } catch { /* */ } sessions.delete(sessionId); }
  }
  return new Response(null, { status: 204 });
}
