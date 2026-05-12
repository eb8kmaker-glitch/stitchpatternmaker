import { rgbToLab, deltaE } from '@/lib/color/lab'
import { findClosestDmc, DMC_COLORS } from '@/lib/dmc/database'
import type { DmcColor, PatternResult, SepLevel } from '@/types'

// ── Progress callback type ────────────────────────────────────────────────────
export type ProgressCallback = (pct: number, label: string, sub?: string) => void

// ── Separation thresholds (ΔE) ────────────────────────────────────────────────
const SEP_THRESHOLD: Record<SepLevel, number> = {
  off:    0,
  weak:   8,
  medium: 15,
  strong: 25,
}

// ── K-means in LAB space ──────────────────────────────────────────────────────
function kMeansLab(
  pixels: [number, number, number][],
  k: number,
  iterations = 12,
): { centers: [number, number, number][]; assignments: number[] } {
  // Initialize centers with random pixels
  let centers: [number, number, number][] = []
  for (let i = 0; i < k; i++) {
    centers.push(pixels[Math.floor(Math.random() * pixels.length)])
  }

  let assignments = new Array(pixels.length).fill(0)

  for (let iter = 0; iter < iterations; iter++) {
    // Assignment step
    for (let i = 0; i < pixels.length; i++) {
      let best = 0
      let bestDist = Infinity
      for (let j = 0; j < centers.length; j++) {
        const dist = deltaE(pixels[i], centers[j])
        if (dist < bestDist) {
          bestDist = dist
          best = j
        }
      }
      assignments[i] = best
    }

    // Update step
    const sums: [number, number, number, number][] = Array.from(
      { length: k },
      () => [0, 0, 0, 0],
    )
    for (let i = 0; i < pixels.length; i++) {
      const a = assignments[i]
      sums[a][0] += pixels[i][0]
      sums[a][1] += pixels[i][1]
      sums[a][2] += pixels[i][2]
      sums[a][3]++
    }
    centers = sums.map((s, i) =>
      s[3] > 0
        ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]]
        : centers[Math.floor(Math.random() * k)],
    ) as [number, number, number][]
  }

  return { centers, assignments }
}

// ── Similar color separation ──────────────────────────────────────────────────
/**
 * For every adjacent cell pair where ΔE < threshold,
 * find an alternative DMC color for the neighbor that has
 * sufficient contrast with the current cell's color.
 */
function separateSimilarColors(
  grid: number[][],
  dmcMap: DmcColor[],
  threshold: number,
  width: number,
  height: number,
): DmcColor[] {
  const result = [...dmcMap]
  const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ci  = grid[y][x]
      const myD = result[ci]

      for (const [dy, dx] of dirs) {
        const ny = y + dy
        const nx = x + dx
        if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue

        const ni  = grid[ny][nx]
        if (ni === ci) continue

        const nbD = result[ni]
        if (deltaE(myD.lab, nbD.lab) < threshold) {
          // Find an alternative for the neighbor that contrasts with current cell
          const allUsedIds = result.map(d => d.id)
          const exclude = allUsedIds.filter(id => id !== nbD.id).slice(0, allUsedIds.length - 3)
          const alt = findClosestDmc(nbD.lab, exclude)

          if (alt && deltaE(alt.lab, myD.lab) >= threshold) {
            result[ni] = alt
          }
        }
      }
    }
  }

  return result
}

// ── Main generator ─────────────────────────────────────────────────────────────
export async function generatePattern(
  imageElement: HTMLImageElement,
  width: number,
  height: number,
  colorCount: number,
  sepLevel: SepLevel,
  onProgress?: ProgressCallback,
): Promise<PatternResult> {
  const progress = onProgress ?? (() => {})

  // 1. Resample image
  progress(10, '이미지 리샘플링 중...', '원본 비율 유지')
  await tick()

  const canvas = document.createElement('canvas')
  canvas.width  = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(imageElement, 0, 0, width, height)
  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels    = imageData.data

  // 2. Convert to LAB
  progress(25, 'LAB 색공간 변환 중...', 'perceptual color analysis')
  await tick()

  const labPixels: [number, number, number][] = []
  for (let i = 0; i < pixels.length; i += 4) {
    labPixels.push(rgbToLab(pixels[i], pixels[i + 1], pixels[i + 2]))
  }

  // 3. K-means clustering
  progress(45, '색상 군집화 중...', 'K-means in LAB space')
  await tick()

  const k = Math.min(colorCount, labPixels.length, DMC_COLORS.length)
  const { centers, assignments } = kMeansLab(labPixels, k, 12)

  // 4. Map cluster centers to DMC colors
  progress(65, 'DMC 색상 매핑 중...', 'ΔE 기반 최적 매칭')
  await tick()

  const usedIds = new Set<string>()
  const dmcMap: DmcColor[] = centers.map(center => {
    let dmc = findClosestDmc(center, [...usedIds])
    if (!dmc) dmc = findClosestDmc(center, [])
    usedIds.add(dmc.id)
    return dmc
  })

  // 5. Build grid
  progress(78, '도안 격자 생성 중...', '')
  await tick()

  const grid: number[][] = []
  for (let y = 0; y < height; y++) {
    const row: number[] = []
    for (let x = 0; x < width; x++) {
      row.push(assignments[y * width + x])
    }
    grid.push(row)
  }

  // 6. Similar color separation
  const threshold = SEP_THRESHOLD[sepLevel]
  if (threshold > 0) {
    progress(88, '유사색 분리 처리 중...', `ΔE < ${threshold} 인접 셀 보정`)
    await tick()
    const separated = separateSimilarColors(grid, dmcMap, threshold, width, height)
    separated.forEach((d, i) => { dmcMap[i] = d })
  }

  progress(96, '렌더링 준비 중...', '')
  await tick()

  return { grid, dmcMap, width, height }
}

// ── Thread usage calculation ──────────────────────────────────────────────────
export function calcThreadUsage(
  grid: number[][],
  dmcMap: DmcColor[],
): Array<{ dmc: DmcColor; cells: number; skeins: number }> {
  const counts: Record<number, number> = {}
  for (const row of grid) {
    for (const ci of row) {
      counts[ci] = (counts[ci] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([ci, cells]) => ({
      dmc:    dmcMap[Number(ci)],
      cells,
      skeins: Math.ceil(cells / 250),
    }))
}

function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 16))
}
