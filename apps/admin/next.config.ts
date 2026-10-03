import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@sbc/database'],
  devIndicators: false,
};

export default nextConfig;
