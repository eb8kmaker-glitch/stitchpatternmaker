import type { Metadata } from 'next'
import { locales, type Locale } from '@/lib/i18n/locales'
import HomePage from '@/components/pages/HomePage'

const LOCALE_KEYWORDS: Record<string, string[]> = {
  ko: ['십자수 도안', '십자수 도안 만들기', '사진 십자수 변환', 'DMC 색상표', '크로스스티치', '자수 도안'],
  ja: ['クロスステッチ 図案', 'クロスステッチ 図案 作成', '写真 クロスステッチ 変換', 'DMC 刺繍糸', '刺しゅう図案'],
}

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
    keywords: LOCALE_KEYWORDS[locale],
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
