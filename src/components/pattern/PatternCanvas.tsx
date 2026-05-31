'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { renderPattern } from '@/lib/pattern/renderer'
import type { PatternResult, DisplayMode, EditTool, DmcColor } from '@/types'
import MiniMap from './MiniMap'
import ColorReplaceModal from './ColorReplaceModal'

interface PatternCanvasProps {
  pattern:          PatternResult | null
  displayMode:      DisplayMode
  highlightDmcId?:  string | null
  replaceRequest?:  string | null       // dmcId to replace (from ThreadList)
  onReplaceClose?:  () => void
}

const CELL_SIZES  = [2, 3, 4, 6, 8, 10, 12, 16]
const SCALE_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4]
const MAX_HISTORY = 50

function nearestScaleIdx(s: number) {
  return SCALE_STEPS.reduce((best, v, i) =>
    Math.abs(v - s) < Math.abs(SCALE_STEPS[best] - s) ? i : best, 0)
}

// Bresenham line algorithm
function bresenham(x0: number, y0: number, x1: number, y1: number) {
  const cells: Array<{ cx: number; cy: number }> = []
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  let x = x0, y = y0
  while (true) {
    cells.push({ cx: x, cy: y })
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) { err += dy; x += sx }
    if (e2 <= dx) { err += dx; y += sy }
  }
  return cells
}

export default function PatternCanvas({
  pattern, displayMode, highlightDmcId,
  replaceRequest, onReplaceClose,
}: PatternCanvasProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const containerRef  = useRef<HTMLDivElement>(null)
  const spaceDown     = useRef(false)
  const isPanning     = useRef(false)
  const lastPos       = useRef({ x: 0, y: 0 })
  const lastPinchDist = useRef<number | null>(null)
  const lastPaintCell = useRef<{ cx: number; cy: number } | null>(null)

  const [cellSize, setCellSize] = useState(8)
  const [showGrid, setShowGrid] = useState(true)
  const [hovered,  setHovered]  = useState<string | null>(null)

  // Transform state
  const [offset, setOffset] = useState({ x: 16, y: 16 })
  const [scale,  setScale]  = useState(1)
  const offsetRef = useRef({ x: 16, y: 16 })
  const scaleRef  = useRef(1)

  // Edit state
  const [editTool,       setEditTool]       = useState<EditTool>('none')
  const [selectedDmcId,  setSelectedDmcId]  = useState<string | null>(null)
  const [showPalette,    setShowPalette]     = useState(false)
  const isDrawing = useRef(false)

  // Editable grid + dmcMap (both managed separately from original pattern)
  const [editableGrid,   setEditableGrid]   = useState<number[][] | null>(null)
  const [editableDmcMap, setEditableDmcMap] = useState<DmcColor[] | null>(null)

  // History
  const historyRef = useRef<number[][][]>([])
  const historyIdx = useRef(-1)

  // Reset on pattern change
  useEffect(() => {
    if (!pattern) {
      setEditableGrid(null)
      setEditableDmcMap(null)
      return
    }
    const cloneGrid   = pattern.grid.map(row => [...row])
    const cloneDmcMap = [...pattern.dmcMap]
    setEditableGrid(cloneGrid)
    setEditableDmcMap(cloneDmcMap)
    historyRef.current = [cloneGrid.map(r => [...r])]
    historyIdx.current = 0
    setSelectedDmcId(null)
    const init = { x: 16, y: 16 }
    offsetRef.current = init; scaleRef.current = 1
    setOffset(init); setScale(1)
  }, [pattern])

  const effectiveGrid   = editableGrid   ?? pattern?.grid   ?? null
  const effectiveDmcMap = editableDmcMap ?? pattern?.dmcMap ?? []

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !pattern || !effectiveGrid) return
    renderPattern(canvas, { ...pattern, dmcMap: effectiveDmcMap, grid: effectiveGrid },
      { cellSize, showGrid, displayMode, highlightDmcId })
  }, [effectiveGrid, effectiveDmcMap, pattern, displayMode, cellSize, showGrid, highlightDmcId])

  // ── History ───────────────────────────────────────────────────────────────────
  const pushHistory = useCallback((grid: number[][]) => {
    const snap = grid.map(r => [...r])
    historyRef.current = historyRef.current.slice(0, historyIdx.current + 1)
    historyRef.current.push(snap)
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
    historyIdx.current = historyRef.current.length - 1
  }, [])

  const undo = useCallback(() => {
    if (historyIdx.current <= 0) return
    historyIdx.current--
    setEditableGrid(historyRef.current[historyIdx.current].map(r => [...r]))
  }, [])

  const redo = useCallback(() => {
    if (historyIdx.current >= historyRef.current.length - 1) return
    historyIdx.current++
    setEditableGrid(historyRef.current[historyIdx.current].map(r => [...r]))
  }, [])

  // ── Color replacement ─────────────────────────────────────────────────────────
  const replaceColor = useCallback((sourceDmcId: string, targetDmc: DmcColor) => {
    setEditableDmcMap(prev => {
      const base = prev ?? pattern?.dmcMap ?? []
      return base.map(d => d.id === sourceDmcId ? targetDmc : d)
    })
    onReplaceClose?.()
  }, [pattern, onReplaceClose])

  // Source color for the replace modal
  const replaceSourceColor = replaceRequest
    ? effectiveDmcMap.find(d => d.id === replaceRequest) ?? null
    : null

  // ── Transform helpers ─────────────────────────────────────────────────────────
  const applyZoom = useCallback((newScale: number, focusX: number, focusY: number) => {
    const ratio     = newScale / scaleRef.current
    const newOffset = {
      x: focusX - (focusX - offsetRef.current.x) * ratio,
      y: focusY - (focusY - offsetRef.current.y) * ratio,
    }
    scaleRef.current = newScale; offsetRef.current = newOffset
    setScale(newScale); setOffset(newOffset)
  }, [])

  const applyPan = useCallback((dx: number, dy: number) => {
    const newOffset = { x: offsetRef.current.x + dx, y: offsetRef.current.y + dy }
    offsetRef.current = newOffset
    setOffset(newOffset)
  }, [])

  // ── Wheel zoom / pan ──────────────────────────────────────────────────────────
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (e.clientX < rect.left || e.clientX > rect.right ||
          e.clientY < rect.top  || e.clientY > rect.bottom) return
      e.preventDefault()

      if (e.ctrlKey || e.metaKey) {
        const curIdx   = nearestScaleIdx(scaleRef.current)
        const newIdx   = e.deltaY > 0
          ? Math.max(0, curIdx - 1)
          : Math.min(SCALE_STEPS.length - 1, curIdx + 1)
        const newScale = SCALE_STEPS[newIdx]
        if (newScale === scaleRef.current) return
        applyZoom(newScale, e.clientX - rect.left, e.clientY - rect.top)
      } else {
        applyPan(-e.deltaX, -e.deltaY)
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => window.removeEventListener('wheel', onWheel, { capture: true })
  }, [applyZoom, applyPan])

  // ── Touch pinch zoom ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const container: HTMLDivElement = el

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 2) return
      e.preventDefault()
      const t0 = e.touches[0], t1 = e.touches[1]
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY)
      const cx   = (t0.clientX + t1.clientX) / 2
      const cy   = (t0.clientY + t1.clientY) / 2
      const rect = container.getBoundingClientRect()

      if (lastPinchDist.current !== null) {
        const delta = dist - lastPinchDist.current
        if (Math.abs(delta) >= 15) {
          const curIdx   = nearestScaleIdx(scaleRef.current)
          const newIdx   = delta > 0
            ? Math.min(SCALE_STEPS.length - 1, curIdx + 1)
            : Math.max(0, curIdx - 1)
          const newScale = SCALE_STEPS[newIdx]
          if (newScale !== scaleRef.current)
            applyZoom(newScale, cx - rect.left, cy - rect.top)
          lastPinchDist.current = dist
        }
      } else { lastPinchDist.current = dist }
    }
    function onTouchEnd() { lastPinchDist.current = null }

    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend',  onTouchEnd)
    return () => {
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend',  onTouchEnd)
    }
  }, [applyZoom])

  // ── Space+drag pan + keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isPanning.current) return
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      lastPos.current = { x: e.clientX, y: e.clientY }
      applyPan(dx, dy)
    }
    function onMouseUp() {
      if (!isPanning.current) return
      isPanning.current = false
      document.body.classList.remove('pan-grabbing')
      if (spaceDown.current) document.body.classList.add('pan-ready')
    }
    function isEditable(el: Element | null) {
      if (!el) return false
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return true
      return (el as HTMLElement).isContentEditable
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        e.shiftKey ? redo() : undo()
        e.preventDefault(); return
      }
      if (e.code === 'KeyY' && (e.ctrlKey || e.metaKey)) {
        redo(); e.preventDefault(); return
      }
      if (e.code !== 'Space') return
      if (isEditable(document.activeElement)) return
      e.preventDefault()           // repeat 포함 항상 스크롤 차단
      if (e.repeat) return
      spaceDown.current = true
      document.body.classList.add('pan-ready')
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code !== 'Space') return
      spaceDown.current = false; isPanning.current = false
      document.body.classList.remove('pan-ready', 'pan-grabbing')
    }
    window.addEventListener('keydown',   onKeyDown,   { capture: true })
    window.addEventListener('keyup',     onKeyUp,     { capture: true })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    return () => {
      window.removeEventListener('keydown',   onKeyDown,   { capture: true })
      window.removeEventListener('keyup',     onKeyUp,     { capture: true })
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      document.body.classList.remove('pan-ready', 'pan-grabbing')
    }
  }, [undo, redo, applyPan])

  const handleContainerMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!spaceDown.current) return
    e.preventDefault()
    isPanning.current = true
    lastPos.current   = { x: e.clientX, y: e.clientY }
    document.body.classList.remove('pan-ready')
    document.body.classList.add('pan-grabbing')
  }, [])

  // ── Toolbar zoom buttons ──────────────────────────────────────────────────────
  const zoomStep = useCallback((dir: 1 | -1 | 0) => {
    if (dir === 0) {
      const init = { x: 16, y: 16 }
      scaleRef.current = 1; offsetRef.current = init
      setScale(1); setOffset(init); return
    }
    const el     = containerRef.current
    const cx     = el ? el.clientWidth  / 2 : 400
    const cy     = el ? el.clientHeight / 2 : 300
    const curIdx = nearestScaleIdx(scaleRef.current)
    const newIdx = Math.min(Math.max(curIdx + dir, 0), SCALE_STEPS.length - 1)
    applyZoom(SCALE_STEPS[newIdx], cx, cy)
  }, [applyZoom])

  // ── Cell coordinate ───────────────────────────────────────────────────────────
  const getCellCoord = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || !pattern) return null
    const rect  = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const cx = Math.floor((clientX - rect.left) * scaleX / cellSize)
    const cy = Math.floor((clientY - rect.top)  * scaleY / cellSize)
    if (cx < 0 || cy < 0 || cx >= pattern.width || cy >= pattern.height) return null
    return { cx, cy }
  }, [pattern, cellSize])

  // ── Batch paint (single grid copy for all cells) ──────────────────────────────
  const paintCells = useCallback((
    coords: Array<{ cx: number; cy: number }>,
    grid:   number[][],
    erasing: boolean,
  ): number[][] => {
    if (!pattern) return grid
    const targetIdx = erasing
      ? 0
      : effectiveDmcMap.findIndex(d => d.id === selectedDmcId)
    if (!erasing && (targetIdx < 0 || !selectedDmcId)) return grid

    let next: number[][] | null = null
    for (const { cx, cy } of coords) {
      if (cx < 0 || cy < 0 || cx >= pattern.width || cy >= pattern.height) continue
      const cur = (next ?? grid)[cy][cx]
      if (cur === targetIdx) continue
      if (!next) next = grid.map(r => [...r])
      next[cy][cx] = targetIdx
    }
    return next ?? grid
  }, [pattern, selectedDmcId, effectiveDmcMap])

  // ── Flood fill ────────────────────────────────────────────────────────────────
  const floodFill = useCallback((cx: number, cy: number, grid: number[][]): number[][] => {
    if (!pattern || !selectedDmcId) return grid
    const targetIdx = effectiveDmcMap.findIndex(d => d.id === selectedDmcId)
    if (targetIdx < 0) return grid
    const srcColor = grid[cy][cx]
    if (srcColor === targetIdx) return grid
    const next    = grid.map(r => [...r])
    const queue   = [{ x: cx, y: cy }]
    const visited = new Set<string>()
    while (queue.length > 0) {
      const { x, y } = queue.shift()!
      const key = `${x},${y}`
      if (visited.has(key)) continue
      visited.add(key)
      if (x < 0 || y < 0 || x >= pattern.width || y >= pattern.height) continue
      if (next[y][x] !== srcColor) continue
      next[y][x] = targetIdx
      queue.push({ x: x+1, y }, { x: x-1, y }, { x, y: y+1 }, { x, y: y-1 })
    }
    return next
  }, [pattern, selectedDmcId, effectiveDmcMap])

  // ── Canvas mouse handlers ─────────────────────────────────────────────────────
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (spaceDown.current || editTool === 'none' || !editableGrid || !pattern) return
    const coord = getCellCoord(e.clientX, e.clientY)
    if (!coord) return
    const { cx, cy } = coord

    if (editTool === 'eyedropper') {
      setSelectedDmcId(effectiveDmcMap[editableGrid[cy][cx]]?.id ?? null)
      setEditTool('paint'); return
    }
    if (editTool === 'fill') {
      const next = floodFill(cx, cy, editableGrid)
      if (next !== editableGrid) { pushHistory(next); setEditableGrid(next) }
      return
    }
    if (editTool === 'paint' || editTool === 'erase') {
      isDrawing.current   = true
      lastPaintCell.current = coord
      const erasing = editTool === 'erase' || e.shiftKey
      const next    = paintCells([coord], editableGrid, erasing)
      if (next !== editableGrid) setEditableGrid(next)
    }
  }, [editTool, editableGrid, pattern, getCellCoord, floodFill, paintCells, pushHistory, effectiveDmcMap])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning.current || !pattern || !editableGrid) return
    const coord = getCellCoord(e.clientX, e.clientY)

    // Hover info
    if (coord) {
      const dmc = effectiveDmcMap[editableGrid[coord.cy][coord.cx]]
      setHovered(dmc ? `DMC ${dmc.id}  ·  ${dmc.name}` : null)
    } else { setHovered(null) }

    // Draw with Bresenham interpolation
    if (!isDrawing.current || (editTool !== 'paint' && editTool !== 'erase') || !coord) return
    const erasing = editTool === 'erase' || e.shiftKey
    const path = lastPaintCell.current
      ? bresenham(lastPaintCell.current.cx, lastPaintCell.current.cy, coord.cx, coord.cy).slice(1)
      : [coord]
    if (path.length > 0) {
      const next = paintCells(path, editableGrid, erasing)
      if (next !== editableGrid) setEditableGrid(next)
    }
    lastPaintCell.current = coord
  }, [pattern, editableGrid, effectiveDmcMap, getCellCoord, editTool, paintCells])

  const stopDrawing = useCallback(() => {
    if (isDrawing.current && editableGrid) pushHistory(editableGrid)
    isDrawing.current     = false
    lastPaintCell.current = null
  }, [editableGrid, pushHistory])

  // Canvas cursor
  const canvasCursor =
    editTool === 'paint'        ? 'crosshair'
    : editTool === 'erase'      ? 'cell'
    : editTool === 'fill'       ? 'copy'
    : editTool === 'eyedropper' ? 'zoom-in'
    : 'default'

  const paletteColors = effectiveDmcMap

  return (
    <div className="flex flex-col bg-linen-card h-full">
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-linen-300/20
                      bg-linen-50/70 flex-wrap relative">
        <ToolBtn onClick={() => zoomStep(1)}  label="확대"><ZoomInIcon /></ToolBtn>
        <ToolBtn onClick={() => zoomStep(-1)} label="축소"><ZoomOutIcon /></ToolBtn>
        <ToolBtn onClick={() => zoomStep(0)}  label="맞춤">
          <FitIcon /> <span className="text-[11px]">맞춤</span>
        </ToolBtn>
        <div className="w-px h-4 bg-linen-300/30 mx-1" />
        <ToolBtn onClick={() => setShowGrid(g => !g)} active={showGrid} label="격자">
          <GridIcon /> <span className="text-[11px]">격자</span>
        </ToolBtn>

        <div className="w-px h-4 bg-linen-300/30 mx-1" />
        <ToolBtn
          onClick={() => setEditTool(t => t === 'paint' ? 'none' : 'paint')}
          active={editTool === 'paint'} label="그리기"
        ><PaintIcon /> <span className="text-[11px]">그리기</span></ToolBtn>
        <ToolBtn
          onClick={() => setEditTool(t => t === 'erase' ? 'none' : 'erase')}
          active={editTool === 'erase'} label="지우개"
        ><EraseIcon /> <span className="text-[11px]">지우개</span></ToolBtn>
        <ToolBtn
          onClick={() => setEditTool(t => t === 'fill' ? 'none' : 'fill')}
          active={editTool === 'fill'} label="채우기"
        ><FillIcon /> <span className="text-[11px]">채우기</span></ToolBtn>
        <ToolBtn
          onClick={() => setEditTool(t => t === 'eyedropper' ? 'none' : 'eyedropper')}
          active={editTool === 'eyedropper'} label="스포이드"
        ><EyedropIcon /></ToolBtn>

        <div className="w-px h-4 bg-linen-300/30 mx-1" />
        <ToolBtn onClick={undo} label="실행취소"><UndoIcon /></ToolBtn>
        <ToolBtn onClick={redo} label="다시실행"><RedoIcon /></ToolBtn>

        {pattern && editTool !== 'none' && editTool !== 'eyedropper' && editTool !== 'erase' && (
          <>
            <div className="w-px h-4 bg-linen-300/30 mx-1" />
            <button
              onClick={() => setShowPalette(p => !p)}
              className="flex items-center gap-1.5 btn-ghost"
              aria-label="색상 선택"
            >
              <div
                className="w-4 h-4 rounded-[4px] border border-linen-300/40 flex-shrink-0 shadow-sm"
                style={{ background: selectedDmcId
                  ? (effectiveDmcMap.find(d => d.id === selectedDmcId)?.hex ?? '#fff')
                  : '#fff' }}
              />
              <span className="text-[11px]">
                {selectedDmcId ? `DMC ${selectedDmcId}` : '색상 선택'}
              </span>
            </button>
          </>
        )}

        <span className="ml-auto flex items-center gap-3 text-[10px] text-warm-400 font-light tracking-wider">
          <span className="opacity-60">
            Ctrl+휠로 줌 · Space+드래그로 이동
          </span>
          {Math.round(scale * 100)}%
        </span>

        {showPalette && pattern && (
          <PalettePicker
            colors={paletteColors}
            selectedId={selectedDmcId}
            onSelect={id => { setSelectedDmcId(id); setShowPalette(false) }}
            onClose={() => setShowPalette(false)}
          />
        )}
      </div>

      {/* ── Canvas area ──────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden min-h-[300px] select-none"
        style={{
          touchAction: 'none',
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(168,178,161,0.05) 23px, rgba(168,178,161,0.05) 24px),
            repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(168,178,161,0.05) 23px, rgba(168,178,161,0.05) 24px),
            linear-gradient(160deg, #f8f6f3, #f0ebe4)
          `,
        }}
        onMouseDown={handleContainerMouseDown}
      >
        {!pattern && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5">
            <div className="w-24 h-24 rounded-[20px] border border-sage-400/25
                            bg-linen-100/40 flex items-center justify-center relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sage-400/35" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-sage-400/35" />
              <ArtboardIcon />
            </div>
            <p className="font-cormorant text-sm italic text-warm-400 text-center leading-relaxed font-light">
              사진을 업로드하고<br />도안 생성을 눌러주세요
            </p>
          </div>
        )}

        <div style={{
          position: 'absolute', top: 0, left: 0,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}>
          <canvas
            ref={canvasRef}
            className="block rounded-[10px] shadow-canvas"
            style={{ display: pattern ? 'block' : 'none', cursor: canvasCursor }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={stopDrawing}
            onMouseLeave={() => { setHovered(null); stopDrawing() }}
          />
        </div>

        {pattern && effectiveGrid && (
          <MiniMap
            pattern={{ ...pattern, dmcMap: effectiveDmcMap, grid: effectiveGrid }}
            containerRef={containerRef}
            cellSize={cellSize}
            offset={offset}
            scale={scale}
            onOffsetChange={newOffset => { offsetRef.current = newOffset; setOffset(newOffset) }}
          />
        )}
      </div>

      {/* ── Info strip ───────────────────────────────────────────────────────── */}
      {pattern && (
        <div className="flex items-center gap-4 px-4 py-2 border-t border-linen-300/20
                        bg-linen-50/60 flex-wrap text-[10px] text-warm-400 font-light tracking-wide">
          <InfoChip label="크기" value={`${pattern.width}×${pattern.height}`} />
          <InfoChip label="색상" value={`${new Set(effectiveGrid?.flat() ?? []).size}색`} />
          <InfoChip label="총 칸" value={`${(pattern.width * pattern.height).toLocaleString()}칸`} />
          {hovered && <span className="ml-auto text-warm-500 font-normal">{hovered}</span>}
        </div>
      )}

      {/* ── Color Replace Modal ───────────────────────────────────────────────── */}
      {replaceSourceColor && (
        <ColorReplaceModal
          sourceColor={replaceSourceColor}
          usedColors={effectiveDmcMap.filter(d => d.id !== replaceSourceColor.id)}
          onReplace={target => replaceColor(replaceSourceColor.id, target)}
          onClose={() => onReplaceClose?.()}
        />
      )}
    </div>
  )
}

// ── Palette Picker ────────────────────────────────────────────────────────────
function PalettePicker({
  colors, selectedId, onSelect, onClose,
}: {
  colors:     DmcColor[]
  selectedId: string | null
  onSelect:   (id: string) => void
  onClose:    () => void
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-full left-0 mt-1 z-20
                      bg-linen-50/95 backdrop-blur-sm border border-linen-300/30
                      rounded-card shadow-linen-md p-3 min-w-[220px]">
        <p className="text-[9px] uppercase tracking-wider text-warm-400 mb-2">DMC 색상 선택</p>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-linen">
          {colors.map(dmc => (
            <button
              key={dmc.id}
              title={`DMC ${dmc.id} · ${dmc.name}`}
              onClick={() => onSelect(dmc.id)}
              className={`w-6 h-6 rounded-[4px] border transition-transform hover:scale-110
                          ${selectedId === dmc.id
                            ? 'border-warm-600 ring-1 ring-warm-500 scale-110'
                            : 'border-linen-300/30'}`}
              style={{ background: dmc.hex }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ToolBtn({ onClick, active = false, label, children }: {
  onClick: () => void; active?: boolean; label: string; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} aria-label={label}
      className={`btn-ghost flex items-center gap-1 ${active ? 'active' : ''}`}>
      {children}
    </button>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return <span>{label}: <strong className="text-warm-500 font-normal">{value}</strong></span>
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const sp = { fill: 'none' as const, stroke: 'currentColor' as const, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
function ZoomInIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg> }
function ZoomOutIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg> }
function FitIcon()      { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> }
function GridIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function PaintIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg> }
function EraseIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><polyline points="20 20 8.5 20"/><path d="M22 20H2"/><path d="m7 17-4.3-4.3a1 1 0 0 1 0-1.4l9-9a1 1 0 0 1 1.4 0l8.6 8.6a1 1 0 0 1 0 1.4L13 17Z"/></svg> }
function FillIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><path d="m19 11-8-8-8.5 8.5a5.5 5.5 0 0 0 7.78 7.78L19 11Z"/><path d="m20 12 2 2a1 1 0 1 0 2-2l-2-2"/><line x1="22" y1="17" x2="22" y2="17"/></svg> }
function EyedropIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg> }
function UndoIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg> }
function RedoIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" {...sp}><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg> }
function ArtboardIcon() { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(168,178,161,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="1"/><line x1="12" y1="23" x2="12" y2="21"/><line x1="3" y1="12" x2="1" y2="12"/><line x1="23" y1="12" x2="21" y2="12"/></svg> }
