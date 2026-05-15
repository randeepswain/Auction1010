import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const apiHost = API_URL ? new URL(API_URL).hostname : 'localhost';
const apiProtocol = API_URL ? (API_URL.startsWith('https') ? 'https' : 'http') : 'http';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.valorant-api.com' },
      { protocol: apiProtocol as any, hostname: apiHost },
    ],
  },
};

export default nextConfig;
