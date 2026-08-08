import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Removed for Server Actions/MySQL
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
