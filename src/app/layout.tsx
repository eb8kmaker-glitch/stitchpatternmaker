import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const SITE_URL = 'https://stitchpatternmaker.app'
const SITE_NAME = 'Stitch Pattern Maker'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — 십자수 도안 생성기`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Convert photos into beautiful cross stitch patterns instantly. Free DMC thread color mapping with LAB color space analysis. 사진을 DMC 십자수 도안으로 즉시 변환.',
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
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  openGraph: {
    title: SITE_NAME,
    description: 'Convert images into cross stitch patterns instantly.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ko_KR',
  },

  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: 'Convert images into cross stitch patterns instantly.',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
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
