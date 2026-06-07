import { buildSymbolMap } from '@/lib/pattern/symbols'
import { assignWorkColors } from '@/lib/pattern/workColors'
import type { PatternResult, ThreadUsage, PdfOptions } from '@/types'

function hexToRgbArr(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

// ── Paper size definitions ────────────────────────────────────────────────────
const PAPER_SIZES = {
  a4:     { w: 210,   h: 297,   jsPdfFormat: 'a4'     as const },
  a3:     { w: 297,   h: 420,   jsPdfFormat: 'a3'     as const },
  letter: { w: 215.9, h: 279.4, jsPdfFormat: 'letter' as const },
}

// ── Canvas helper: render a grid chunk to an offscreen canvas ────────────────
function renderGridToCanvas(
  grid: number[][],
  dmcMap: { rgb: [number, number, number] }[],
  symbolMap: Map<number, string>,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  cellPx: number,
  renderScale: number,
  drawSymbols: boolean,
): HTMLCanvasElement {
  const chunkW = endX - startX
  const chunkH = endY - startY
  const canvas = document.createElement('canvas')
  canvas.width  = chunkW * cellPx * renderScale
  canvas.height = chunkH * cellPx * renderScale
  const ctx = canvas.getContext('2d')!
  ctx.scale(renderScale, renderScale)

  // ── Fill cells
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const ci       = grid[y][x]
      const dmc      = dmcMap[ci]
      const [r, g, b] = dmc.rgb
      const px       = (x - startX) * cellPx
      const py       = (y - startY) * cellPx

      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(px, py, cellPx, cellPx)

      if (drawSymbols) {
        const symbol = symbolMap.get(ci) ?? ''
        if (symbol) {
          const luma = (r * 299 + g * 587 + b * 114) / 1000
          ctx.fillStyle    = luma > 140 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)'
          ctx.font         = `bold ${cellPx - 2}px monospace`
          ctx.textAlign    = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(symbol, px + cellPx / 2, py + cellPx * 0.55)
        }
      }

      // light cell borders
      ctx.strokeStyle = 'rgba(150,140,130,0.2)'
      ctx.lineWidth   = 0.2
      ctx.strokeRect(px + 0.1, py + 0.1, cellPx - 0.2, cellPx - 0.2)
    }
  }

  // ── Red 10-cell grid lines (absolute coordinates)
  ctx.strokeStyle = 'rgba(220,0,0,0.55)'
  ctx.lineWidth   = 1.2
  for (let x = startX; x <= endX; x++) {
    if (x % 10 === 0) {
      const px = (x - startX) * cellPx
      ctx.beginPath()
      ctx.moveTo(px, 0)
      ctx.lineTo(px, chunkH * cellPx)
      ctx.stroke()
    }
  }
  for (let y = startY; y <= endY; y++) {
    if (y % 10 === 0) {
      const py = (y - startY) * cellPx
      ctx.beginPath()
      ctx.moveTo(0, py)
      ctx.lineTo(chunkW * cellPx, py)
      ctx.stroke()
    }
  }

  return canvas
}

export async function exportPatternPdf(
  pattern: PatternResult,
  threads: ThreadUsage[],
  options: PdfOptions = {
    fabricCount: 14,
    paperSize: 'a4',
    showCover: true,
    showColorChart: true,
    showOverview: true,
    showPattern: true,
    showWorkOverview: true,
    showWorkPattern: true,
  },
  title = 'Stitch Pattern Maker',
): Promise<void> {
  const { jsPDF }  = await import('jspdf')
  const autoTable  = (await import('jspdf-autotable')).default

  const {
    fabricCount, paperSize,
    showCover, showColorChart, showOverview, showPattern, showWorkOverview, showWorkPattern,
    imageDataUrl, threadBrand = 'DMC', labels,
  } = options

  const L = {
    pageCover:        labels?.pageCover        ?? 'Cover',
    pageColorChart:   labels?.pageColorChart   ?? 'Color Chart',
    pageOverview:     labels?.pageOverview     ?? 'Pattern Overview',
    pagePattern:      labels?.pagePattern      ?? 'Pattern Pages',
    pageWorkOverview: labels?.pageWorkOverview ?? 'Work Color Overview',
    pageWorkPattern:  labels?.pageWorkPattern  ?? 'Work Color Pattern',
    symbolHeader:     labels?.symbolHeader     ?? 'Sym',
    dmcHeader:        labels?.dmcHeader        ?? 'DMC',
    usageHeader:      labels?.usageHeader      ?? 'Stitches',
    skeins:           labels?.skeins           ?? '{n} skeins',
    skein:            labels?.skein            ?? '{n} skein',
  }

  const workColors = assignWorkColors(threads)
  const paper      = PAPER_SIZES[paperSize]

  const CELL_PX    = 7
  const MARGIN     = 14
  const PAGE_W     = paper.w
  const PAGE_H     = paper.h
  const CELL_MM    = CELL_PX * 0.352778
  const CELLS_PER_PAGE_X = Math.floor((PAGE_W - MARGIN * 2) / CELL_MM)
  const CELLS_PER_PAGE_Y = Math.floor((PAGE_H - MARGIN * 2 - 22) / CELL_MM)
  const RENDER_SCALE = 3

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: paper.jsPdfFormat })

  const { grid, dmcMap, width, height } = pattern
  const symbolMap = buildSymbolMap(grid)

  const finishedW = (width  / fabricCount * 2.54).toFixed(1)
  const finishedH = (height / fabricCount * 2.54).toFixed(1)
  const dateStr   = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

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
        if (drawH > maxImgH) { drawH = maxImgH; drawW = drawH * ratio }
        const drawX = (PAGE_W - drawW) / 2
        const drawY = 36
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(210, 205, 198)
        doc.setLineWidth(0.3)
        doc.roundedRect(drawX - 1, drawY - 1, drawW + 2, drawH + 2, 1, 1, 'FD')
        doc.addImage(imageDataUrl, imgType, drawX, drawY, drawW, drawH)
        imageBottomY = drawY + drawH + 6
      } catch { imageBottomY = 40 }
    }

    autoTable(doc, {
      startY: imageBottomY,
      body: [
        ['Date',          dateStr],
        ['Pattern Size',  `${width} x ${height} stitches`],
        ['Color Count',   `${threads.length} colors`],
        ['Fabric Count',  `${fabricCount}CT`],
        ['Finished Size', `${finishedW} x ${finishedH} cm`],
        ['Thread Brand',  threadBrand],
      ],
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
  if (showColorChart) {
  if (showCover) doc.addPage()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(79, 74, 69)
  doc.text(L.pageColorChart, MARGIN, 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(122, 115, 109)
  doc.text(
    `${width} x ${height} stitches  ·  ${threads.length} colors  ·  ${fabricCount}CT  ·  ${finishedW} x ${finishedH} cm`,
    MARGIN, 27,
  )

  autoTable(doc, {
    startY: 31,
    head: [[L.symbolHeader, L.dmcHeader, 'Color Name', L.usageHeader, 'Skeins', 'DMC Color', 'Work Color']],
    body: threads.map(th => [
      th.symbol, th.dmc.id, th.dmc.name,
      th.cells.toLocaleString(), (th.skeins === 1 ? L.skein : L.skeins).replace('{n}', String(th.skeins)), '', '',
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
  } // end showColorChart

  // ── Pattern Overview (mini-pattern) page ─────────────────────────────────────
  if (showOverview) {
  doc.addPage()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(79, 74, 69)
  doc.text(L.pageOverview, PAGE_W / 2, 16, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(122, 115, 109)
  doc.text(
    `${width} x ${height} stitches · ${threads.length} colors · ${fabricCount}CT`,
    PAGE_W / 2, 23, { align: 'center' },
  )

  doc.setDrawColor(210, 205, 198)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, 26, PAGE_W - MARGIN, 26)

  {
    const OVERVIEW_MARGIN = 20
    const availW = PAGE_W - OVERVIEW_MARGIN * 2
    const availH = PAGE_H - 36 - 14   // title area + footer
    const cellPxMini = Math.max(2, Math.floor(Math.min(availW / width, availH / height) * (96 / 25.4)))
    // cellPxMini in screen pixels; availW/height are in mm, 1mm = 96/25.4 px
    // Use a generous cell size (8px) and let addImage scale it down
    const MINI_CELL = 8
    const miniCanvas = renderGridToCanvas(
      grid, dmcMap, symbolMap,
      0, 0, width, height,
      MINI_CELL, 2, false,
    )
    const miniImgData = miniCanvas.toDataURL('image/png')

    // Fit into available area
    const ratio = width / height
    let drawW = availW
    let drawH = drawW / ratio
    if (drawH > availH) { drawH = availH; drawW = drawH * ratio }
    const drawX = OVERVIEW_MARGIN + (availW - drawW) / 2
    const drawY = 29

    doc.addImage(miniImgData, 'PNG', drawX, drawY, drawW, drawH)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(168, 160, 150)
  doc.text('Stitch Pattern Maker · stitchpatternmaker.app', PAGE_W / 2, PAGE_H - 7, { align: 'center' })
  } // end showOverview

  // Build work color dmcMap: substitute each cluster's color with its assigned work color
  const workDmcMap = dmcMap.map((_dmc, clusterIdx) => {
    const threadIdx = threads.findIndex(t => t.clusterIndex === clusterIdx)
    const wc = threadIdx >= 0 ? hexToRgbArr(workColors[threadIdx]) : ([200, 200, 200] as [number, number, number])
    return { rgb: wc }
  })

  // ── Pattern pages ────────────────────────────────────────────────────────────
  function renderPatternPages(colorMap: { rgb: [number, number, number] }[], sectionTitle: string) {
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
          `${sectionTitle}  ·  Page ${pageNum} / ${totalPages}  |  Area [${startX + 1}-${endX}, ${startY + 1}-${endY}]`,
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

        const offCanvas = renderGridToCanvas(
          grid, colorMap, symbolMap,
          startX, startY, endX, endY,
          CELL_PX, RENDER_SCALE, true,
        )

        const rCtx = offCanvas.getContext('2d')!
        rCtx.save()
        rCtx.scale(1 / RENDER_SCALE, 1 / RENDER_SCALE)
        rCtx.fillStyle    = 'rgba(100,90,80,0.7)'
        rCtx.font         = `${(CELL_PX - 1) * RENDER_SCALE}px monospace`
        rCtx.textAlign    = 'left'
        rCtx.textBaseline = 'top'
        for (let x = startX; x < endX; x += 10) {
          rCtx.fillText(String(x + 1), (x - startX) * CELL_PX * RENDER_SCALE + 2, 2)
        }
        rCtx.restore()

        const imgData   = offCanvas.toDataURL('image/png')
        const printW    = PAGE_W - MARGIN * 2
        const printHRaw = printW * (chunkH / chunkW)
        const printH    = Math.min(printHRaw, PAGE_H - MARGIN - originY)
        doc.addImage(imgData, 'PNG', MARGIN, originY, printW, printH)

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
  }

  if (showPattern) renderPatternPages(dmcMap, L.pagePattern)

  // ── Work Color Overview page ─────────────────────────────────────────────────
  if (showWorkOverview) {
  doc.addPage()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(79, 74, 69)
  doc.text(L.pageWorkOverview, PAGE_W / 2, 16, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(122, 115, 109)
  doc.text(
    `${width} x ${height} stitches · ${threads.length} colors · each DMC replaced by its work color`,
    PAGE_W / 2, 23, { align: 'center' },
  )

  doc.setDrawColor(210, 205, 198)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, 26, PAGE_W - MARGIN, 26)

  {
    const OVERVIEW_MARGIN = 20
    const availW = PAGE_W - OVERVIEW_MARGIN * 2
    const availH = PAGE_H - 36 - 14
    const MINI_CELL = 8
    const miniCanvas = renderGridToCanvas(
      grid, workDmcMap, symbolMap,
      0, 0, width, height,
      MINI_CELL, 2, false,
    )
    const miniImgData = miniCanvas.toDataURL('image/png')
    const ratio = width / height
    let drawW = availW
    let drawH = drawW / ratio
    if (drawH > availH) { drawH = availH; drawW = drawH * ratio }
    const drawX = OVERVIEW_MARGIN + (availW - drawW) / 2
    doc.addImage(miniImgData, 'PNG', drawX, 29, drawW, drawH)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(168, 160, 150)
  doc.text('Stitch Pattern Maker · stitchpatternmaker.app', PAGE_W / 2, PAGE_H - 7, { align: 'center' })
  } // end showWorkOverview

  // ── Work Color pattern pages ─────────────────────────────────────────────────
  if (showWorkPattern) renderPatternPages(workDmcMap, L.pageWorkPattern)

  doc.save(`stitchpatternmaker-${width}x${height}.pdf`)
}
