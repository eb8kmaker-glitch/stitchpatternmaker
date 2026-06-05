import type { Metadata } from 'next'
import { locales, type Locale } from '@/lib/i18n/locales'
import HomePage from '@/components/pages/HomePage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = locales[locale as Locale] ?? locales.en
  const SITE_URL = 'https://stitchpatternmaker.app'
  const OG_IMAGE = `${SITE_URL}/og-image.png`
  const localeUrl = `${SITE_URL}/${locale}`

  return {
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url: localeUrl,
      siteName: 'Stitch Pattern Maker',
      type: 'website',
      locale: t.meta.ogLocale,
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.title,
      description: t.meta.description,
      images: [OG_IMAGE],
    },
    alternates: {
      canonical: localeUrl,
      languages: {
        'en':        SITE_URL,
        'ko':        `${SITE_URL}/ko`,
        'ja':        `${SITE_URL}/ja`,
        'x-default': SITE_URL,
      },
    },
  }
}

export default function LocaleHomePage() {
  return <HomePage />
}
