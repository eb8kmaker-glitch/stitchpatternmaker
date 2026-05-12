import { contrastColor } from '@/lib/color/lab'
import { buildSymbolMap } from '@/lib/pattern/symbols'
import type { PatternResult, DisplayMode } from '@/types'

export interface RenderOptions {
  cellSize:    number
  showGrid:    boolean
  displayMode: DisplayMode
}

export function renderPattern(
  canvas: HTMLCanvasElement,
  pattern: PatternResult,
  options: RenderOptions,
): void {
  const { cellSize: cs, showGrid, displayMode: mode } = options
  const { grid, dmcMap, width, height } = pattern

  canvas.width  = width  * cs
  canvas.height = height * cs

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Build symbol map (consistent with ThreadList & PDF)
  const symbolMap = buildSymbolMap(grid)

  // Draw cells
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ci  = grid[y][x]
      const dmc = dmcMap[ci]
      const px  = x * cs
      const py  = y * cs

      // Background fill
      if (mode === 'color' || mode === 'mixed') {
        ctx.fillStyle = dmc.hex
      } else {
        ctx.fillStyle = '#f7f5f2'
      }
      ctx.fillRect(px, py, cs, cs)

      // Symbol overlay
      if ((mode === 'symbol' || mode === 'mixed') && cs >= 8) {
        const symbol = symbolMap.get(ci) ?? '?'
        const textColor =
          mode === 'mixed'
            ? contrastColor(dmc.hex).replace('#000000', 'rgba(0,0,0,0.65)').replace('#ffffff', 'rgba(255,255,255,0.85)')
            : '#4f4a45'

        ctx.fillStyle    = textColor
        ctx.font         = `bold ${Math.max(7, cs - 3)}px monospace`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(symbol, px + cs / 2, py + cs / 2)
      }

      // Cell border
      if (showGrid && cs >= 3) {
        ctx.strokeStyle = mode === 'color'
          ? 'rgba(0,0,0,0.05)'
          : 'rgba(80,70,60,0.12)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(px + 0.25, py + 0.25, cs - 0.5, cs - 0.5)
      }
    }
  }

  // 10-cell ruler grid
  if (cs >= 5) {
    ctx.strokeStyle = 'rgba(100,90,80,0.14)'
    ctx.lineWidth   = 0.8

    for (let y = 0; y <= height; y += 10) {
      ctx.beginPath()
      ctx.moveTo(0, y * cs)
      ctx.lineTo(width * cs, y * cs)
      ctx.stroke()

      if (y > 0 && cs >= 5) {
        ctx.fillStyle    = 'rgba(100,90,80,0.3)'
        ctx.font         = `${Math.max(8, cs - 1)}px monospace`
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(String(y), 2, y * cs + 1)
      }
    }

    for (let x = 0; x <= width; x += 10) {
      ctx.beginPath()
      ctx.moveTo(x * cs, 0)
      ctx.lineTo(x * cs, height * cs)
      ctx.stroke()

      if (x > 0 && cs >= 5) {
        ctx.fillStyle    = 'rgba(100,90,80,0.3)'
        ctx.font         = `${Math.max(8, cs - 1)}px monospace`
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'top'
        ctx.save()
        ctx.translate(x * cs + 1, 2)
        ctx.fillText(String(x), 0, 0)
        ctx.restore()
      }
    }
  }
}
