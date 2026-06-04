import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const SITE_URL  = 'https://stitchpatternmaker.app'
const SITE_NAME = 'Stitch Pattern Maker'
const OG_IMAGE  = `${SITE_URL}/og-image.png`
const SITE_DESC = 'Turn any photo into a print-ready DMC cross stitch pattern. Free, browser-only processing — no account required.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:  'Free Cross Stitch Pattern Maker | Photo to DMC Pattern',
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    'cross stitch pattern',
    'cross stitch generator',
    'photo to cross stitch',
    'stitch pattern maker',
    'DMC pattern generator',
    'embroidery pattern maker',
    '십자수',
    '십자수 도안',
    'DMC',
    '크로스스티치',
    '자수 도안',
  ],
  authors:   [{ name: SITE_NAME, url: SITE_URL }],
  creator:   SITE_NAME,
  publisher: SITE_NAME,

  openGraph: {
    title:       'Free Cross Stitch Pattern Maker — Photo to DMC Pattern',
    description: SITE_DESC,
    url:         SITE_URL,
    siteName:    SITE_NAME,
    type:        'website',
    locale:      'en_US',
    images: [
      {
        url:    OG_IMAGE,
        width:  1200,
        height: 630,
        alt:    'Stitch Pattern Maker — Free photo to cross stitch pattern generator',
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       'Free Cross Stitch Pattern Maker — Photo to DMC Pattern',
    description: SITE_DESC,
    images:      [OG_IMAGE],
  },

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
    languages: {
      'en':        SITE_URL,
      'x-default': SITE_URL,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8254204287118850"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
