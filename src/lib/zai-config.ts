import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Ensure .z-ai-config exists before ZAI.create().
 * On Vercel: writes from env vars to a temp location.
 * Locally: uses existing /etc/.z-ai-config or project root file.
 */
export async function ensureZAIConfig(): Promise<void> {
  // On Vercel /tmp is the only writable dir; locally use cwd.
  const tmpPath = '/tmp/.z-ai-config';
  const paths = [
    tmpPath,
    path.join(process.cwd(), '.z-ai-config'),
    path.join(os.homedir(), '.z-ai-config'),
    '/etc/.z-ai-config',
  ];

  // Check if config already exists at any known path
  for (const p of paths) {
    try {
      const raw = await fs.readFile(p, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.baseUrl && parsed.apiKey) return;
    } catch { /* continue */ }
  }

  // Build config from env vars
  const base = process.env.ZAI_BASE_URL;
  const key = process.env.ZAI_API_KEY;
  const chatId = process.env.ZAI_CHAT_ID ?? '';
  const userId = process.env.ZAI_USER_ID ?? '';
  const token = process.env.ZAI_TOKEN ?? '';

  if (!base || !key) return;

  const config = JSON.stringify({ baseUrl: base, apiKey: key, chatId, userId, token });

  // Write to the first writable location (always /tmp first for serverless)
  const writeTargets = process.env.VERCEL ? [tmpPath] : [path.join(process.cwd(), '.z-ai-config'), tmpPath];
  for (const target of writeTargets) {
    try {
      await fs.writeFile(target, config);
      return;
    } catch { /* try next */ }
  }
}
