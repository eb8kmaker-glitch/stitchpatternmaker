import type { Metadata } from 'next'
import { locales, type Locale } from '@/lib/i18n/locales'
import FeedbackPage from '@/app/feedback/page'

const SITE_URL = 'https://stitchpatternmaker.app'
const OG_IMAGE = `${SITE_URL}/og-image.png`

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = locales[locale as Locale] ?? locales.en

  return {
    title: `${t.feedback.title} | Stitch Pattern Maker`,
    description: t.feedback.subtitle,
    openGraph: {
      title: `${t.feedback.title} | Stitch Pattern Maker`,
      description: t.feedback.subtitle,
      type: 'website',
      locale: t.meta.ogLocale,
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/feedback`,
      languages: {
        'en':        `${SITE_URL}/feedback`,
        'ko':        `${SITE_URL}/ko/feedback`,
        'ja':        `${SITE_URL}/ja/feedback`,
        'x-default': `${SITE_URL}/feedback`,
      },
    },
  }
}

export default FeedbackPage
