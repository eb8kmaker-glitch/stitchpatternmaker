import { rgbToLab, deltaE } from '@/lib/color/lab'
import { findClosestDmc, DMC_COLORS } from '@/lib/dmc/database'
import { buildSymbolMap } from '@/lib/pattern/symbols'
import type { DmcColor, PatternResult, SepLevel, QualityMode, AspectMode, DitheringMode } from '@/types'

// ── Progress callback ─────────────────────────────────────────────────────────
export type ProgressCallback = (pct: number, label: string, sub?: string) => void

export interface ProgressMessages {
  resampling: string; adjusting: string; preprocessing: string
  sharpening: string; convertingLab: string; clustering: string
  mappingDmc: string; buildingGrid: string; cleaningConfetti: string
  separatingColors: string; preparingRender: string
  aspectFit: string; aspectCrop: string; aspectStretch: string
  ditherFlat: string; ditherFloyd: string; ditherAtkinson: string
  ditherOrdered: string; confettiCleanup: string; sepProcessing: string
}

// ── Separation thresholds (ΔE) ────────────────────────────────────────────────
const SEP_THRESHOLD: Record<SepLevel, number> = {
  off:    0,
  weak:   8,
  medium: 15,
  strong: 25,
}

// ── Preprocessing params per quality mode ─────────────────────────────────────
const QUALITY_PARAMS: Record<QualityMode, {
  sat: number; contrast: number; gamma: number; sharpen: boolean; kIter: number
}> = {
  fast:     { sat: 1.0,  contrast: 1.0,  gamma: 1.0,  sharpen: false, kIter: 8  },
  balanced: { sat: 1.08, contrast: 1.04, gamma: 0.95, sharpen: false, kIter: 12 },
  hq:       { sat: 1.12, contrast: 1.06, gamma: 0.93, sharpen: true,  kIter: 20 },
}

// ── Multi-step high-quality downscale ─────────────────────────────────────────
function stepDownResize(
  src: CanvasImageSource,
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
): HTMLCanvasElement {
  let cur = document.createElement('canvas')
  cur.width  = srcW
  cur.height = srcH
  cur.getContext('2d')!.drawImage(src, 0, 0)

  let w = srcW, h = srcH

  while (w > targetW * 1.5 || h > targetH * 1.5) {
    const nw = Math.max(Math.round(w / 2), targetW)
    const nh = Math.max(Math.round(h / 2), targetH)
    const next = document.createElement('canvas')
    next.width  = nw
    next.height = nh
    const ctx = next.getContext('2d')!
    ctx.imageSmoothingEnabled  = true
    ctx.imageSmoothingQuality  = 'high'
    ctx.drawImage(cur, 0, 0, nw, nh)
    cur = next; w = nw; h = nh
  }

  return cur
}

// ── Aspect-ratio-aware resampling ─────────────────────────────────────────────
function resampleImage(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  aspectMode: AspectMode,
  highQuality: boolean,
): HTMLCanvasElement {
  const imgW = img.naturalWidth
  const imgH = img.naturalHeight

  const out = document.createElement('canvas')
  out.width  = targetW
  out.height = targetH
  const ctx = out.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // White background (visible only in fit-mode padding)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetW, targetH)

  if (aspectMode === 'stretch') {
    const src = highQuality ? stepDownResize(img, imgW, imgH, targetW, targetH) : img
    ctx.drawImage(src, 0, 0, targetW, targetH)

  } else if (aspectMode === 'fit') {
    const scale = Math.min(targetW / imgW, targetH / imgH)
    const fitW  = Math.round(imgW * scale)
    const fitH  = Math.round(imgH * scale)
    const offX  = Math.round((targetW - fitW) / 2)
    const offY  = Math.round((targetH - fitH) / 2)
    const src   = highQuality ? stepDownResize(img, imgW, imgH, fitW, fitH) : img
    ctx.drawImage(src, offX, offY, fitW, fitH)

  } else {
    // crop — scale to cover, crop center
    const scale = Math.max(targetW / imgW, targetH / imgH)
    const srcW  = targetW / scale
    const srcH  = targetH / scale
    const srcX  = (imgW - srcW) / 2
    const srcY  = (imgH - srcH) / 2

    if (highQuality) {
      const cW = Math.round(srcW), cH = Math.round(srcH)
      const crop = document.createElement('canvas')
      crop.width = cW; crop.height = cH
      crop.getContext('2d')!.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, cW, cH)
      const src2 = stepDownResize(crop, cW, cH, targetW, targetH)
      ctx.drawImage(src2, 0, 0, targetW, targetH)
    } else {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH)
    }
  }

  return out
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

    // Gamma correction
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

// ── Unsharp mask (3×3 kernel) ─────────────────────────────────────────────────
function applySharpen(data: Uint8ClampedArray, width: number, height: number): void {
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]
  const copy = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ki = (ky + 1) * 3 + (kx + 1)
            const pi = ((y + ky) * width + (x + kx)) * 4 + c
            sum += copy[pi] * kernel[ki]
          }
        }
        data[(y * width + x) * 4 + c] = Math.min(255, Math.max(0, sum))
      }
    }
  }
}

// ── K-means++ initialization ──────────────────────────────────────────────────
function initKMeansPlusPlus(
  pixels: [number, number, number][],
  k: number,
): [number, number, number][] {
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
async function kMeansLab(
  pixels: [number, number, number][],
  k: number,
  iterations: number,
  onIter?: (iter: number) => void,
): Promise<{ centers: [number, number, number][]; assignments: number[] }> {
  let centers = initKMeansPlusPlus(pixels, k)
  let assignments = new Array(pixels.length).fill(0)

  for (let iter = 0; iter < iterations; iter++) {
    await tick()
    onIter?.(iter)
    for (let i = 0; i < pixels.length; i++) {
      let best = 0, bestDist = Infinity
      for (let j = 0; j < centers.length; j++) {
        const dist = deltaE(pixels[i], centers[j])
        if (dist < bestDist) { bestDist = dist; best = j }
      }
      assignments[i] = best
    }

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
  const buf: [number, number, number][] = labPixels.map(p => [p[0], p[1], p[2]])
  const out: number[] = new Array(width * height).fill(0)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const pixel = buf[i]

      let bestIdx = 0, bestDist = Infinity
      for (let d = 0; d < dmcPalette.length; d++) {
        const dist = deltaE(pixel, dmcPalette[d].lab)
        if (dist < bestDist) { bestDist = dist; bestIdx = d }
      }
      out[i] = bestIdx

      const errL = pixel[0] - dmcPalette[bestIdx].lab[0]
      const errA = pixel[1] - dmcPalette[bestIdx].lab[1]
      const errB = pixel[2] - dmcPalette[bestIdx].lab[2]

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

  return out
}

// ── Atkinson dithering in LAB space ──────────────────────────────────────────
function applyAtkinson(
  labPixels: [number, number, number][],
  dmcPalette: DmcColor[],
  width: number,
  height: number,
): number[] {
  const buf: [number, number, number][] = labPixels.map(p => [p[0], p[1], p[2]])
  const out: number[] = new Array(width * height).fill(0)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const pixel = buf[i]

      let bestIdx = 0, bestDist = Infinity
      for (let d = 0; d < dmcPalette.length; d++) {
        const dist = deltaE(pixel, dmcPalette[d].lab)
        if (dist < bestDist) { bestDist = dist; bestIdx = d }
      }
      out[i] = bestIdx

      // Atkinson: distribute 1/8 of error to 6 neighbors
      const errL = (pixel[0] - dmcPalette[bestIdx].lab[0]) / 8
      const errA = (pixel[1] - dmcPalette[bestIdx].lab[1]) / 8
      const errB = (pixel[2] - dmcPalette[bestIdx].lab[2]) / 8

      const spread = (dx: number, dy: number) => {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = ny * width + nx
          buf[ni][0] += errL
          buf[ni][1] += errA
          buf[ni][2] += errB
        }
      }
      spread( 1, 0); spread( 2, 0)
      spread(-1, 1); spread( 0, 1); spread( 1, 1)
      spread( 0, 2)
    }
  }

  return out
}

// ── Ordered (Bayer 4×4) dithering in LAB space ───────────────────────────────
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

function applyOrdered(
  labPixels: [number, number, number][],
  dmcPalette: DmcColor[],
  width: number,
  height: number,
): number[] {
  const out: number[] = new Array(width * height).fill(0)
  const strength = 6 // LAB units

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const t = (BAYER_4[(y % 4) * 4 + (x % 4)] / 16 - 0.5) * strength
      const pixel: [number, number, number] = [
        labPixels[i][0] + t,
        labPixels[i][1] + t * 0.5,
        labPixels[i][2] + t * 0.5,
      ]

      let bestIdx = 0, bestDist = Infinity
      for (let d = 0; d < dmcPalette.length; d++) {
        const dist = deltaE(pixel, dmcPalette[d].lab)
        if (dist < bestDist) { bestDist = dist; bestIdx = d }
      }
      out[i] = bestIdx
    }
  }

  return out
}

// ── Confetti cleanup — merge isolated single-pixel colors ─────────────────────
function cleanupConfetti(
  grid: number[][],
  width: number,
  height: number,
): number[][] {
  const out = grid.map(row => [...row])

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ci = grid[y][x]
      const neighbors: number[] = []

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue
          const ny = y + dy, nx = x + dx
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            neighbors.push(grid[ny][nx])
          }
        }
      }

      // Isolated pixel — no matching neighbor
      if (neighbors.length > 0 && !neighbors.some(n => n === ci)) {
        const freq: Record<number, number> = {}
        for (const n of neighbors) freq[n] = (freq[n] ?? 0) + 1
        const best = Object.entries(freq).sort(([, a], [, b]) => b - a)[0]
        out[y][x] = Number(best[0])
      }
    }
  }

  return out
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

// ── Brightness / Contrast adjustment ─────────────────────────────────────────
function applyBrightnessContrast(data: Uint8ClampedArray, brightness: number, contrast: number): void {
  if (brightness === 0 && contrast === 0) return
  const b = (brightness / 100) * 255
  const c = contrast
  const factor = (259 * (c + 255)) / (255 * (259 - c))
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)))
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = clamp(factor * (data[i]     + b - 128) + 128)
    data[i + 1] = clamp(factor * (data[i + 1] + b - 128) + 128)
    data[i + 2] = clamp(factor * (data[i + 2] + b - 128) + 128)
  }
}

// ── Main generator ────────────────────────────────────────────────────────────
const DEFAULT_MESSAGES: ProgressMessages = {
  resampling: 'Resampling image...',
  adjusting: 'Adjusting brightness & contrast...',
  preprocessing: 'Preprocessing...',
  sharpening: 'Sharpening...',
  convertingLab: 'Converting to LAB...',
  clustering: 'Clustering colors...',
  mappingDmc: 'Mapping DMC colors...',
  buildingGrid: 'Building stitch grid...',
  cleaningConfetti: 'Cleaning up confetti...',
  separatingColors: 'Separating similar colors...',
  preparingRender: 'Preparing render...',
  aspectFit: 'Fit mode...',
  aspectCrop: 'Crop mode...',
  aspectStretch: 'Stretch mode...',
  ditherFlat: 'Flat color...',
  ditherFloyd: 'Floyd-Steinberg dithering...',
  ditherAtkinson: 'Atkinson dithering...',
  ditherOrdered: 'Bayer matrix dithering...',
  confettiCleanup: 'Confetti cleanup...',
  sepProcessing: 'Similar color separation...',
}

// ── Lab-space colour adjustments (saturation / temperature / tint) ────────────
// Applied in-place after RGB→Lab conversion, before K-means.
// Values are in [-100, +100]; 0 = no effect.
function applyLabAdjustments(
  labPixels: [number, number, number][],
  saturation: number,
  temperature: number,
  tint: number,
): void {
  const sFactor = Math.max(0, 1 + saturation / 100)  // chroma scale: 0–2
  const bOffset = temperature * 0.20                  // b* offset ±20 Lab units
  const aOffset = tint        * 0.20                  // a* offset ±20 Lab units
  for (let i = 0; i < labPixels.length; i++) {
    let [L, a, b] = labPixels[i]
    if (saturation  !== 0) { a *= sFactor; b *= sFactor }
    if (temperature !== 0) b += bOffset
    if (tint        !== 0) a += aOffset
    labPixels[i][0] = L
    labPixels[i][1] = a
    labPixels[i][2] = b
  }
}

// Gray-world auto-adjust: samples a 60x60 thumbnail and returns sat/temp/tint
// values that neutralise the average Lab a/b colour cast.
export function computeAutoAdjust(img: HTMLImageElement): { saturation: number; temperature: number; tint: number } {
  const SZ = 60
  const canvas = document.createElement('canvas')
  canvas.width = SZ; canvas.height = SZ
  const ctx = canvas.getContext('2d')
  if (!ctx) return { saturation: 0, temperature: 0, tint: 0 }
  ctx.drawImage(img, 0, 0, SZ, SZ)
  const { data } = ctx.getImageData(0, 0, SZ, SZ)
  let sumA = 0, sumB = 0, count = 0
  for (let i = 0; i < data.length; i += 4) {
    const [, a, b] = rgbToLab(data[i], data[i + 1], data[i + 2])
    sumA += a; sumB += b; count++
  }
  const avgA = sumA / count
  const avgB = sumB / count
  return {
    saturation:  0,
    tint:        Math.max(-100, Math.min(100, -avgA / 0.20)),
    temperature: Math.max(-100, Math.min(100, -avgB / 0.20)),
  }
}

export async function generatePattern(
  imageElement: HTMLImageElement,
  width: number,
  height: number,
  colorCount: number,
  sepLevel: SepLevel,
  qualityMode: QualityMode,
  aspectMode: AspectMode,
  ditheringMode: DitheringMode,
  onProgress?: ProgressCallback,
  brightness = 0,
  contrast = 0,
  messages?: ProgressMessages,
  saturation = 0,
  temperature = 0,
  tint = 0,
): Promise<PatternResult> {
  const progress = onProgress ?? (() => {})
  const msg = messages ?? DEFAULT_MESSAGES
  const { sat, contrast: contrastBoost, gamma, sharpen, kIter } = QUALITY_PARAMS[qualityMode]
  const isHQ = qualityMode === 'hq'

  // 1. Resample with aspect ratio control
  const aspectLabel = { fit: msg.aspectFit, crop: msg.aspectCrop, stretch: msg.aspectStretch }
  progress(8, msg.resampling, aspectLabel[aspectMode])
  await tick()

  const resampled = resampleImage(imageElement, width, height, aspectMode, isHQ)
  const imageData = resampled.getContext('2d')!.getImageData(0, 0, width, height)

  // 2. Apply user brightness/contrast adjustment
  if (brightness !== 0 || contrast !== 0) {
    progress(14, msg.adjusting, '')
    await tick()
    applyBrightnessContrast(imageData.data, brightness, contrast)
  }

  // 3. Preprocess: gamma + contrast + saturation
  progress(18, msg.preprocessing, '')
  await tick()
  preprocessPixels(imageData.data, sat, contrastBoost, gamma)

  // 3. Unsharp mask (HQ only)
  if (sharpen) {
    progress(24, msg.sharpening, '')
    await tick()
    applySharpen(imageData.data, width, height)
  }

  // 4. RGB → LAB
  progress(28, msg.convertingLab, '')
  await tick()

  const raw = imageData.data
  const labPixels: [number, number, number][] = []
  for (let i = 0; i < raw.length; i += 4) {
    labPixels.push(rgbToLab(raw[i], raw[i + 1], raw[i + 2]))
  }

  // 4.5 Lab-space colour adjustments (saturation / temperature / tint)
  if (saturation !== 0 || temperature !== 0 || tint !== 0) {
    applyLabAdjustments(labPixels, saturation, temperature, tint)
  }

  // 5. K-means++ clustering in LAB space
  progress(45, msg.clustering, `K-means++ (${kIter} iterations)`)
  await tick()

  const k = Math.min(colorCount, labPixels.length, DMC_COLORS.length)
  const { centers, assignments: clusterAssignments } = await kMeansLab(
    labPixels, k, kIter,
    (iter) => progress(45 + Math.round((iter / kIter) * 18), msg.clustering, `K-means++ (${iter + 1}/${kIter})`)
  )

  // 6. Map cluster centers → unique DMC colors (ΔE nearest)
  progress(65, msg.mappingDmc, '')
  await tick()

  const usedIds = new Set<string>()
  const dmcPalette: DmcColor[] = centers.map(center => {
    let dmc = findClosestDmc(center, Array.from(usedIds))
    if (!dmc) dmc = findClosestDmc(center, [])!
    usedIds.add(dmc.id)
    return dmc
  })

  // 7. Apply selected dithering algorithm
  const ditheringLabel: Record<DitheringMode, string> = {
    none:     msg.ditherFlat,
    floyd:    msg.ditherFloyd,
    atkinson: msg.ditherAtkinson,
    ordered:  msg.ditherOrdered,
  }
  progress(78, msg.buildingGrid, ditheringLabel[ditheringMode])
  await tick()

  let assignments: number[]
  if (ditheringMode === 'floyd') {
    assignments = applyFloydSteinberg(labPixels, dmcPalette, width, height)
  } else if (ditheringMode === 'atkinson') {
    assignments = applyAtkinson(labPixels, dmcPalette, width, height)
  } else if (ditheringMode === 'ordered') {
    assignments = applyOrdered(labPixels, dmcPalette, width, height)
  } else {
    assignments = clusterAssignments
  }

  let grid: number[][] = []
  for (let y = 0; y < height; y++) {
    const row: number[] = []
    for (let x = 0; x < width; x++) row.push(assignments[y * width + x])
    grid.push(row)
  }

  // 8. Confetti cleanup (HQ mode or any dithering active)
  if (isHQ || ditheringMode !== 'none') {
    progress(85, msg.confettiCleanup, '')
    await tick()
    grid = cleanupConfetti(grid, width, height)
  }

  const dmcMap = dmcPalette

  // 9. Similar color separation
  const threshold = SEP_THRESHOLD[sepLevel]
  if (threshold > 0) {
    progress(92, msg.sepProcessing, `ΔE < ${threshold}`)
    await tick()
    const separated = separateSimilarColors(grid, dmcMap, threshold, width, height)
    separated.forEach((d, i) => { dmcMap[i] = d })
  }

  progress(96, msg.preparingRender, '')
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
