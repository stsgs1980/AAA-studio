"use client";

import { useEffect } from "react";

// Sandbox dev-server returns 308 redirect for /api/x to /api/x/.
// Browser fetch follows 308 but converts POST to GET, breaking all non-GET API calls.
// This component patches window.fetch to auto-append trailing slash to /api/ requests.

export function FetchPatch() {
  useEffect(() => {
    const orig = window.fetch.bind(window);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === "string" && input.startsWith("/api/") && !input.endsWith("/")) {
        input = input + "/";
      }
      return orig(input, init);
    };
  }, []);

  return null;
}