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

  // Mark server-only packages as external to prevent bundling issues
  serverExternalPackages: [
    "dd-trace",
    "@datadog/pprof",
    "@datadog/libdatadog",
    "@datadog/native-metrics",
    "@datadog/native-appsec",
    "@datadog/native-iast-taint-tracking",
    "@datadog/native-iast-rewriter",
    "@datadog/wasm-js-rewriter",
  ],

  // Webpack configuration to properly handle dd-trace
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark dd-trace and all @datadog packages as external
      config.externals = config.externals || [];
      config.externals.push({
        "dd-trace": "commonjs dd-trace",
      });
    }
    return config;
  },

  // Configure external image domains
  images: {
    remotePatterns: [
      // Direct S3 access (preprod)
      {
        protocol: "https",
        hostname: "django-project-tmz.s3.us-east-2.amazonaws.com",
        pathname: "/volta/**",
      },
      // CloudFront CDN for production assets
      {
        protocol: "https",
        hostname: "assets.voltahr.io",
      },
    ],
  },

  // Security and SEO headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
