import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@stsgs/ui", "@stsgs/shared", "@stsgs/prompting"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;