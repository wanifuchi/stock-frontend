import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://stock-backend-production-4ff1.up.railway.app'
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://stock-backend-production-4ff1.up.railway.app/api/:path*',
      },
    ];
  },
  // Vercel設定
  async headers() {
    return [
      {
        source: '/api/proxy/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
