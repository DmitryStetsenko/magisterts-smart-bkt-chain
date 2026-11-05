import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@sbc/ui', '@sbc/routes'],
  devIndicators: false,
};

export default nextConfig;
