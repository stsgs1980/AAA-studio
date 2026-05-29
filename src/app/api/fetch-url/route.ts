import { NextResponse } from 'next/server';

async function githubTree(
  owner: string, repo: string, path: string = '',
): Promise<{ name: string; type: string; path: string; download_url: string | null }[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((f: Record<string, unknown>) => ({
        name: String(f.name),
        type: String(f.type),
        path: String(f.path),
        download_url: f.download_url as string | null,
      }))
    : [];
}

async function githubFile(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${res.status}`);
  return res.text();
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url?.trim()) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const trimmed = url.trim().replace(/\/+$/, '');

    // 1. GitHub repo URL (with or without .git)
    const repoMatch = trimmed.match(
      /github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(\.git)?$/,
    );
    if (repoMatch) {
      const tree = await githubTree(repoMatch[1], repoMatch[2]);
      return NextResponse.json({
        type: 'repo',
        owner: repoMatch[1],
        repo: repoMatch[2],
        files: tree
          .filter((f) => f.type === 'file')
          .map((f) => ({ name: f.name, path: f.path, url: f.download_url })),
      });
    }

    // 2. GitHub raw URL or any other direct file URL
    const content = await githubFile(trimmed);
    return NextResponse.json({ type: 'content', content });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
