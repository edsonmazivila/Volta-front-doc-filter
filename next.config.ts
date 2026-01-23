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
      // Direct S3 access (current - will be deprecated)
      {
        protocol: 'https',
        hostname: 'django-project-tmz.s3.us-east-2.amazonaws.com',
        pathname: '/nexupayroll/**',
      },
      // CloudFront CDN (future - add actual CloudFront domain when available)
      // Example: { protocol: 'https', hostname: 'd111111abcdef8.cloudfront.net' }
      // TODO: Add CloudFront distribution domain once configured in AWS
    ],
  },

  // Security and SEO headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
};

export default nextConfig;
