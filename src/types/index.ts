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

/** Fast = flat color / Balanced = dithering supported / HQ = sharpen + cleanup */
export type QualityMode = 'fast' | 'balanced' | 'hq'

/** How the source image is mapped into the pattern grid */
export type AspectMode = 'fit' | 'crop' | 'stretch'

/** Dithering algorithm applied during quantization */
export type DitheringMode = 'none' | 'floyd' | 'atkinson' | 'ordered'

export interface PatternSettings {
  width:         number
  height:        number
  colorCount:    number
  sepLevel:      SepLevel
  mode:          DisplayMode
  qualityMode:   QualityMode
  aspectMode:    AspectMode
  ditheringMode: DitheringMode
  brightness:    number   // -100 ~ 100, default 0
  contrast:      number   // -100 ~ 100, default 0
  saturation:    number   // -100 ~ 100, default 0  (Lab chroma scale)
  temperature:   number   // -100 ~ 100, default 0  (b* offset: positive = warm)
  tint:          number   // -100 ~ 100, default 0  (a* offset: positive = magenta, negative = green)
}

// ── Edit tool ─────────────────────────────────────────────────────────────────
export type EditTool = 'none' | 'paint' | 'erase' | 'fill' | 'eyedropper'

// ── Thread usage ─────────────────────────────────────────────────────────────
export interface ThreadUsage {
  dmc:          DmcColor
  cells:        number
  skeins:       number
  symbol:       string   // the symbol shown in the pattern grid
  clusterIndex: number   // cluster index in the pattern grid
}

// ── PDF export options ────────────────────────────────────────────────────────
export type FabricCount = 11 | 14 | 16 | 18 | 28
export type PaperSize   = 'a4' | 'a3' | 'letter'

export interface PdfLabels {
  pageCover:       string
  pageColorChart:  string
  pageOverview:    string
  pagePattern:     string
  pageWorkOverview: string
  pageWorkPattern: string
  symbolHeader:    string
  dmcHeader:       string
  usageHeader:     string
  skeins:          string
  skein:           string
}

export interface PdfOptions {
  fabricCount:      FabricCount
  paperSize:        PaperSize
  showCover:        boolean
  showColorChart:   boolean
  showOverview:     boolean
  showPattern:      boolean
  showWorkOverview: boolean
  showWorkPattern:  boolean
  imageDataUrl?:    string
  threadBrand?:     string
  workColors?:      string[]
  labels?:          PdfLabels
}
