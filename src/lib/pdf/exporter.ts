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
  // Dynamic import — avoids SSR crash
  const { jsPDF } = await import('jspdf')
  const autoTable  = (await import('jspdf-autotable')).default

  const CELL_PX    = 6          // cell size in PDF points
  const MARGIN     = 16
  const PAGE_W     = 210        // A4 mm
  const PAGE_H     = 297        // A4 mm
  const CELLS_PER_PAGE_X = Math.floor((PAGE_W - MARGIN * 2) / (CELL_PX * 0.352778))
  const CELLS_PER_PAGE_Y = Math.floor((PAGE_H - MARGIN * 2 - 24) / (CELL_PX * 0.352778))

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const { grid, dmcMap, width, height } = pattern
  const uniqueIndices = [...new Set(grid.flat())]

  // ── Cover page: thread list ────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(79, 74, 69)
  doc.text(title, MARGIN, 28)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(122, 115, 109)
  doc.text(`${width} × ${height} 칸  ·  ${threads.length}색`, MARGIN, 36)
  doc.text(new Date().toLocaleDateString('ko-KR'), PAGE_W - MARGIN, 36, { align: 'right' })

  // Thread list table
  autoTable(doc, {
    startY: 44,
    head: [['DMC', '색상명', '사용 칸', '필요 타래', '색상']],
    body: threads.map(t => [
      t.dmc.id,
      t.dmc.name,
      t.cells.toLocaleString(),
      `${t.skeins}타래`,
      '',
    ]),
    didDrawCell(data) {
      if (data.column.index === 4 && data.section === 'body') {
        const t = threads[data.row.index]
        if (!t) return
        const [r, g, b] = t.dmc.rgb
        doc.setFillColor(r, g, b)
        doc.rect(
          data.cell.x + 2,
          data.cell.y + 1.5,
          data.cell.width - 4,
          data.cell.height - 3,
          'F',
        )
      }
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [79, 74, 69],
    },
    headStyles: {
      fillColor: [168, 178, 161],
      textColor: [247, 245, 242],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [247, 245, 242] },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 60 },
      2: { cellWidth: 24, halign: 'right' },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 20 },
    },
  })

  // ── Pattern pages ──────────────────────────────────────────────────────────
  const SYMBOLS = ['■','●','▲','★','♦','✚','✿','❋','◆','✦','♠','♣','♥','◎','○','□','△','▽','☆','◇']

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
      doc.setFontSize(8)
      doc.setTextColor(158, 152, 144)
      doc.text(
        `페이지 ${pageNum} / ${totalPagesX * totalPagesY}  ·  구역 [${startX + 1}–${endX}, ${startY + 1}–${endY}]`,
        MARGIN, 12,
      )
      pageNum++

      const CELL_MM = CELL_PX * 0.352778

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const ci  = grid[y][x]
          const dmc = dmcMap[ci]
          const px  = MARGIN + (x - startX) * CELL_MM
          const py  = 18    + (y - startY) * CELL_MM

          const [r, g, b] = dmc.rgb
          doc.setFillColor(r, g, b)
          doc.rect(px, py, CELL_MM, CELL_MM, 'F')

          // Grid line every 10 cells
          if ((x - startX) % 10 === 0 || (y - startY) % 10 === 0) {
            doc.setDrawColor(120, 110, 100)
            doc.setLineWidth(0.15)
            doc.rect(px, py, CELL_MM, CELL_MM, 'S')
          }
        }
      }

      // Ruler labels
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
