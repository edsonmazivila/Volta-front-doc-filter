import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/platform/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: 'https://voltahr.com/sitemap.xml',
  }
}
