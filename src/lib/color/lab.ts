/**
 * Color science utilities
 * LAB color space + CIE76 ΔE (Delta E) for perceptual color distance
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

/** sRGB → linear RGB (inverse gamma) */
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

/** CIE76 ΔE — perceptual color distance */
export function deltaE(
  lab1: [number, number, number],
  lab2: [number, number, number],
): number {
  const dL = lab1[0] - lab2[0]
  const da = lab1[1] - lab2[1]
  const db = lab1[2] - lab2[2]
  return Math.sqrt(dL * dL + da * da + db * db)
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
