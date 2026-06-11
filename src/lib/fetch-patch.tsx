"use client";

// Sandbox proxy (space-z.ai) adds trailing slash via 308 redirect for ALL requests.
// Browser fetch follows 308 but converts POST to GET, breaking login and all POST/PUT/DELETE API calls.
// On Vercel production, no such proxy exists and everything works fine.
//
// This module self-executes on import and patches window.fetch immediately.
// It also patches history.pushState/replaceState to add trailing slashes for page navigations.

if (typeof window !== "undefined") {
  const orig = window.fetch.bind(window);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string") {
      // Append trailing slash to all same-origin paths (not just /api/)
      if (input.startsWith("/") && !input.endsWith("/") && !input.includes(".")) {
        input = input + "/";
      }
    }
    return orig(input, init);
  };

  // Also patch pushState/replaceState so Next.js router navigations include trailing slash
  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (history as any).pushState = (state: any, title: string, url?: string | URL | null) => {
    if (typeof url === "string" && url.startsWith("/") && !url.endsWith("/") && !url.includes(".")) {
      url = url + "/";
    }
    return origPush(state, title, url);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (history as any).replaceState = (state: any, title: string, url?: string | URL | null) => {
    if (typeof url === "string" && url.startsWith("/") && !url.endsWith("/") && !url.includes(".")) {
      url = url + "/";
    }
    return origReplace(state, title, url);
  };
}

export function FetchPatch() {
  return null;
}