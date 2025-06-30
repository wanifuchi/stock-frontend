import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://stock-backend-production-4ff1.up.railway.app'
  }
};

export default nextConfig;
