import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cotton & Bloom Studio — 십자수 도안 생성기',
  description: '소중한 사진을 감성적인 DMC 십자수 도안으로. LAB 색공간 기반 색상 매핑과 유사색 자동 분리로 실제 작업 가능한 도안을 만들어드립니다.',
  keywords: ['십자수', '도안', 'DMC', '크로스스티치', '자수', 'cross stitch', 'pattern'],
  openGraph: {
    title: 'Cotton & Bloom Studio',
    description: '사진을 십자수 도안으로 — 감성 핸드메이드 공방',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
