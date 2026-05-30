import { handleError, success, BadRequest } from '@/lib/api-error';

interface TreeEntry {
  path: string;
  type: string;
  size?: number;
}

async function githubTreeRecursive(
  owner: string, repo: string,
): Promise<TreeEntry[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
  if (!res.ok) {
    // fallback to master branch
    const res2 = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } },
    );
    if (!res2.ok) throw new Error(`GitHub Trees API failed`);
    const data = await res2.json();
    return (data.tree ?? []).filter((t: TreeEntry) => t.type === 'blob');
  }
  const data = await res.json();
  return (data.tree ?? []).filter((t: TreeEntry) => t.type === 'blob');
}

function isNoise(path: string, size?: number): boolean {
  const skip = [
    'node_modules/', '.next/', '.git/', '__pycache__/', '.venv/', 'venv/',
    'dist/', 'build/', '.cache/', '.output/', '.nuxt/', '.turbo/',
    'coverage/', '.DS_Store', 'package-lock.json', 'yarn.lock',
    'pnpm-lock.yaml', '.env', '.env.local', 'next-env.d.ts',
    'tsconfig.tsbuildinfo', '.tsbuildinfo',
    // non-agent content
    'dashboard-integration/', '.github/', 'hooks/',
    'dev.log', 'opencode.json', 'templates/e2e/',
  ];
  const lower = path.toLowerCase();
  if (skip.some((s) => lower.includes(s))) return true;
  if (/\.(png|jpg|jpeg|gif|svg|ico|bmp|webp|woff|woff2|ttf|eot|mp3|mp4|wav|zip|tar|gz|exe|dll|so|dylib)$/i.test(path)) return true;
  if (size !== undefined && size > 500_000) return true;
  return false;
}

function toRawUrl(owner: string, repo: string, path: string): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
}

async function githubFile(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${res.status}`);
  return res.text();
}

export async function POST(request: Request) {
  try {
    const { url, urls } = await request.json();
    if (!url?.trim()) {
      throw BadRequest('URL is required');
    }
    const bodyUrls = urls as string[] | undefined;

    const trimmed = url.trim().replace(/\/+$/, '');

    // 1. GitHub repo URL -- if urls[] provided, fetch all files
    const repoMatch = trimmed.match(
      /github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(\.git)?$/,
    );
    if (repoMatch) {
      const [, owner, repo] = repoMatch;

      if (bodyUrls && bodyUrls.length > 0) {
        const parts: string[] = [];
        for (const fileUrl of bodyUrls) {
          try {
            const c = await githubFile(fileUrl);
            if (c) parts.push(`\n=== ${fileUrl} ===\n${c}`);
          } catch { /* skip failed */ }
        }
        return success({ type: 'content', content: parts.join('\n') });
      }

      // Recursive tree -- gets ALL files, then filter noise
      const tree = await githubTreeRecursive(owner, repo);
      return success({
        type: 'repo',
        owner,
        repo,
        files: tree
          .filter((t) => !isNoise(t.path, t.size as number | undefined))
          .map((t) => {
            const name = t.path.split('/').pop() ?? t.path;
            return { name, path: t.path, url: toRawUrl(owner, repo, t.path) };
          }),
      });
    }

    // 2. GitHub raw URL or any other direct file URL
    const content = await githubFile(trimmed);
    return success({ type: 'content', content });
  } catch (error) {
    return handleError(error);
  }
}
