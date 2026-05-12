/**
 * Cross-stitch symbol system
 *
 * Priority order (most readable → least):
 *   1. Numbers 1–9  (skip 0 — too similar to O)
 *   2. Uppercase A–Y (skip I, O, S, Z — visually ambiguous)
 *   3. Lowercase a–y (skip i, l, o, s, z — visually ambiguous)
 *   4. Simple geometric symbols as final fallback
 */

export const SYMBOLS: readonly string[] = [
  // Numbers (0 excluded — too similar to O)
  '1','2','3','4','5','6','7','8','9',
  // Uppercase (I O S Z excluded)
  'A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','T','U','V','W','X','Y',
  // Lowercase (i l o s z excluded)
  'a','b','c','d','e','f','g','h','j','k','m','n','p','q','r','t','u','v','w','x','y',
  // Geometric fallback
  '■','□','●','○','▲','△','◆','◇','★','☆','+','×','▼','▽',
]

/**
 * Build a stable cluster-index → symbol map from the pattern grid.
 * Symbols are assigned in order of first appearance in the grid
 * (raster scan: top-left → bottom-right).
 */
export function buildSymbolMap(grid: number[][]): Map<number, string> {
  const uniqueIndices = Array.from(new Set(grid.flat()))
  const map = new Map<number, string>()
  uniqueIndices.forEach((ci, i) => {
    map.set(ci, SYMBOLS[i % SYMBOLS.length])
  })
  return map
}
