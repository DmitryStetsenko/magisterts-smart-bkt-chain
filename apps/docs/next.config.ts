import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "magisterts-smart-bkt-chain";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

