import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stitchpatternmaker.app'
const LOCALES = ['ko', 'ja'] as const
const PAGES = ['', '/gallery', '/guide', '/dmc-colors', '/feedback'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const enPages: MetadataRoute.Sitemap = PAGES.map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }))

  const localePages: MetadataRoute.Sitemap = LOCALES.flatMap(locale =>
    PAGES.map(path => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'weekly' : 'monthly' as const,
      priority: path === '' ? 0.9 : 0.7,
    }))
  )

  return [...enPages, ...localePages]
}
