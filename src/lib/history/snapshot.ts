import { renderPattern } from '@/lib/pattern/renderer'
import type { Translations } from '@/lib/i18n/locales'
import type { PatternResult, PatternSettings, ThreadUsage } from '@/types'

/** Max snapshots kept in memory; oldest is evicted past this. */
export const HISTORY_MAX = 10
/** Max snapshots selectable for side-by-side comparison. */
export const COMPARE_MAX = 3
/** Square thumbnail edge in px. */
export const THUMB_SIZE = 64

/**
 * A single conversion snapshot. Pattern/threads are kept by reference (memory
 * only — never persisted). PatternCanvas edits clones, so these stay pristine.
 */
export interface HistorySnapshot {
  id:           number
  label:        string             // auto sequence: "#1", "#2", ...
  thumbnail:    string | null      // 64×64 PNG dataURL (nulled when evicted)
  pattern:      PatternResult
  threads:      ThreadUsage[]
  settings:     PatternSettings
  imageDataUrl?: string
  timestamp:    string
}

/**
 * Build a square thumbnail from a pattern without ever touching the live
 * canvas: render onto a throwaway canvas, then contain-fit into THUMB_SIZE².
 */
export function makeThumbnail(pattern: PatternResult, size = THUMB_SIZE): string {
  const tmp = document.createElement('canvas')
  const cell = Math.max(1, Math.min(4, Math.floor(256 / Math.max(pattern.width, pattern.height))))
  renderPattern(tmp, pattern, { cellSize: cell, showGrid: false, displayMode: 'color' })

  const out = document.createElement('canvas')
  out.width = size
  out.height = size
  const ctx = out.getContext('2d')!
  ctx.fillStyle = '#f7f5f2'
  ctx.fillRect(0, 0, size, size)

  const ratio = tmp.width / tmp.height
  let w = size
  let h = size
  if (ratio > 1) h = size / ratio
  else w = size * ratio
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(tmp, (size - w) / 2, (size - h) / 2, w, h)
  return out.toDataURL('image/png')
}

/**
 * One-line settings summary for history/compare cards, e.g. "40 colors · HQ · Floyd".
 * Quality/dither tokens are language-neutral technical names; the color unit is i18n.
 */
export function formatSummary(settings: PatternSettings, t: Translations): string {
  const colors = t.history.summaryColors.replace('{n}', String(settings.colorCount))
  const quality =
    settings.qualityMode === 'hq' ? 'HQ'
    : settings.qualityMode === 'fast' ? 'Fast'
    : 'Balanced'
  const dither =
    settings.ditheringMode === 'none' ? 'None'
    : settings.ditheringMode.charAt(0).toUpperCase() + settings.ditheringMode.slice(1)
  return `${colors} · ${quality} · ${dither}`
}
