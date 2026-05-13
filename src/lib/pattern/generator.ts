import { rgbToLab, deltaE } from '@/lib/color/lab'
import { findClosestDmc, DMC_COLORS } from '@/lib/dmc/database'
import { buildSymbolMap } from '@/lib/pattern/symbols'
import type { DmcColor, PatternResult, SepLevel, QualityMode } from '@/types'

// ── Progress callback ─────────────────────────────────────────────────────────
export type ProgressCallback = (pct: number, label: string, sub?: string) => void

// ── Separation thresholds (ΔE) ────────────────────────────────────────────────
const SEP_THRESHOLD: Record<SepLevel, number> = {
  off:    0,
  weak:   8,
  medium: 15,
  strong: 25,
}

// ── Preprocessing params per quality mode ─────────────────────────────────────
const QUALITY_PARAMS: Record<QualityMode, { sat: number; contrast: number; gamma: number }> = {
  sharp:   { sat: 1.08, contrast: 1.04, gamma: 0.95 },
  smooth:  { sat: 1.08, contrast: 1.04, gamma: 0.95 },
  vibrant: { sat: 1.18, contrast: 1.08, gamma: 0.92 },
}

// ── Image preprocessing ───────────────────────────────────────────────────────
function preprocessPixels(
  data: Uint8ClampedArray,
  satFactor: number,
  contrastFactor: number,
  gamma: number,
): void {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2]

    // Gamma correction — brightens midtones (gamma < 1)
    r = Math.round(Math.pow(r / 255, gamma) * 255)
    g = Math.round(Math.pow(g / 255, gamma) * 255)
    b = Math.round(Math.pow(b / 255, gamma) * 255)

    // Contrast boost
    r = Math.min(255, Math.max(0, Math.round((r - 128) * contrastFactor + 128)))
    g = Math.min(255, Math.max(0, Math.round((g - 128) * contrastFactor + 128)))
    b = Math.min(255, Math.max(0, Math.round((b - 128) * contrastFactor + 128)))

    // Saturation boost via luma-weighted separation
    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    r = Math.min(255, Math.max(0, Math.round(luma + (r - luma) * satFactor)))
    g = Math.min(255, Math.max(0, Math.round(luma + (g - luma) * satFactor)))
    b = Math.min(255, Math.max(0, Math.round(luma + (b - luma) * satFactor)))

    data[i] = r; data[i + 1] = g; data[i + 2] = b
  }
}

// ── K-means++ initialization ──────────────────────────────────────────────────
function initKMeansPlusPlus(
  pixels: [number, number, number][],
  k: number,
): [number, number, number][] {
  // Sample subset for performance on large grids
  const step = pixels.length > 2000 ? Math.floor(pixels.length / 2000) : 1
  const sample = pixels.filter((_, i) => i % step === 0)

  const centers: [number, number, number][] = []
  centers.push(sample[Math.floor(Math.random() * sample.length)])

  for (let c = 1; c < k; c++) {
    const dists = sample.map(p => {
      let minD = Infinity
      for (const center of centers) {
        const d = deltaE(p, center)
        if (d < minD) minD = d
      }
      return minD * minD
    })

    const total = dists.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    let chosen = sample[sample.length - 1]
    for (let i = 0; i < sample.length; i++) {
      r -= dists[i]
      if (r <= 0) { chosen = sample[i]; break }
    }
    centers.push(chosen)
  }

  return centers
}

// ── K-means in LAB space ──────────────────────────────────────────────────────
function kMeansLab(
  pixels: [number, number, number][],
  k: number,
  iterations = 12,
): { centers: [number, number, number][]; assignments: number[] } {
  let centers = initKMeansPlusPlus(pixels, k)
  let assignments = new Array(pixels.length).fill(0)

  for (let iter = 0; iter < iterations; iter++) {
    // Assignment step
    for (let i = 0; i < pixels.length; i++) {
      let best = 0, bestDist = Infinity
      for (let j = 0; j < centers.length; j++) {
        const dist = deltaE(pixels[i], centers[j])
        if (dist < bestDist) { bestDist = dist; best = j }
      }
      assignments[i] = best
    }

    // Update step
    const sums: [number, number, number, number][] = Array.from(
      { length: k }, () => [0, 0, 0, 0],
    )
    for (let i = 0; i < pixels.length; i++) {
      const a = assignments[i]
      sums[a][0] += pixels[i][0]
      sums[a][1] += pixels[i][1]
      sums[a][2] += pixels[i][2]
      sums[a][3]++
    }
    centers = sums.map((s, idx) =>
      s[3] > 0
        ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]]
        : centers[Math.floor(Math.random() * k)],
    ) as [number, number, number][]
  }

  return { centers, assignments }
}

// ── Floyd–Steinberg dithering in LAB space ────────────────────────────────────
function applyFloydSteinberg(
  labPixels: [number, number, number][],
  dmcPalette: DmcColor[],
  width: number,
  height: number,
): number[] {
  // Mutable error-accumulation buffer
  const buf: [number, number, number][] = labPixels.map(p => [p[0], p[1], p[2]])
  const assignments: number[] = new Array(width * height).fill(0)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const pixel = buf[i]

      // Find nearest DMC color from palette
      let bestIdx = 0, bestDist = Infinity
      for (let d = 0; d < dmcPalette.length; d++) {
        const dist = deltaE(pixel, dmcPalette[d].lab)
        if (dist < bestDist) { bestDist = dist; bestIdx = d }
      }
      assignments[i] = bestIdx

      // Quantization error in LAB
      const errL = pixel[0] - dmcPalette[bestIdx].lab[0]
      const errA = pixel[1] - dmcPalette[bestIdx].lab[1]
      const errB = pixel[2] - dmcPalette[bestIdx].lab[2]

      // Distribute error to neighbors (Floyd–Steinberg kernel)
      const spread = (dx: number, dy: number, f: number) => {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = ny * width + nx
          buf[ni][0] += errL * f
          buf[ni][1] += errA * f
          buf[ni][2] += errB * f
        }
      }
      spread( 1, 0, 7 / 16)
      spread(-1, 1, 3 / 16)
      spread( 0, 1, 5 / 16)
      spread( 1, 1, 1 / 16)
    }
  }

  return assignments
}

// ── Similar color separation ──────────────────────────────────────────────────
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
        const ny = y + dy, nx = x + dx
        if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue

        const ni  = grid[ny][nx]
        if (ni === ci) continue

        const nbD = result[ni]
        if (deltaE(myD.lab, nbD.lab) < threshold) {
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

// ── Main generator ────────────────────────────────────────────────────────────
export async function generatePattern(
  imageElement: HTMLImageElement,
  width: number,
  height: number,
  colorCount: number,
  sepLevel: SepLevel,
  qualityMode: QualityMode,
  onProgress?: ProgressCallback,
): Promise<PatternResult> {
  const progress = onProgress ?? (() => {})

  // 1. Resample image to target grid size
  progress(8, '이미지 리샘플링 중...', '원본 비율 유지')
  await tick()

  const canvas = document.createElement('canvas')
  canvas.width  = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(imageElement, 0, 0, width, height)
  const imageData = ctx.getImageData(0, 0, width, height)

  // 2. Preprocess: gamma + contrast + saturation
  progress(18, '이미지 전처리 중...', '채도 / 대비 / 감마 보정')
  await tick()

  const { sat, contrast, gamma } = QUALITY_PARAMS[qualityMode]
  preprocessPixels(imageData.data, sat, contrast, gamma)

  // 3. RGB → LAB
  progress(28, 'LAB 색공간 변환 중...', 'perceptual color analysis')
  await tick()

  const raw = imageData.data
  const labPixels: [number, number, number][] = []
  for (let i = 0; i < raw.length; i += 4) {
    labPixels.push(rgbToLab(raw[i], raw[i + 1], raw[i + 2]))
  }

  // 4. K-means++ clustering in LAB space
  progress(45, '색상 군집화 중...', 'K-means++ in LAB space')
  await tick()

  const k = Math.min(colorCount, labPixels.length, DMC_COLORS.length)
  const { centers, assignments: clusterAssignments } = kMeansLab(labPixels, k, 12)

  // 5. Map cluster centers → unique DMC colors (ΔE nearest)
  progress(65, 'DMC 색상 매핑 중...', 'ΔE 기반 최적 매칭')
  await tick()

  const usedIds = new Set<string>()
  const dmcPalette: DmcColor[] = centers.map(center => {
    let dmc = findClosestDmc(center, Array.from(usedIds))
    if (!dmc) dmc = findClosestDmc(center, [])!
    usedIds.add(dmc.id)
    return dmc
  })

  // 6. Build grid — flat color or Floyd–Steinberg dithering
  const ditheringLabel = qualityMode === 'sharp' ? '플랫 컬러' : 'Floyd–Steinberg 디더링'
  progress(78, '도안 격자 생성 중...', ditheringLabel)
  await tick()

  const assignments = qualityMode === 'sharp'
    ? clusterAssignments
    : applyFloydSteinberg(labPixels, dmcPalette, width, height)

  const grid: number[][] = []
  for (let y = 0; y < height; y++) {
    const row: number[] = []
    for (let x = 0; x < width; x++) {
      row.push(assignments[y * width + x])
    }
    grid.push(row)
  }

  const dmcMap = dmcPalette

  // 7. Similar color separation
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
) {
  const symbolMap = buildSymbolMap(grid)
  const counts: Record<number, number> = {}
  for (const row of grid) {
    for (const ci of row) {
      counts[ci] = (counts[ci] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([ci, cells]) => ({
      dmc:          dmcMap[Number(ci)],
      cells,
      skeins:       Math.ceil(cells / 250),
      symbol:       symbolMap.get(Number(ci)) ?? '?',
      clusterIndex: Number(ci),
    }))
}

function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 16))
}
