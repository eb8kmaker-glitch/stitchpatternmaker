import type { Metadata } from 'next'
import GalleryContent from '@/components/pages/GalleryContent'

const SITE_URL = 'https://stitchpatternmaker.app'
const OG_IMAGE = `${SITE_URL}/og-image.png`

export const metadata: Metadata = {
  title: 'Pattern Settings Gallery | Stitch Pattern Maker',
  description: 'Compare cross stitch pattern examples by aspect mode, color count, quality, dithering, and color separation settings.',
  openGraph: {
    title: 'Pattern Settings Gallery | Stitch Pattern Maker',
    description: 'Compare cross stitch pattern examples for each setting option.',
    type: 'website',
    locale: 'en_US',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Stitch Pattern Maker' }],
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
  alternates: {
    canonical: `${SITE_URL}/gallery`,
    languages: {
      'en':        `${SITE_URL}/gallery`,
      'ko':        `${SITE_URL}/ko/gallery`,
      'ja':        `${SITE_URL}/ja/gallery`,
      'x-default': `${SITE_URL}/gallery`,
    },
  },
}

export default function GalleryPage() {
  return <GalleryContent />
}
