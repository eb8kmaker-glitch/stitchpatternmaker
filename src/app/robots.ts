import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stitchpatternmaker.app'

// High-load SEO/crawler bots that provide no value to end users.
const BLOCKED_BOTS = [
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'PetalBot',
  'serpstatbot',
  'BLEXBot',
  'DataForSeoBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/*?*',
      },
      ...BLOCKED_BOTS.map(userAgent => ({
        userAgent,
        disallow: '/',
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
