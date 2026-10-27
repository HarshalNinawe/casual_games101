import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Ensure Phaser is only bundled for client-side
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Phaser uses browser globals; exclude it from server bundle
      config.externals = [...(config.externals || []), "phaser"];
    }
    return config;
  },
};

export default nextConfig;
