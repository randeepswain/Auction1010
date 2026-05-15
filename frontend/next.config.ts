import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.valorant-api.com' },
      { protocol: 'http', hostname: 'localhost', port: '3001' },
    ],
  },
};

export default nextConfig;
