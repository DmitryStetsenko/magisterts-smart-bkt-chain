import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "magisterts-smart-bkt-chain";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? `/${repoName}` : "",
  images: {
    unoptimized: true,
  },
  devIndicators: false,
};

export default nextConfig;

