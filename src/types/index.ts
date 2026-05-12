// ── DMC Thread ──────────────────────────────────────────────────────────────
export interface DmcColor {
  id: string
  name: string
  hex: string
  rgb: [number, number, number]
  lab: [number, number, number]
}

// ── Pattern ──────────────────────────────────────────────────────────────────
export type PatternGrid = number[][]   // [row][col] → cluster index

export interface PatternResult {
  grid:    PatternGrid
  dmcMap:  DmcColor[]      // cluster index → DmcColor
  width:   number
  height:  number
}

// ── Settings ─────────────────────────────────────────────────────────────────
export type SizePrefixPreset = '50x50' | '100x100' | '150x200' | '200x200' | 'custom'

export type SepLevel = 'off' | 'weak' | 'medium' | 'strong'

export type DisplayMode = 'color' | 'symbol' | 'mixed'

export interface PatternSettings {
  width:      number
  height:     number
  colorCount: number
  sepLevel:   SepLevel
  mode:       DisplayMode
}

// ── Thread usage ─────────────────────────────────────────────────────────────
export interface ThreadUsage {
  dmc:          DmcColor
  cells:        number
  skeins:       number
  symbol:       string   // the symbol shown in the pattern grid
  clusterIndex: number   // cluster index in the pattern grid
}
