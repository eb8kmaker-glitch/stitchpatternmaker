import type { ThreadUsage } from '@/types'
import { hexToRgb, rgbToLab, deltaE } from '@/lib/color/lab'
import workPalette from './workPalette.json'

/**
 * Work colors are high-contrast "tags" laid over each DMC thread so that
 * adjacent, visually-similar threads can be told apart while stitching.
 *
 * The palette is a glasbey-style, perceptually maximally-distinct set,
 * pre-generated OFFLINE by scripts/generateWorkPalette.mjs (farthest-point
 * sampling in CIELAB / CIEDE2000) and stored as a static JSON. The runtime
 * never recomputes the sampling — it only slices the first N entries. The
 * palette holds 256 colors, so it auto-extends well past today's 80-color
 * cap without code changes.
 *
 * Readability constraints are baked into the palette itself: no near-white,
 * near-black, or pure-red (grid-line) colors. Symbol glyph color (black vs
 * white) is chosen per-cell from the work color's luma at render time
 * (see src/lib/pdf/exporter.ts), so glyphs stay legible on dark work colors.
 */
export const WORK_COLOR_PALETTE: string[] = workPalette as string[]

const PALETTE_LAB: [number, number, number][] = WORK_COLOR_PALETTE.map((hex) => {
  const [r, g, b] = hexToRgb(hex)
  return rgbToLab(r, g, b)
})

// How many of the nearest (most easily-confused) DMC threads each new thread
// is actively contrasted against when choosing its work color.
const NEIGHBOR_K = 16

/**
 * Assign a work color to every thread.
 *
 * Strategy:
 *  1. Use the first `n` glasbey colors (n = thread count). These are all
 *     mutually distinct with the best achievable minimum ΔE for n colors,
 *     so there are NO duplicate / near-duplicate work colors (for n ≤ 256).
 *  2. Permute those colors across threads so that DMC-similar threads — the
 *     ones a stitcher would confuse — receive the most contrasting work
 *     colors. Plain Lab-sorted assignment would create a gradient where
 *     adjacent DMCs get adjacent work colors; this does the opposite.
 *
 * The permutation is a greedy: process threads, and for each pick the unused
 * palette color that maximizes the minimum work-color ΔE to the work colors
 * already given to this thread's nearest DMC neighbors.
 */
export function assignWorkColors(threads: ThreadUsage[]): string[] {
  const n = threads.length
  if (n === 0) return []

  const palN = WORK_COLOR_PALETTE.length
  const threadLab = threads.map((t) => t.dmc.lab)

  // Candidate pool: first n palette entries (wraps only if n exceeds the
  // 256-color palette, which is far beyond the current 80-color cap).
  const pool = Array.from({ length: n }, (_, i) => i % palN)
  const poolUsed = new Array<boolean>(n).fill(false)

  const assignedPaletteIdx = new Array<number>(n).fill(-1)

  for (let i = 0; i < n; i++) {
    // The DMC threads most likely to be confused with thread i are its
    // nearest Lab neighbors among the already-assigned threads.
    const neighbors: { idx: number; dist: number }[] = []
    for (let j = 0; j < i; j++) {
      neighbors.push({ idx: j, dist: deltaE(threadLab[i], threadLab[j]) })
    }
    neighbors.sort((a, b) => a.dist - b.dist)
    const window = neighbors.slice(0, NEIGHBOR_K)

    // Pick the unused pool color that sits farthest from the work colors of
    // those near neighbors (maximize the minimum separation).
    let bestPool = -1
    let bestScore = -Infinity
    for (let p = 0; p < n; p++) {
      if (poolUsed[p]) continue
      const candLab = PALETTE_LAB[pool[p]]
      let score = Infinity
      for (const nb of window) {
        const d = deltaE(candLab, PALETTE_LAB[assignedPaletteIdx[nb.idx]])
        if (d < score) score = d
      }
      // No neighbors yet (first thread): every candidate ties at Infinity, so
      // the lowest-index pool color is taken — the "nicest" leading color.
      if (score > bestScore) {
        bestScore = score
        bestPool = p
      }
    }

    poolUsed[bestPool] = true
    assignedPaletteIdx[i] = pool[bestPool]
  }

  return assignedPaletteIdx.map((idx) => WORK_COLOR_PALETTE[idx])
}
