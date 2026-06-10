/**
 * Offline work-color palette generator (glasbey-style).
 *
 * Produces a categorical, maximally-distinct palette of N colors using
 * farthest-point sampling (FPS) in CIELAB with the CIEDE2000 metric.
 *
 * This runs OFFLINE (build/author time) only. The runtime never recomputes
 * the sampling — it just imports the emitted JSON and slices the first N
 * entries (see src/lib/pattern/workColors.ts).
 *
 * Run with:  node scripts/generateWorkPalette.mjs
 * Output:    src/lib/pattern/workPalette.json   (array of 256 hex strings)
 *
 * Readability constraints baked into the sampling (work pages are
 * white background + black/white symbols + red grid lines):
 *   - white and black are repulsors  → no near-white (symbol invisible)
 *     or near-black (indistinct, clashes with black symbols) colors.
 *   - the red grid-line color is a repulsor + a hard exclusion ball
 *     → no pure-red work colors that blend into the grid.
 * Per-color symbol contrast (black vs white glyph) is chosen at render
 * time from each work color's luma, so dark work colors stay legible.
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '..', 'src', 'lib', 'pattern', 'workPalette.json')

const PALETTE_SIZE = 256

// ── Color science (self-contained; mirrors src/lib/color/lab.ts) ──────────────
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

const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI
function _sind(d) { return Math.sin(d * DEG2RAD) }
function _cosd(d) { return Math.cos(d * DEG2RAD) }
function _atan2deg(y, x) { const a = Math.atan2(y, x) * RAD2DEG; return a < 0 ? a + 360 : a }

function deltaE2000(lab1, lab2) {
  const [L1, a1, b1] = lab1
  const [L2, a2, b2] = lab2
  const C1ab = Math.sqrt(a1 * a1 + b1 * b1)
  const C2ab = Math.sqrt(a2 * a2 + b2 * b2)
  const Cab_avg = (C1ab + C2ab) / 2
  const Cab_pow7 = Math.pow(Cab_avg, 7)
  const G = 0.5 * (1 - Math.sqrt(Cab_pow7 / (Cab_pow7 + 6103515625)))
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G)
  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)
  const h1p = C1p === 0 ? 0 : _atan2deg(b1, a1p)
  const h2p = C2p === 0 ? 0 : _atan2deg(b2, a2p)
  const dLp = L2 - L1
  const dCp = C2p - C1p
  let dhp
  if (C1p === 0 || C2p === 0) dhp = 0
  else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p
  else if (h2p - h1p > 180) dhp = h2p - h1p - 360
  else dhp = h2p - h1p + 360
  const dHp = 2 * Math.sqrt(C1p * C2p) * _sind(dhp / 2)
  const Lp_avg = (L1 + L2) / 2
  const Cp_avg = (C1p + C2p) / 2
  let Hp_avg
  if (C1p === 0 || C2p === 0) Hp_avg = h1p + h2p
  else if (Math.abs(h1p - h2p) <= 180) Hp_avg = (h1p + h2p) / 2
  else if (h1p + h2p < 360) Hp_avg = (h1p + h2p + 360) / 2
  else Hp_avg = (h1p + h2p - 360) / 2
  const T = 1 - 0.17 * _cosd(Hp_avg - 30) + 0.24 * _cosd(2 * Hp_avg)
    + 0.32 * _cosd(3 * Hp_avg + 6) - 0.20 * _cosd(4 * Hp_avg - 63)
  const SL = 1 + (0.015 * Math.pow(Lp_avg - 50, 2)) / Math.sqrt(20 + Math.pow(Lp_avg - 50, 2))
  const SC = 1 + 0.045 * Cp_avg
  const SH = 1 + 0.015 * Cp_avg * T
  const Cp_avg7 = Math.pow(Cp_avg, 7)
  const RC = 2 * Math.sqrt(Cp_avg7 / (Cp_avg7 + 6103515625))
  const d_theta = 30 * Math.exp(-Math.pow((Hp_avg - 275) / 25, 2))
  const RT = -Math.sin(2 * d_theta * DEG2RAD) * RC
  const t1 = dLp / SL, t2 = dCp / SC, t3 = dHp / SH
  return Math.sqrt(t1 * t1 + t2 * t2 + t3 * t3 + RT * t2 * t3)
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0').toUpperCase()).join('')
}

// ── Candidate pool: sRGB cube sampled on an 18³ grid, then filtered ───────────
const STEP_LEVELS = 18
const levels = Array.from({ length: STEP_LEVELS }, (_, i) =>
  Math.round((i / (STEP_LEVELS - 1)) * 255),
)

// Repulsors: colors the palette must stay away from (never emitted).
const WHITE_LAB = rgbToLab(255, 255, 255)
const BLACK_LAB = rgbToLab(0, 0, 0)
const RED_LINE_LAB = rgbToLab(220, 0, 0) // work-page grid line color
const REPULSORS = [WHITE_LAB, BLACK_LAB, RED_LINE_LAB]

// Hard exclusion: drop anything that would read as the red grid line.
const RED_EXCLUDE_DE = 18
// Soft lightness window: drop extremes (too pale / too dark to tell apart).
const L_MIN = 20
const L_MAX = 90

const candidates = []
for (const r of levels) {
  for (const g of levels) {
    for (const b of levels) {
      const lab = rgbToLab(r, g, b)
      if (lab[0] < L_MIN || lab[0] > L_MAX) continue
      if (deltaE2000(lab, RED_LINE_LAB) < RED_EXCLUDE_DE) continue
      candidates.push({ r, g, b, lab })
    }
  }
}

// ── Farthest-point sampling (glasbey) ─────────────────────────────────────────
// minDist[c] = current distance from candidate c to the nearest already-chosen
// color OR repulsor. Each round we pick the candidate that maximizes minDist,
// then relax all candidates against the newly chosen color. O(N · |pool|).
const minDist = candidates.map((c) =>
  Math.min(...REPULSORS.map((ref) => deltaE2000(c.lab, ref))),
)

const chosen = []
const N = Math.min(PALETTE_SIZE, candidates.length)
for (let k = 0; k < N; k++) {
  let bestIdx = -1
  let bestVal = -Infinity
  for (let i = 0; i < candidates.length; i++) {
    if (minDist[i] > bestVal) {
      bestVal = minDist[i]
      bestIdx = i
    }
  }
  const pick = candidates[bestIdx]
  chosen.push(pick)
  minDist[bestIdx] = -Infinity // never pick again
  // Relax against the newly chosen color.
  for (let i = 0; i < candidates.length; i++) {
    if (minDist[i] === -Infinity) continue
    const d = deltaE2000(candidates[i].lab, pick.lab)
    if (d < minDist[i]) minDist[i] = d
  }
}

const hexes = chosen.map((c) => toHex(c.r, c.g, c.b))

// ── Report the separation we achieved (sanity check) ──────────────────────────
function minPairwise(labs) {
  let m = Infinity
  for (let i = 0; i < labs.length; i++) {
    for (let j = i + 1; j < labs.length; j++) {
      const d = deltaE2000(labs[i], labs[j])
      if (d < m) m = d
    }
  }
  return m
}
for (const n of [20, 40, 80, PALETTE_SIZE]) {
  const labs = chosen.slice(0, n).map((c) => c.lab)
  console.log(`first ${n}: min ΔE2000 = ${minPairwise(labs).toFixed(2)}`)
}

writeFileSync(OUT_PATH, JSON.stringify(hexes, null, 0) + '\n')
console.log(`\nWrote ${hexes.length} colors → ${OUT_PATH}`)
