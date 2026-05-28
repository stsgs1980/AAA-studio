import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import ZAI from 'z-ai-web-dev-sdk';

interface ZAIConfig {
  baseUrl: string;
  apiKey: string;
  chatId?: string;
  userId?: string;
  token?: string;
}

const CONFIG_PATHS = [
  path.join(process.cwd(), '.z-ai-config'),
  path.join(os.homedir(), '.z-ai-config'),
  '/etc/.z-ai-config',
];

/** Read config from the first file that exists and is valid. */
async function readConfigFile(): Promise<ZAIConfig | null> {
  for (const p of CONFIG_PATHS) {
    try {
      const raw = await fs.readFile(p, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.baseUrl && parsed.apiKey) return parsed as ZAIConfig;
    } catch { /* continue */ }
  }
  return null;
}

/** Build config from environment variables. */
function configFromEnv(): ZAIConfig | null {
  const base = process.env.ZAI_BASE_URL;
  const key = process.env.ZAI_API_KEY;
  if (!base || !key) return null;
  return {
    baseUrl: base,
    apiKey: key,
    chatId: process.env.ZAI_CHAT_ID,
    userId: process.env.ZAI_USER_ID,
    token: process.env.ZAI_TOKEN,
  };
}

/**
 * Create a ZAI instance bypassing SDK's internal loadConfig().
 * On Vercel (read-only fs): uses env vars, then monkey-patches
 * process.cwd() so the SDK finds a /tmp config file.
 */
export async function createZAI() {
  const envConfig = configFromEnv();
  if (envConfig) {
    // Write to /tmp and temporarily redirect cwd so SDK finds it
    const tmpDir = '/tmp/zai-cfg-' + Math.random().toString(36).slice(2);
    const tmpPath = path.join(tmpDir, '.z-ai-config');
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.writeFile(tmpPath, JSON.stringify(envConfig));

    const origCwd = process.cwd.bind(process);
    process.cwd = () => tmpDir;
    try {
      return await ZAI.create();
    } finally {
      process.cwd = origCwd;
      // Clean up (fire-and-forget)
      fs.rm(tmpDir, { recursive: true }).catch(() => {});
    }
  }

  // Fallback: let SDK find config on its own (local dev with /etc/.z-ai-config)
  return ZAI.create();
}

/**
 * Legacy compat — ensures config file exists for SDK's ZAI.create().
 * Prefer createZAI() which bypasses file I/O entirely on Vercel.
 */
export async function ensureZAIConfig(): Promise<void> {
  const envConfig = configFromEnv();
  if (!envConfig) {
    const existing = await readConfigFile();
    if (existing) return;
    return; // SDK's loadConfig will throw if nothing found
  }
}
