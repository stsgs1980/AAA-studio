/**
 * Mock LLM responses for demo mode.
 * Used when real LLM API is unreachable (e.g. on Vercel deployment).
 */

const MOCK_RESPONSES: Record<string, string> = {
  analyze: `[Demo] Analysis complete.
Input received: "{{input}}"
This is a simulated response — connect a real LLM provider to enable live inference.`,
  review: `[Demo] Code review finished.
No critical issues found in the provided input.
(Enable live LLM in Settings to get real reviews.)`,
  research: `[Demo] Research summary generated.
Based on the query: "{{input}}"
Configure an API key in Settings for real results.`,
  writer: `[Demo] Content generated successfully.
The pipeline executed all nodes in sequence. This demonstrates the flow orchestration engine.`,
  assistant: `[Demo] Assistant response.
I received your input and processed it through the pipeline.
This is demo mode — connect an LLM API for real conversations.`,
  creative: `[Demo] Creative response generated.
The pipeline processed your request through the configured nodes.
Enable a live LLM provider for genuine creative output.`,
};

/** Generate a mock LLM response based on system prompt context. */
export function mockLLMResponse(systemPrompt: string, userInput: string): string {
  const lower = systemPrompt.toLowerCase();
  const key = Object.keys(MOCK_RESPONSES).find((k) => lower.includes(k));
  const base = key
    ? MOCK_RESPONSES[key]
    : `[Demo] Mock response for prompt: "{{input}}"\nConfigure ZAI_BASE_URL or an external LLM API key to enable real inference.`;
  return base.replaceAll("{{input}}", userInput.slice(0, 100));
}

/** Build a mock chat completion object. */
export function mockCompletion(messages: Array<{ content: string }>, errorMessage?: string) {
  const lastMsg = messages[messages.length - 1]?.content ?? "";
  const hint = errorMessage
    ? `\nError: ${errorMessage.slice(0, 100)}`
    : "\nConfigure ZAI_BASE_URL + ZAI_API_KEY environment variables for live responses.";
  return {
    id: "mock-" + Date.now(),
    choices: [{
      message: {
        role: "assistant" as const,
        content: `[Demo Mode] LLM API is not configured for this deployment.\nYour message: "${String(lastMsg).slice(0, 120)}"${hint}`,
      },
      finish_reason: "stop",
    }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    mock: true,
  };
}

/** Call LLM with automatic mock fallback on network errors. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function callLLMWithFallback(
  zai: any,
  systemPrompt: string,
  userInput: string,
  temperature?: number,
): Promise<{ response: string; mock: boolean }> {
  if (!zai) return { response: mockLLMResponse(systemPrompt, userInput), mock: true };

  try {
    const comp = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
      temperature: temperature ?? 0.7,
    });
    const text = comp.choices?.[0]?.message?.content ?? "";
    return { response: text, mock: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isNetwork = msg.includes("fetch failed") || msg.includes("timeout") || msg.includes("ENOTFOUND");
    if (isNetwork) {
      console.warn("[execute] LLM unreachable, using mock:", msg);
      return { response: mockLLMResponse(systemPrompt, userInput), mock: true };
    }
    throw err;
  }
}
