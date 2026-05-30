import type { ThreadUsage } from '@/types'

export const WORK_COLOR_PALETTE = [
  '#FF0000', // 빨강
  '#0000FF', // 파랑
  '#00BB00', // 초록
  '#FFD700', // 노랑
  '#FF6600', // 주황
  '#CC00CC', // 마젠타
  '#00CCFF', // 하늘
  '#FF69B4', // 핑크
  '#8B4513', // 갈색
  '#008080', // 청록
  '#7FFF00', // 연두
  '#C71585', // 자주
  '#000080', // 남색
  '#808000', // 올리브
  '#FF4500', // 주홍
  '#3EB489', // 민트
]

function hexToRgbArr(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let rn = r / 255, gn = g / 255, bn = b / 255
  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92
  const x = (rn * 0.4124 + gn * 0.3576 + bn * 0.1805) / 0.95047
  const y = (rn * 0.2126 + gn * 0.7152 + bn * 0.0722) / 1.00000
  const z = (rn * 0.0193 + gn * 0.1192 + bn * 0.9505) / 1.08883
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

function deltaE(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgbArr(hex1)
  const [r2, g2, b2] = hexToRgbArr(hex2)
  const [l1, a1, bb1] = rgbToLab(r1, g1, b1)
  const [l2, a2, bb2] = rgbToLab(r2, g2, b2)
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (bb1 - bb2) ** 2)
}

export function assignWorkColors(threads: ThreadUsage[]): string[] {
  const assigned: string[] = []
  for (let i = 0; i < threads.length; i++) {
    const recent = assigned.slice(Math.max(0, i - WORK_COLOR_PALETTE.length))
    let bestColor = WORK_COLOR_PALETTE[i % WORK_COLOR_PALETTE.length]
    let bestScore = -1

    for (const candidate of WORK_COLOR_PALETTE) {
      if (recent.includes(candidate) && recent.length >= WORK_COLOR_PALETTE.length) continue
      let minDist = Infinity
      for (const prev of recent) {
        const d = deltaE(candidate, prev)
        if (d < minDist) minDist = d
      }
      if (recent.length === 0) minDist = 1000
      if (minDist > bestScore) {
        bestScore = minDist
        bestColor = candidate
      }
    }
    assigned.push(bestColor)
  }
  return assigned
}
