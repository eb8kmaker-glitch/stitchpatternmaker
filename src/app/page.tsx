import type { Metadata } from 'next'
import HomePage from '@/components/pages/HomePage'

const SITE_URL = 'https://stitchpatternmaker.app'
const OG_IMAGE = `${SITE_URL}/og-image.png`

export const metadata: Metadata = {
  title: 'Free Cross Stitch Pattern Maker | Photo to DMC Pattern',
  description: 'Turn any photo into a print-ready DMC cross stitch pattern. Free, browser-only processing — no account required.',
  openGraph: {
    title: 'Free Cross Stitch Pattern Maker — Photo to DMC Pattern',
    description: 'Turn any photo into a print-ready DMC cross stitch pattern. Free, browser-only processing — no account required.',
    url: SITE_URL,
    siteName: 'Stitch Pattern Maker',
    type: 'website',
    locale: 'en_US',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Stitch Pattern Maker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Cross Stitch Pattern Maker — Photo to DMC Pattern',
    description: 'Turn any photo into a print-ready DMC cross stitch pattern. Free, browser-only processing — no account required.',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en':        SITE_URL,
      'ko':        `${SITE_URL}/ko`,
      'ja':        `${SITE_URL}/ja`,
      'x-default': SITE_URL,
    },
  },
}

export default function RootHomePage() {
  return <HomePage />
}
