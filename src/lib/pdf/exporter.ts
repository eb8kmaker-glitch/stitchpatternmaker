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

      // Draw cells: color fill + symbol overlay
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const ci  = grid[y][x]
          const dmc = dmcMap[ci]
          const px  = MARGIN + (x - startX) * CELL_MM
          const py  = originY + (y - startY) * CELL_MM

          // Color fill
          const [r, g, b] = dmc.rgb
          doc.setFillColor(r, g, b)
          doc.rect(px, py, CELL_MM, CELL_MM, 'F')

          // Symbol overlay
          const symbol = symbolMap.get(ci) ?? ''
          if (symbol) {
            const luma  = (r * 299 + g * 587 + b * 114) / 1000
            const tGray = luma > 140 ? 20 : 235   // higher contrast
            doc.setTextColor(tGray, tGray, tGray)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(2.8)
            doc.text(symbol, px + CELL_MM / 2, py + CELL_MM * 0.70, { align: 'center' })
          }

          // Fine grid line every 10 cells
          if ((x - startX) % 10 === 0 || (y - startY) % 10 === 0) {
            doc.setDrawColor(90, 82, 74)
            doc.setLineWidth(0.18)
            doc.rect(px, py, CELL_MM, CELL_MM, 'S')
          } else {
            // Light hairline between every cell for readability
            doc.setDrawColor(180, 174, 166)
            doc.setLineWidth(0.05)
            doc.rect(px, py, CELL_MM, CELL_MM, 'S')
          }
        }
      }

      // Ruler labels (x-axis: top, y-axis: left)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(4.5)
      doc.setTextColor(110, 100, 90)

      for (let x = startX; x < endX; x += 10) {
        const px = MARGIN + (x - startX) * CELL_MM
        doc.text(String(x + 1), px, originY - 1)
      }
      for (let y = startY; y < endY; y += 10) {
        const py = originY + (y - startY) * CELL_MM + CELL_MM / 2 + 1
        doc.text(String(y + 1), MARGIN - 2, py, { align: 'right' })
      }
    }
  }

  doc.save(`stitchpatternmaker-${width}x${height}.pdf`)
}
