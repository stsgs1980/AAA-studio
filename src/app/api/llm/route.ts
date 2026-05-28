import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { ensureZAIConfig } from "@/lib/zai-config";

/**
 * POST /api/llm
 * Proxy LLM requests to z-ai-web-dev-sdk.
 * Accepts OpenAI-compatible message format.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, temperature, max_tokens } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    await ensureZAIConfig();
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens ?? 4096,
    });

    return NextResponse.json(completion);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/llm]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
