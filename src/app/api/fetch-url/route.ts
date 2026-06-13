import { handleError, success, BadRequest } from '@/lib/api-error';
import { classifyReason } from '@/lib/scanner/file-filter';
import type { FilterLog } from '@/lib/scanner/file-filter';

interface TreeEntry {
  path: string;
  type: string;
  size?: number;
}

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' };
  const token = process.env.GITHUB_TOKEN;
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function githubTreeRecursive(
  owner: string, repo: string,
): Promise<TreeEntry[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
    { headers: ghHeaders() },
  );
  if (!res.ok) {
    const res2 = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
      { headers: ghHeaders() },
    );
    if (!res2.ok) {
      const body = await res2.json().catch(() => ({}));
      throw new Error(body.message || 'GitHub Trees API failed');
    }
    const data = await res2.json();
    return (data.tree ?? []).filter((t: TreeEntry) => t.type === 'blob');
  }
  const data = await res.json();
  return (data.tree ?? []).filter((t: TreeEntry) => t.type === 'blob');
}

function toRawUrl(owner: string, repo: string, path: string): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
}

async function githubFile(url: string): Promise<string> {
  const h: Record<string, string> = {};
  const token = process.env.GITHUB_TOKEN;
  if (token) h['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers: h });
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

    // 1. GitHub repo URL
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

      // Recursive tree with filter log
      const tree = await githubTreeRecursive(owner, repo);
      const accepted: { name: string; path: string; url: string }[] = [];
      const entries: FilterLog['entries'] = [];

      for (const t of tree) {
        const reason = classifyReason(t.path, t.size as number | undefined);
        if (reason) {
          entries.push({ path: t.path, reason });
          continue;
        }
        const name = t.path.split('/').pop() ?? t.path;
        accepted.push({ name, path: t.path, url: toRawUrl(owner, repo, t.path) });
      }

      const filterLog: FilterLog = {
        total: tree.length,
        accepted: accepted.length,
        entries,
      };

      return success({ type: 'repo', owner, repo, files: accepted, filterLog });
    }

    // 2. GitHub raw URL or any other direct file URL
    const content = await githubFile(trimmed);
    return success({ type: 'content', content });
  } catch (error) {
    return handleError(error);
  }
}