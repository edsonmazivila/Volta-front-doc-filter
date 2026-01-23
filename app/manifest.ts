import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Volta HR - All-in-One HR & Payroll Platform',
    short_name: 'Volta HR',
    description: 'Streamline employee management, time tracking, leave requests, and payroll processing. Secure, scalable, and built for growth.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030009',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['business', 'productivity', 'finance'],
    lang: 'en',
    dir: 'ltr',
  }
}
