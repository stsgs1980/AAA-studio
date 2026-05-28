import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Ensure .z-ai-config exists before ZAI.create().
 * On Vercel: writes from env vars to a temp location.
 * Locally: uses existing /etc/.z-ai-config or project root file.
 */
export async function ensureZAIConfig(): Promise<void> {
  const paths = [
    path.join(process.cwd(), '.z-ai-config'),
    path.join(os.homedir(), '.z-ai-config'),
    '/etc/.z-ai-config',
  ];

  // Check if config already exists
  for (const p of paths) {
    try {
      const raw = await fs.readFile(p, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.baseUrl && parsed.apiKey) return;
    } catch { /* continue */ }
  }

  // Try to create from env vars
  const base = process.env.ZAI_BASE_URL;
  const key = process.env.ZAI_API_KEY;
  const chatId = process.env.ZAI_CHAT_ID ?? '';
  const userId = process.env.ZAI_USER_ID ?? '';
  const token = process.env.ZAI_TOKEN ?? '';

  if (base && key) {
    const config = JSON.stringify({ baseUrl: base, apiKey: key, chatId, userId, token });
    await fs.writeFile(path.join(process.cwd(), '.z-ai-config'), config);
  }
}
