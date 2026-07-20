import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "almirahcollective.com",
      },
      {
        protocol: "https",
        hostname: "zscukxpafikmszrqwodc.supabase.co",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
