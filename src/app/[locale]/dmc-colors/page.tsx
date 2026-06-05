import type { Metadata } from 'next'
import { locales, type Locale } from '@/lib/i18n/locales'
import DmcColorsClient from '@/app/dmc-colors/DmcColorsClient'

const SITE_URL = 'https://stitchpatternmaker.app'
const OG_IMAGE = `${SITE_URL}/og-image.png`

const META: Record<string, { title: string; description: string }> = {
  ko: {
    title: 'DMC 실 색상표 — 전체 색상 검색 및 분류 | Stitch Pattern Maker',
    description: 'DMC 자수실 전체 색상을 번호·이름·색상군별로 검색하세요.',
  },
  ja: {
    title: 'DMC糸色見本 — 全色検索・分類 | Stitch Pattern Maker',
    description: 'DMC刺繍糸の全色を番号・名前・カラーグループで検索できます。',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = locales[locale as Locale] ?? locales.en
  const meta = META[locale] ?? { title: 'DMC Color Chart | Stitch Pattern Maker', description: 'Browse all 465 DMC embroidery thread colors.' }

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: t.meta.ogLocale,
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/dmc-colors`,
      languages: {
        'en':        `${SITE_URL}/dmc-colors`,
        'ko':        `${SITE_URL}/ko/dmc-colors`,
        'ja':        `${SITE_URL}/ja/dmc-colors`,
        'x-default': `${SITE_URL}/dmc-colors`,
      },
    },
  }
}

export default function LocaleDmcColorsPage() {
  return <DmcColorsClient />
}
