import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hua-labs/ui"],
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
