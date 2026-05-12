import { buildSymbolMap } from '@/lib/pattern/symbols'
import type { PatternResult, ThreadUsage } from '@/types'

/**
 * Generate a printable PDF from the cross-stitch pattern.
 * Uses jsPDF (loaded dynamically to avoid SSR issues).
 */
export async function exportPatternPdf(
  pattern: PatternResult,
  threads: ThreadUsage[],
  title = 'Cotton & Bloom — 십자수 도안',
): Promise<void> {
  const { jsPDF }  = await import('jspdf')
  const autoTable  = (await import('jspdf-autotable')).default

  const CELL_PX    = 6
  const MARGIN     = 16
  const PAGE_W     = 210
  const PAGE_H     = 297
  const CELL_MM    = CELL_PX * 0.352778
  const CELLS_PER_PAGE_X = Math.floor((PAGE_W - MARGIN * 2) / CELL_MM)
  const CELLS_PER_PAGE_Y = Math.floor((PAGE_H - MARGIN * 2 - 24) / CELL_MM)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const { grid, dmcMap, width, height } = pattern
  const symbolMap = buildSymbolMap(grid)

  // ── Cover page: thread list with symbol legend ─────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(79, 74, 69)
  doc.text(title, MARGIN, 28)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(122, 115, 109)
  doc.text(`${width} × ${height} 칸  ·  ${threads.length}색`, MARGIN, 36)
  doc.text(new Date().toLocaleDateString('ko-KR'), PAGE_W - MARGIN, 36, { align: 'right' })

  doc.setFontSize(7)
  doc.setTextColor(168, 178, 161)
  doc.text('기호(심볼)는 도안 격자의 각 칸과 동일합니다. 인쇄 후 실 목록을 참조하여 작업하세요.', MARGIN, 42)

  autoTable(doc, {
    startY: 47,
    head: [['기호', 'DMC', '색상명', '사용 칸', '필요 타래', '색상']],
    body: threads.map(t => [
      t.symbol,
      t.dmc.id,
      t.dmc.name,
      t.cells.toLocaleString(),
      `${t.skeins}타래`,
      '',
    ]),
    didDrawCell(data) {
      // Render color swatch in the last column
      if (data.column.index === 5 && data.section === 'body') {
        const t = threads[data.row.index]
        if (!t) return
        const [r, g, b] = t.dmc.rgb
        doc.setFillColor(r, g, b)
        doc.rect(
          data.cell.x + 1.5,
          data.cell.y + 1,
          data.cell.width - 3,
          data.cell.height - 2,
          'F',
        )
      }
      // Bold symbol column
      if (data.column.index === 0 && data.section === 'body') {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
      }
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [79, 74, 69],
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [168, 178, 161],
      textColor: [247, 245, 242],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [247, 245, 242] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold', fontSize: 9 },
      1: { cellWidth: 16 },
      2: { cellWidth: 56 },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 18 },
    },
  })

  // ── Pattern pages ──────────────────────────────────────────────────────────
  const totalPagesX = Math.ceil(width  / CELLS_PER_PAGE_X)
  const totalPagesY = Math.ceil(height / CELLS_PER_PAGE_Y)
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
      doc.setFontSize(8)
      doc.setTextColor(158, 152, 144)
      doc.text(
        `페이지 ${pageNum} / ${totalPagesX * totalPagesY}  ·  구역 [${startX + 1}–${endX}, ${startY + 1}–${endY}]`,
        MARGIN, 12,
      )
      pageNum++

      // Draw cells with color fill + symbol overlay
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const ci  = grid[y][x]
          const dmc = dmcMap[ci]
          const px  = MARGIN + (x - startX) * CELL_MM
          const py  = 18    + (y - startY) * CELL_MM

          // Color fill
          const [r, g, b] = dmc.rgb
          doc.setFillColor(r, g, b)
          doc.rect(px, py, CELL_MM, CELL_MM, 'F')

          // Symbol overlay (centered in cell)
          const symbol = symbolMap.get(ci) ?? ''
          if (symbol) {
            const luma  = (r * 299 + g * 587 + b * 114) / 1000
            const tGray = luma > 145 ? 30 : 220
            doc.setTextColor(tGray, tGray, tGray)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(3)
            doc.text(symbol, px + CELL_MM / 2, py + CELL_MM * 0.72, { align: 'center' })
          }

          // Grid line every 10 cells
          if ((x - startX) % 10 === 0 || (y - startY) % 10 === 0) {
            doc.setDrawColor(100, 92, 84)
            doc.setLineWidth(0.15)
            doc.rect(px, py, CELL_MM, CELL_MM, 'S')
          }
        }
      }

      // Ruler labels
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5)
      doc.setTextColor(100, 90, 80)
      for (let x = startX; x < endX; x += 10) {
        const px = MARGIN + (x - startX) * CELL_MM
        doc.text(String(x + 1), px, 17.5)
      }
      for (let y = startY; y < endY; y += 10) {
        const py = 18 + (y - startY) * CELL_MM + CELL_MM / 2 + 1
        doc.text(String(y + 1), MARGIN - 3, py, { align: 'right' })
      }
    }
  }

  doc.save(`cotton-bloom-pattern-${width}x${height}.pdf`)
}
