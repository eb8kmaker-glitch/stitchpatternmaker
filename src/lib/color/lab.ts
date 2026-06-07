/**
 * Color science utilities
 * LAB color space + CIE76 ΔE (Delta E) for perceptual color distance
 * + CIEDE2000 (ΔE00) for high-accuracy DMC color matching
 */

export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.round(v).toString(16).padStart(2, '0'))
    .join('')
}

/** sRGB → linear RGB (inverse gamma — must not be skipped, critical for dark colors) */
function linearize(c: number): number {
  const n = c / 255
  return n > 0.04045 ? Math.pow((n + 0.055) / 1.055, 2.4) : n / 12.92
}

/** Linear RGB → CIE XYZ (D65 illuminant) */
function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const R = linearize(r)
  const G = linearize(g)
  const B = linearize(b)
  return [
    R * 0.4124 + G * 0.3576 + B * 0.1805,
    R * 0.2126 + G * 0.7152 + B * 0.0722,
    R * 0.0193 + G * 0.1192 + B * 0.9505,
  ]
}

/** CIE XYZ → CIELAB */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const [X, Y, Z] = rgbToXyz(r, g, b)
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116

  const fx = f(X / 0.95047)
  const fy = f(Y / 1.00000)
  const fz = f(Z / 1.08883)

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/** CIE76 ΔE — fast perceptual distance, used for k-means and dithering inner loops */
export function deltaE(
  lab1: [number, number, number],
  lab2: [number, number, number],
): number {
  const dL = lab1[0] - lab2[0]
  const da = lab1[1] - lab2[1]
  const db = lab1[2] - lab2[2]
  return Math.sqrt(dL * dL + da * da + db * db)
}

/**
 * CIEDE2000 (ΔE00) — high-accuracy perceptual color distance.
 * Sharma et al. (2005), "The CIEDE2000 Color-Difference Formula."
 *
 * Key improvements over CIE76:
 *  - Lightness weighting (SL) corrects underestimation near white
 *  - Chroma weighting (SC) scales with saturation
 *  - Hue weighting (SH) is chroma-dependent
 *  - Rotation term (RT) handles the blue region artifact
 *
 * Used only for final DMC palette selection (not dithering inner loops).
 */
export function deltaE2000(
  lab1: [number, number, number],
  lab2: [number, number, number],
): number {
  const [L1, a1, b1] = lab1
  const [L2, a2, b2] = lab2

  // Step 1: C*ab and a' adjustment
  const C1ab = Math.sqrt(a1 * a1 + b1 * b1)
  const C2ab = Math.sqrt(a2 * a2 + b2 * b2)
  const Cab_avg = (C1ab + C2ab) / 2
  const Cab_pow7 = Math.pow(Cab_avg, 7)
  const G = 0.5 * (1 - Math.sqrt(Cab_pow7 / (Cab_pow7 + 6103515625))) // 25^7 = 6103515625
  const a1p = a1 * (1 + G)
  const a2p = a2 * (1 + G)

  // Step 2: C', h'
  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)

  const h1p = (C1p === 0) ? 0 : _atan2deg(b1, a1p)
  const h2p = (C2p === 0) ? 0 : _atan2deg(b2, a2p)

  // Step 3: ΔL', ΔC', ΔH'
  const dLp = L2 - L1
  const dCp = C2p - C1p

  let dhp: number
  if (C1p === 0 || C2p === 0) {
    dhp = 0
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360
  } else {
    dhp = h2p - h1p + 360
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * _sind(dhp / 2)

  // Step 4: CIEDE2000 weighting functions
  const Lp_avg = (L1 + L2) / 2
  const Cp_avg = (C1p + C2p) / 2

  let Hp_avg: number
  if (C1p === 0 || C2p === 0) {
    Hp_avg = h1p + h2p
  } else if (Math.abs(h1p - h2p) <= 180) {
    Hp_avg = (h1p + h2p) / 2
  } else if (h1p + h2p < 360) {
    Hp_avg = (h1p + h2p + 360) / 2
  } else {
    Hp_avg = (h1p + h2p - 360) / 2
  }

  const T = 1
    - 0.17 * _cosd(Hp_avg - 30)
    + 0.24 * _cosd(2 * Hp_avg)
    + 0.32 * _cosd(3 * Hp_avg + 6)
    - 0.20 * _cosd(4 * Hp_avg - 63)

  const SL = 1 + 0.015 * Math.pow(Lp_avg - 50, 2) / Math.sqrt(20 + Math.pow(Lp_avg - 50, 2))
  const SC = 1 + 0.045 * Cp_avg
  const SH = 1 + 0.015 * Cp_avg * T

  // Rotation term RT (blue region hue correction)
  const Cp_avg7 = Math.pow(Cp_avg, 7)
  const RC = 2 * Math.sqrt(Cp_avg7 / (Cp_avg7 + 6103515625))
  const d_theta = 30 * Math.exp(-Math.pow((Hp_avg - 275) / 25, 2))
  const RT = -Math.sin(_deg2rad(2 * d_theta)) * RC

  // Step 5: Final ΔE00
  const term1 = dLp / SL
  const term2 = dCp / SC
  const term3 = dHp / SH
  return Math.sqrt(term1 * term1 + term2 * term2 + term3 * term3 + RT * term2 * term3)
}

// ── Trig helpers (degree-based) ───────────────────────────────────────────────
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

function _deg2rad(d: number): number { return d * DEG2RAD }
function _sind(d: number): number { return Math.sin(d * DEG2RAD) }
function _cosd(d: number): number { return Math.cos(d * DEG2RAD) }
function _atan2deg(y: number, x: number): number {
  const a = Math.atan2(y, x) * RAD2DEG
  return a < 0 ? a + 360 : a
}

/** Luminance for contrast calculation */
export function luma(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000
}

/** Returns '#fff' or '#000' for best contrast on given hex */
export function contrastColor(hex: string): string {
  return luma(hex) > 128 ? '#000000' : '#ffffff'
}
