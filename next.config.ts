import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages (Edge runtime compatibility)
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages requires this for Server Actions & API routes
  serverExternalPackages: ["@tidbcloud/serverless"],
  // Configure outputFileTracingRoot at top-level to avoid scanning parent folders
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
