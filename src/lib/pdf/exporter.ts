import { buildSymbolMap } from '@/lib/pattern/symbols'
import type { PatternResult, ThreadUsage, PdfOptions } from '@/types'

// ── Work-distinction color palette (16 visually distinct colors) ──────────────
const WORK_PALETTE = [
  '#FF0000', '#0000FF', '#00AA00', '#FFD700',
  '#FF6600', '#8800CC', '#00BBFF', '#FF69B4',
  '#8B4513', '#008080', '#7FFF00', '#C71585',
  '#000080', '#808000', '#FF4500', '#3EB489',
]

function hexToRgbArr(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let rn = r / 255, gn = g / 255, bn = b / 255
  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92
  const x = (rn * 0.4124 + gn * 0.3576 + bn * 0.1805) / 0.95047
  const y = (rn * 0.2126 + gn * 0.7152 + bn * 0.0722) / 1.00000
  const z = (rn * 0.0193 + gn * 0.1192 + bn * 0.9505) / 1.08883
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

function deltaE(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgbArr(hex1)
  const [r2, g2, b2] = hexToRgbArr(hex2)
  const [l1, a1, bb1] = rgbToLab(r1, g1, b1)
  const [l2, a2, bb2] = rgbToLab(r2, g2, b2)
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (bb1 - bb2) ** 2)
}

function assignWorkColors(threads: ThreadUsage[]): string[] {
  const assigned: string[] = []
  for (let i = 0; i < threads.length; i++) {
    const recent = assigned.slice(Math.max(0, i - WORK_PALETTE.length))
    let bestColor = WORK_PALETTE[i % WORK_PALETTE.length]
    let bestScore = -1

    for (const candidate of WORK_PALETTE) {
      if (recent.includes(candidate) && recent.length >= WORK_PALETTE.length) continue
      let minDist = Infinity
      for (const prev of recent) {
        const d = deltaE(candidate, prev)
        if (d < minDist) minDist = d
      }
      if (recent.length === 0) minDist = 1000
      if (minDist > bestScore) {
        bestScore = minDist
        bestColor = candidate
      }
    }
    assigned.push(bestColor)
  }
  return assigned
}

// ── Paper size definitions ────────────────────────────────────────────────────
const PAPER_SIZES = {
  a4:     { w: 210,   h: 297,   jsPdfFormat: 'a4'     as const },
  a3:     { w: 297,   h: 420,   jsPdfFormat: 'a3'     as const },
  letter: { w: 215.9, h: 279.4, jsPdfFormat: 'letter' as const },
}

export async function exportPatternPdf(
  pattern: PatternResult,
  threads: ThreadUsage[],
  options: PdfOptions = {
    fabricCount: 14,
    paperSize: 'a4',
    showCover: true,
    showReference: true,
  },
  title = 'Stitch Pattern Maker',
): Promise<void> {
  const { jsPDF }  = await import('jspdf')
  const autoTable  = (await import('jspdf-autotable')).default

  const { fabricCount, paperSize, showCover, showReference, imageDataUrl, threadBrand = 'DMC' } = options
  const paper = PAPER_SIZES[paperSize]

  const CELL_PX    = 7
  const MARGIN     = 14
  const PAGE_W     = paper.w
  const PAGE_H     = paper.h
  const CELL_MM    = CELL_PX * 0.352778
  const CELLS_PER_PAGE_X = Math.floor((PAGE_W - MARGIN * 2) / CELL_MM)
  const CELLS_PER_PAGE_Y = Math.floor((PAGE_H - MARGIN * 2 - 22) / CELL_MM)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: paper.jsPdfFormat })

  const { grid, dmcMap, width, height } = pattern
  const symbolMap   = buildSymbolMap(grid)
  const workColors  = assignWorkColors(threads)

  const finishedW   = (width  / fabricCount * 2.54).toFixed(1)
  const finishedH   = (height / fabricCount * 2.54).toFixed(1)
  const dateStr     = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // ── Cover page ───────────────────────────────────────────────────────────────
  if (showCover) {
    doc.setFillColor(247, 245, 242)
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(79, 74, 69)
    doc.text('Stitch Pattern Maker', PAGE_W / 2, 22, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(156, 148, 140)
    doc.text('Cross Stitch Pattern', PAGE_W / 2, 29, { align: 'center' })

    doc.setDrawColor(210, 205, 198)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, 33, PAGE_W - MARGIN, 33)

    let imageBottomY = 36
    if (imageDataUrl) {
      const maxImgW = PAGE_W - MARGIN * 2
      const maxImgH = PAGE_H * 0.42
      try {
        const imgType = imageDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
        const imgDimensions = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new Image()
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
          img.onerror = () => resolve({ w: 1, h: 1 })
          img.src = imageDataUrl
        })
        const ratio = imgDimensions.w / imgDimensions.h
        let drawW = maxImgW
        let drawH = drawW / ratio
        if (drawH > maxImgH) {
          drawH = maxImgH
          drawW = drawH * ratio
        }
        const drawX = (PAGE_W - drawW) / 2
        const drawY = 36
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(210, 205, 198)
        doc.setLineWidth(0.3)
        doc.roundedRect(drawX - 1, drawY - 1, drawW + 2, drawH + 2, 1, 1, 'FD')
        doc.addImage(imageDataUrl, imgType, drawX, drawY, drawW, drawH)
        imageBottomY = drawY + drawH + 6
      } catch {
        imageBottomY = 40
      }
    }

    const infoData = [
      ['Date',          dateStr],
      ['Pattern Size',  `${width} × ${height} stitches`],
      ['Color Count',   `${threads.length} colors`],
      ['Fabric Count',  `${fabricCount}CT`],
      ['Finished Size', `${finishedW} × ${finishedH} cm`],
      ['Thread Brand',  threadBrand],
    ]

    autoTable(doc, {
      startY: imageBottomY,
      body: infoData,
      styles: {
        fontSize: 9,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        textColor: [79, 74, 69],
        font: 'helvetica',
      },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold', textColor: [122, 115, 109], fillColor: [240, 237, 233] },
        1: { cellWidth: PAGE_W - MARGIN * 2 - 38 },
      },
      alternateRowStyles: { fillColor: [248, 246, 243] },
      tableWidth: PAGE_W - MARGIN * 2,
      margin: { left: MARGIN, right: MARGIN },
    })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(168, 160, 150)
    doc.text('Stitch Pattern Maker · stitchpatternmaker.app', PAGE_W / 2, PAGE_H - 8, { align: 'center' })
  }

  // ── Color chart page ─────────────────────────────────────────────────────────
  if (showCover) doc.addPage()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(79, 74, 69)
  doc.text('Color Chart · Thread List', MARGIN, 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(122, 115, 109)
  doc.text(
    `${width} × ${height} stitches  ·  ${threads.length} colors  ·  ${fabricCount}CT  ·  ${finishedW} × ${finishedH} cm`,
    MARGIN, 27,
  )

  autoTable(doc, {
    startY: 31,
    head: [['Sym', 'DMC', 'Color Name', 'Stitches', 'Skeins', '원본색', '작업 구분색']],
    body: threads.map(t => [
      t.symbol, t.dmc.id, t.dmc.name,
      t.cells.toLocaleString('en-US'), String(t.skeins), '', '',
    ]),
    didDrawCell(data) {
      if (data.section !== 'body') return
      const t = threads[data.row.index]
      if (!t) return

      if (data.column.index === 5) {
        const [r, g, b] = t.dmc.rgb
        doc.setFillColor(r, g, b)
        doc.rect(data.cell.x + 1, data.cell.y + 0.8, data.cell.width - 2, data.cell.height - 1.6, 'F')
        const luma = (r * 299 + g * 587 + b * 114) / 1000
        if (luma > 200) {
          doc.setDrawColor(200, 195, 188)
          doc.setLineWidth(0.15)
          doc.rect(data.cell.x + 1, data.cell.y + 0.8, data.cell.width - 2, data.cell.height - 1.6, 'S')
        }
      }

      if (data.column.index === 6) {
        const wc = workColors[data.row.index]
        if (!wc) return
        const [r, g, b] = hexToRgbArr(wc)
        doc.setFillColor(r, g, b)
        doc.rect(data.cell.x + 1, data.cell.y + 0.8, data.cell.width - 2, data.cell.height - 1.6, 'F')
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
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: [248, 246, 243] },
    columnStyles: {
      0: { cellWidth: 11, halign: 'center', fontStyle: 'bold', fontSize: 10 },
      1: { cellWidth: 14 },
      2: { cellWidth: 52 },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
    },
    didDrawPage() {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(168, 160, 150)
      doc.text('Stitch Pattern Maker · stitchpatternmaker.app', PAGE_W / 2, PAGE_H - 5, { align: 'center' })
    },
  })

  // ── Pattern pages ────────────────────────────────────────────────────────────
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

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(150, 142, 134)
      doc.text(
        `Page ${pageNum} / ${totalPages}  |  Area [${startX + 1}-${endX}, ${startY + 1}-${endY}]`,
        MARGIN, 11,
      )
      doc.text(title, PAGE_W - MARGIN, 11, { align: 'right' })
      pageNum++

      doc.setDrawColor(210, 205, 198)
      doc.setLineWidth(0.2)
      doc.line(MARGIN, 13.5, PAGE_W - MARGIN, 13.5)

      const originY = 16
      const chunkW  = endX - startX
      const chunkH  = endY - startY

      // Offscreen Canvas → PNG → addImage (파일 크기 대폭 감소)
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

          ctx.fillStyle = `rgb(${r},${g},${b})`
          ctx.fillRect(px, py, CELL_PX, CELL_PX)

          const symbol = symbolMap.get(ci) ?? ''
          if (symbol) {
            const luma = (r * 299 + g * 587 + b * 114) / 1000
            ctx.fillStyle    = luma > 140 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)'
            ctx.font         = `bold ${CELL_PX - 2}px monospace`
            ctx.textAlign    = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(symbol, px + CELL_PX / 2, py + CELL_PX * 0.55)
          }

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
      const imgData   = offCanvas.toDataURL('image/png')
      const printW    = PAGE_W - MARGIN * 2
      const printHRaw = printW * (chunkH / chunkW)
      const printH    = Math.min(printHRaw, PAGE_H - MARGIN - originY)
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

  // ── Reference image page ─────────────────────────────────────────────────────
  if (showReference && imageDataUrl) {
    doc.addPage()

    doc.setFillColor(247, 245, 242)
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(79, 74, 69)
    doc.text('Reference Image', PAGE_W / 2, 18, { align: 'center' })

    doc.setDrawColor(210, 205, 198)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, 22, PAGE_W - MARGIN, 22)

    try {
      const imgType = imageDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
      const imgDimensions = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image()
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
        img.onerror = () => resolve({ w: 1, h: 1 })
        img.src = imageDataUrl
      })
      const maxW = PAGE_W - MARGIN * 2
      const maxH = PAGE_H - 42
      const ratio = imgDimensions.w / imgDimensions.h
      let drawW = maxW
      let drawH = drawW / ratio
      if (drawH > maxH) {
        drawH = maxH
        drawW = drawH * ratio
      }
      const drawX = (PAGE_W - drawW) / 2
      const drawY = 26
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(210, 205, 198)
      doc.setLineWidth(0.3)
      doc.roundedRect(drawX - 2, drawY - 2, drawW + 4, drawH + 4, 1.5, 1.5, 'FD')
      doc.addImage(imageDataUrl, imgType, drawX, drawY, drawW, drawH)
    } catch {
      // image unavailable
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(122, 115, 109)
    doc.text('작업 시 이 이미지를 참고하세요', PAGE_W / 2, PAGE_H - 13, { align: 'center' })

    doc.setFontSize(7.5)
    doc.setTextColor(168, 160, 150)
    doc.text('Stitch Pattern Maker · stitchpatternmaker.app', PAGE_W / 2, PAGE_H - 7, { align: 'center' })
  }

  doc.save(`stitchpatternmaker-${width}x${height}.pdf`)
}
