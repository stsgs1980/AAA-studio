import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@stsgs/ui", "@stsgs/shared", "@stsgs/prompting"],
  // Enable trailing slash so Next.js generates /path/ URLs natively.
  // This avoids 308 conflicts with the sandbox proxy.
  trailingSlash: true,
};

export default nextConfig;