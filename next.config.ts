import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages (Edge runtime compatibility)
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages requires this for Server Actions & API routes
  experimental: {
    serverComponentsExternalPackages: ["@tidbcloud/serverless"],
  },
};

export default nextConfig;
