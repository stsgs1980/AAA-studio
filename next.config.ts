import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@stsgs/ui", "@stsgs/shared", "@stsgs/prompting"],
  turbopack: {
    root: "..",
  },
};

export default nextConfig;
