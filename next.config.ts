import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@stsgs/ui", "@stsgs/shared", "@stsgs/prompting"],
  // trailingSlash must be false — breaks POST API routes with 308 redirect
};

export default nextConfig;
