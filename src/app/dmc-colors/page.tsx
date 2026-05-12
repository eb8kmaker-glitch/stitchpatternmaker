import type { Metadata } from 'next'
import DmcColorsClient from './DmcColorsClient'

export const metadata: Metadata = {
  title: 'DMC 실 색상표 — 전체 색상 검색 및 분류 | Cotton & Bloom Studio',
  description:
    'DMC 자수실 전체 색상을 번호·이름·색상군별로 검색하세요. HEX, RGB 값과 함께 빨강·파랑·초록·브라운 등 색상군별로 분류되어 있습니다. 십자수 초보 추천 색상 세트도 소개합니다.',
  keywords: [
    'DMC 색상표', 'DMC 실 번호', '십자수 실', '크로스스티치 실',
    'DMC 팔레트', '자수실 색상', 'DMC 색상 검색',
  ],
  openGraph: {
    title: 'DMC 실 색상표 전체 | Cotton & Bloom Studio',
    description: 'DMC 자수실 전체 색상을 번호·이름으로 검색하고 색상군별로 탐색하세요.',
    type: 'website',
  },
}

export default function DmcColorsPage() {
  return <DmcColorsClient />
}
