import { NextResponse } from "next/server";
import { createZAI } from "@/lib/zai-config";
import { mockCompletion } from "@/lib/llm-mock";

/**
 * POST /api/llm
 * Proxy LLM requests to z-ai-web-dev-sdk.
 * Falls back to mock response when API is unreachable.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, temperature, max_tokens } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let zai: any = null;
    try { zai = await createZAI(); }
    catch (err) { console.warn("[/api/llm] ZAI init failed:", err); }

    if (!zai) {
      return NextResponse.json(mockCompletion(messages));
    }

    const completion = await zai.chat.completions.create({
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens ?? 4096,
    });
    return NextResponse.json(completion);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/llm]", msg);

    if (msg.includes("fetch failed") || msg.includes("timeout") || msg.includes("ENOTFOUND")) {
      const body = await request.json().catch(() => ({ messages: [] }));
      return NextResponse.json(mockCompletion(body.messages ?? [], msg));
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
