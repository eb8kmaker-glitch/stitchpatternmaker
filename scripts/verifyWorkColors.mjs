/**
 * Verification for the work-color palette + assignment.
 *
 * Run with:  node scripts/verifyWorkColors.mjs
 *
 * Checks, for color counts 20 / 40 / 80:
 *   - 0 duplicate / near-duplicate work colors,
 *   - minimum pairwise ΔE2000 across the assigned work colors,
 *   - the closest work-color pair (for the eyeball test at 80),
 *   - that DMC-similar threads (the confusable ones) get well-separated
 *     work colors — using real DMC hexes pulled from the database, ordered
 *     so the most similar threads are adjacent (a worst case for the goal).
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const PALETTE = JSON.parse(
  readFileSync(join(ROOT, 'src', 'lib', 'pattern', 'workPalette.json'), 'utf8'),
)

// ── Color science (mirrors src/lib/color/lab.ts) ──────────────────────────────
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}
function linearize(c) {
  const n = c / 255
  return n > 0.04045 ? Math.pow((n + 0.055) / 1.055, 2.4) : n / 12.92
}
function rgbToLab(r, g, b) {
  const R = linearize(r), G = linearize(g), B = linearize(b)
  const X = R * 0.4124 + G * 0.3576 + B * 0.1805
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722
  const Z = R * 0.0193 + G * 0.1192 + B * 0.9505
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(X / 0.95047), fy = f(Y / 1.0), fz = f(Z / 1.08883)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}
function deltaE76(a, b) {
  const dL = a[0] - b[0], da = a[1] - b[1], db = a[2] - b[2]
  return Math.sqrt(dL * dL + da * da + db * db)
}
const DEG2RAD = Math.PI / 180, RAD2DEG = 180 / Math.PI
function _sind(d) { return Math.sin(d * DEG2RAD) }
function _cosd(d) { return Math.cos(d * DEG2RAD) }
function _atan2deg(y, x) { const a = Math.atan2(y, x) * RAD2DEG; return a < 0 ? a + 360 : a }
function deltaE2000(lab1, lab2) {
  const [L1, a1, b1] = lab1, [L2, a2, b2] = lab2
  const C1ab = Math.sqrt(a1 * a1 + b1 * b1), C2ab = Math.sqrt(a2 * a2 + b2 * b2)
  const Cab_avg = (C1ab + C2ab) / 2, Cab_pow7 = Math.pow(Cab_avg, 7)
  const G = 0.5 * (1 - Math.sqrt(Cab_pow7 / (Cab_pow7 + 6103515625)))
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G)
  const C1p = Math.sqrt(a1p * a1p + b1 * b1), C2p = Math.sqrt(a2p * a2p + b2 * b2)
  const h1p = C1p === 0 ? 0 : _atan2deg(b1, a1p), h2p = C2p === 0 ? 0 : _atan2deg(b2, a2p)
  const dLp = L2 - L1, dCp = C2p - C1p
  let dhp
  if (C1p === 0 || C2p === 0) dhp = 0
  else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p
  else if (h2p - h1p > 180) dhp = h2p - h1p - 360
  else dhp = h2p - h1p + 360
  const dHp = 2 * Math.sqrt(C1p * C2p) * _sind(dhp / 2)
  const Lp_avg = (L1 + L2) / 2, Cp_avg = (C1p + C2p) / 2
  let Hp_avg
  if (C1p === 0 || C2p === 0) Hp_avg = h1p + h2p
  else if (Math.abs(h1p - h2p) <= 180) Hp_avg = (h1p + h2p) / 2
  else if (h1p + h2p < 360) Hp_avg = (h1p + h2p + 360) / 2
  else Hp_avg = (h1p + h2p - 360) / 2
  const T = 1 - 0.17 * _cosd(Hp_avg - 30) + 0.24 * _cosd(2 * Hp_avg)
    + 0.32 * _cosd(3 * Hp_avg + 6) - 0.20 * _cosd(4 * Hp_avg - 63)
  const SL = 1 + (0.015 * Math.pow(Lp_avg - 50, 2)) / Math.sqrt(20 + Math.pow(Lp_avg - 50, 2))
  const SC = 1 + 0.045 * Cp_avg, SH = 1 + 0.015 * Cp_avg * T
  const Cp_avg7 = Math.pow(Cp_avg, 7)
  const RC = 2 * Math.sqrt(Cp_avg7 / (Cp_avg7 + 6103515625))
  const d_theta = 30 * Math.exp(-Math.pow((Hp_avg - 275) / 25, 2))
  const RT = -Math.sin(2 * d_theta * DEG2RAD) * RC
  const t1 = dLp / SL, t2 = dCp / SC, t3 = dHp / SH
  return Math.sqrt(t1 * t1 + t2 * t2 + t3 * t3 + RT * t2 * t3)
}

const PALETTE_LAB = PALETTE.map((hex) => rgbToLab(...hexToRgb(hex)))

// ── Assignment, ported 1:1 from src/lib/pattern/workColors.ts ─────────────────
const NEIGHBOR_K = 16
function assignWorkColors(threadLab) {
  const n = threadLab.length
  if (n === 0) return []
  const palN = PALETTE.length
  const pool = Array.from({ length: n }, (_, i) => i % palN)
  const poolUsed = new Array(n).fill(false)
  const assignedPaletteIdx = new Array(n).fill(-1)
  for (let i = 0; i < n; i++) {
    const neighbors = []
    for (let j = 0; j < i; j++) neighbors.push({ idx: j, dist: deltaE76(threadLab[i], threadLab[j]) })
    neighbors.sort((a, b) => a.dist - b.dist)
    const window = neighbors.slice(0, NEIGHBOR_K)
    let bestPool = -1, bestScore = -Infinity
    for (let p = 0; p < n; p++) {
      if (poolUsed[p]) continue
      const candLab = PALETTE_LAB[pool[p]]
      let score = Infinity
      for (const nb of window) {
        const d = deltaE76(candLab, PALETTE_LAB[assignedPaletteIdx[nb.idx]])
        if (d < score) score = d
      }
      if (score > bestScore) { bestScore = score; bestPool = p }
    }
    poolUsed[bestPool] = true
    assignedPaletteIdx[i] = pool[bestPool]
  }
  return assignedPaletteIdx.map((idx) => PALETTE[idx])
}

// ── Pull real DMC hexes from the database ─────────────────────────────────────
const dbText = readFileSync(join(ROOT, 'src', 'lib', 'dmc', 'database.ts'), 'utf8')
const dmcHexes = [...dbText.matchAll(/'(#[0-9A-Fa-f]{6})'/g)].map((m) => m[1])

// Build an N-color "pattern": take N DMC colors and ORDER them so the most
// similar threads are adjacent (nearest-neighbor chain). This is the hardest
// case for the goal — confusable threads sit right next to each other.
function buildThreads(n) {
  const labs = dmcHexes.slice(0, Math.min(n * 3, dmcHexes.length)).map((h) => rgbToLab(...hexToRgb(h)))
  // greedily chain nearest neighbors to cluster similar colors together
  const used = new Array(labs.length).fill(false)
  const order = [0]; used[0] = true
  while (order.length < Math.min(n, labs.length)) {
    const last = labs[order[order.length - 1]]
    let best = -1, bestD = Infinity
    for (let k = 0; k < labs.length; k++) {
      if (used[k]) continue
      const d = deltaE76(last, labs[k])
      if (d < bestD) { bestD = d; best = k }
    }
    used[best] = true; order.push(best)
  }
  return order.map((k) => labs[k])
}

function report(n) {
  const threadLab = buildThreads(n)
  const work = assignWorkColors(threadLab)
  const lab = work.map((h) => rgbToLab(...hexToRgb(h)))

  // duplicates
  const dup = work.length - new Set(work).size

  // global min ΔE among assigned work colors + closest pair
  let minDE = Infinity, ci = -1, cj = -1
  for (let i = 0; i < lab.length; i++) {
    for (let j = i + 1; j < lab.length; j++) {
      const d = deltaE2000(lab[i], lab[j])
      if (d < minDE) { minDE = d; ci = i; cj = j }
    }
  }

  // worst neighbor: smallest work-color ΔE among the DMC-adjacent pairs
  let minNeighborWorkDE = Infinity
  for (let i = 1; i < threadLab.length; i++) {
    const d = deltaE2000(lab[i], lab[i - 1])
    if (d < minNeighborWorkDE) minNeighborWorkDE = d
  }

  console.log(`\n=== ${n} colors ===`)
  console.log(`  duplicate work colors      : ${dup}`)
  console.log(`  min ΔE2000 (all pairs)     : ${minDE.toFixed(2)}  (${work[ci]} vs ${work[cj]})`)
  console.log(`  min ΔE2000 (DMC-adj pairs) : ${minNeighborWorkDE.toFixed(2)}  ← confusable threads stay far apart`)
}

console.log(`palette size: ${PALETTE.length}, DMC hexes available: ${dmcHexes.length}`)
;[20, 40, 80].forEach(report)
