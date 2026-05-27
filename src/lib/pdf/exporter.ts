import { buildSymbolMap } from '@/lib/pattern/symbols'
import type { PatternResult, ThreadUsage } from '@/types'

/**
 * Generate a printable PDF from the cross-stitch pattern.
 * All text uses Latin characters to ensure correct rendering with jsPDF built-in fonts.
 */
export async function exportPatternPdf(
  pattern: PatternResult,
  threads: ThreadUsage[],
  title = 'Stitch Pattern Maker',
): Promise<void> {
  const { jsPDF }  = await import('jspdf')
  const autoTable  = (await import('jspdf-autotable')).default

  const CELL_PX    = 7                              // slightly larger cells
  const MARGIN     = 14
  const PAGE_W     = 210
  const PAGE_H     = 297
  const CELL_MM    = CELL_PX * 0.352778
  const CELLS_PER_PAGE_X = Math.floor((PAGE_W - MARGIN * 2) / CELL_MM)
  const CELLS_PER_PAGE_Y = Math.floor((PAGE_H - MARGIN * 2 - 22) / CELL_MM)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const { grid, dmcMap, width, height } = pattern
  const symbolMap = buildSymbolMap(grid)

  // ── Cover page: thread list with symbol legend ─────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(79, 74, 69)
  doc.text(title, MARGIN, 26)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(122, 115, 109)
  doc.text(
    `${width} x ${height} stitches  |  ${threads.length} colors`,
    MARGIN, 34,
  )
  doc.text(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    PAGE_W - MARGIN, 34, { align: 'right' },
  )

  doc.setFontSize(7)
  doc.setTextColor(168, 178, 161)
  doc.text(
    'Symbols match the pattern grid cells. Refer to this thread list while stitching.',
    MARGIN, 40,
  )

  autoTable(doc, {
    startY: 45,
    head: [['Symbol', 'DMC', 'Color Name', 'Stitches', 'Skeins', 'Color']],
    body: threads.map(t => [
      t.symbol,
      t.dmc.id,
      t.dmc.name,
      t.cells.toLocaleString('en-US'),
      String(t.skeins),
      '',
    ]),
    didDrawCell(data) {
      // Color swatch in the last column
      if (data.column.index === 5 && data.section === 'body') {
        const t = threads[data.row.index]
        if (!t) return
        const [r, g, b] = t.dmc.rgb
        doc.setFillColor(r, g, b)
        doc.rect(
          data.cell.x + 1,
          data.cell.y + 0.8,
          data.cell.width - 2,
          data.cell.height - 1.6,
          'F',
        )
        // Thin border around swatch for light colors
        const luma = (r * 299 + g * 587 + b * 114) / 1000
        if (luma > 200) {
          doc.setDrawColor(200, 195, 188)
          doc.setLineWidth(0.15)
          doc.rect(
            data.cell.x + 1,
            data.cell.y + 0.8,
            data.cell.width - 2,
            data.cell.height - 1.6,
            'S',
          )
        }
      }
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [79, 74, 69],
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [156, 166, 148],
      textColor: [247, 245, 242],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248, 246, 243] },
    columnStyles: {
      0: { cellWidth: 13, halign: 'center', fontStyle: 'bold', fontSize: 10 },
      1: { cellWidth: 16 },
      2: { cellWidth: 58 },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 22 },
    },
  })

  // ── Pattern pages ──────────────────────────────────────────────────────────
  const totalPagesX = Math.ceil(width  / CELLS_PER_PAGE_X)
  const totalPagesY = Math.ceil(height / CELLS_PER_PAGE_Y)
  const totalPages  = totalPagesX * totalPagesY
  let pageNum = 1

  for (let pageY = 0; pageY < totalPagesY; pageY++) {
    for (let pageX = 0; pageX < totalPagesX; pageX++) {
      doc.addPage()

      const startX = pageX * CELLS_PER_PAGE_X
      const startY = pageY * CELLS_PER_PAGE_Y
      const endX   = Math.min(startX + CELLS_PER_PAGE_X, width)
      const endY   = Math.min(startY + CELLS_PER_PAGE_Y, height)

      // Page header
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(150, 142, 134)
      doc.text(
        `Page ${pageNum} / ${totalPages}  |  Area [${startX + 1}-${endX}, ${startY + 1}-${endY}]`,
        MARGIN, 11,
      )
      doc.text(title, PAGE_W - MARGIN, 11, { align: 'right' })
      pageNum++

      // Separator line under header
      doc.setDrawColor(210, 205, 198)
      doc.setLineWidth(0.2)
      doc.line(MARGIN, 13.5, PAGE_W - MARGIN, 13.5)

      const originY = 16
      const chunkW  = endX - startX
      const chunkH  = endY - startY

      // ── Offscreen Canvas → PNG → addImage (파일 크기 대폭 감소) ──────────
      const RENDER_SCALE = 3
      const offCanvas    = document.createElement('canvas')
      offCanvas.width    = chunkW * CELL_PX * RENDER_SCALE
      offCanvas.height   = chunkH * CELL_PX * RENDER_SCALE
      const ctx          = offCanvas.getContext('2d')!
      ctx.scale(RENDER_SCALE, RENDER_SCALE)

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const ci       = grid[y][x]
          const dmc      = dmcMap[ci]
          const [r, g, b] = dmc.rgb
          const px       = (x - startX) * CELL_PX
          const py       = (y - startY) * CELL_PX

          // 색상 채우기
          ctx.fillStyle = `rgb(${r},${g},${b})`
          ctx.fillRect(px, py, CELL_PX, CELL_PX)

          // 기호 오버레이
          const symbol = symbolMap.get(ci) ?? ''
          if (symbol) {
            const luma = (r * 299 + g * 587 + b * 114) / 1000
            ctx.fillStyle    = luma > 140 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)'
            ctx.font         = `bold ${CELL_PX - 2}px monospace`
            ctx.textAlign    = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(symbol, px + CELL_PX / 2, py + CELL_PX * 0.55)
          }

          // 격자선 (10칸마다 굵게)
          if ((x - startX) % 10 === 0 || (y - startY) % 10 === 0) {
            ctx.strokeStyle = 'rgba(60,50,40,0.45)'
            ctx.lineWidth   = 0.6
          } else {
            ctx.strokeStyle = 'rgba(150,140,130,0.25)'
            ctx.lineWidth   = 0.2
          }
          ctx.strokeRect(px + 0.1, py + 0.1, CELL_PX - 0.2, CELL_PX - 0.2)
        }
      }

      // 눈금자 x축 숫자 (Canvas에 직접)
      ctx.fillStyle    = 'rgba(100,90,80,0.7)'
      ctx.font         = `${CELL_PX - 1}px monospace`
      ctx.textAlign    = 'left'
      ctx.textBaseline = 'top'
      for (let x = startX; x < endX; x += 10) {
        ctx.fillText(String(x + 1), (x - startX) * CELL_PX + 1, 1)
      }

      // PNG → jsPDF addImage
      const imgData  = offCanvas.toDataURL('image/png')
      const printW   = PAGE_W - MARGIN * 2
      const printHRaw = printW * (chunkH / chunkW)
      const printH   = Math.min(printHRaw, PAGE_H - MARGIN - originY)
      doc.addImage(imgData, 'PNG', MARGIN, originY, printW, printH)

      // 눈금자 y축 숫자 (PDF 텍스트)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(4.5)
      doc.setTextColor(110, 100, 90)
      const cellMmFit = printW / chunkW
      for (let y = startY; y < endY; y += 10) {
        const py = originY + (y - startY) * cellMmFit + cellMmFit / 2 + 1
        doc.text(String(y + 1), MARGIN - 2, py, { align: 'right' })
      }
    }
  }

  doc.save(`stitchpatternmaker-${width}x${height}.pdf`)
}
