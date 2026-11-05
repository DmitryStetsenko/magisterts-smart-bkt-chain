import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@sbc/database', '@sbc/ui', '@sbc/routes'],
  devIndicators: false,
};

export default nextConfig;
