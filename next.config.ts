import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker builds
  // This creates a minimal production bundle with only necessary files
  output: "standalone",

  // Enable Lingui SWC plugin for macro transformation
  // This enables <Trans>, t``, etc. macros to be compiled at build time
  experimental: {
    swcPlugins: [["@lingui/swc-plugin", {}]],
  },

  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.**.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
