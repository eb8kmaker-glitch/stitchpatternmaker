import type { Metadata } from 'next'
import { locales, type Locale } from '@/lib/i18n/locales'
import GalleryContent from '@/components/pages/GalleryContent'

const SITE_URL = 'https://stitchpatternmaker.app'
const OG_IMAGE = `${SITE_URL}/og-image.png`

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = locales[locale as Locale] ?? locales.en

  const metaTitles: Record<string, string> = {
    ko: '설정 옵션 예시 갤러리 | Stitch Pattern Maker',
    ja: '設定オプションサンプルギャラリー | Stitch Pattern Maker',
  }
  const metaDescs: Record<string, string> = {
    ko: '비율 모드·색상 수·품질·디더링·유사색 분리 설정별 도안 비교 갤러리.',
    ja: '縦横比・色数・品質・ディザリング・類似色分離設定ごとの図案比較ギャラリー。',
  }

  return {
    title: metaTitles[locale] ?? t.gallery.heroTitle,
    description: metaDescs[locale] ?? t.gallery.heroDesc,
    openGraph: {
      title: metaTitles[locale] ?? t.gallery.heroTitle,
      description: metaDescs[locale] ?? t.gallery.heroDesc,
      type: 'website',
      locale: t.meta.ogLocale,
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
    alternates: {
      canonical: `${SITE_URL}/${locale}/gallery`,
      languages: {
        'en':        `${SITE_URL}/gallery`,
        'ko':        `${SITE_URL}/ko/gallery`,
        'ja':        `${SITE_URL}/ja/gallery`,
        'x-default': `${SITE_URL}/gallery`,
      },
    },
  }
}

export default function LocaleGalleryPage() {
  return <GalleryContent />
}
