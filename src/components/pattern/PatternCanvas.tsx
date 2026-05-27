'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { renderPattern } from '@/lib/pattern/renderer'
import type { PatternResult, DisplayMode, EditTool } from '@/types'
import MiniMap from './MiniMap'

interface PatternCanvasProps {
  pattern:         PatternResult | null
  displayMode:     DisplayMode
  highlightDmcId?: string | null
}

const CELL_SIZES = [2, 3, 4, 6, 8, 10, 12, 16]
const MAX_HISTORY = 50

export default function PatternCanvas({ pattern, displayMode, highlightDmcId }: PatternCanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const spaceDown    = useRef(false)
  const isPanning    = useRef(false)
  const lastPos      = useRef({ x: 0, y: 0 })

  // Wheel zoom accumulator
  const wheelAccum   = useRef(0)
  // Pinch zoom
  const lastPinchDist = useRef<number | null>(null)

  const [cellSize, setCellSize]   = useState(4)
  const [showGrid, setShowGrid]   = useState(true)
  const [hovered, setHovered]     = useState<string | null>(null)

  // Edit state
  const [editTool, setEditTool]           = useState<EditTool>('none')
  const [selectedDmcId, setSelectedDmcId] = useState<string | null>(null)
  const [showPalette, setShowPalette]     = useState(false)
  const isDrawing = useRef(false)

  // Editable grid (clone of pattern.grid, separately managed)
  const [editableGrid, setEditableGrid] = useState<number[][] | null>(null)

  // History
  const historyRef  = useRef<number[][][]>([])
  const historyIdx  = useRef(-1)

  // Reset editableGrid when pattern changes
  useEffect(() => {
    if (!pattern) { setEditableGrid(null); return }
    const clone = pattern.grid.map(row => [...row])
    setEditableGrid(clone)
    historyRef.current = [clone.map(r => [...r])]
    historyIdx.current = 0
    setSelectedDmcId(null)
  }, [pattern])

  // Effective grid for rendering
  const effectiveGrid = editableGrid ?? pattern?.grid ?? null

  // Re-render when anything changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !pattern || !effectiveGrid) return
    const patternToRender = { ...pattern, grid: effectiveGrid }
    renderPattern(canvas, patternToRender, { cellSize, showGrid, displayMode, highlightDmcId })
  }, [effectiveGrid, pattern, displayMode, cellSize, showGrid, highlightDmcId])

  // ── History helpers ─────────────────────────────────────────────────────────
  const pushHistory = useCallback((grid: number[][]) => {
    const snapshot = grid.map(r => [...r])
    const history  = historyRef.current
    const idx      = historyIdx.current
    // Truncate redo branch
    historyRef.current = history.slice(0, idx + 1)
    historyRef.current.push(snapshot)
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
    historyIdx.current = historyRef.current.length - 1
  }, [])

  const undo = useCallback(() => {
    if (historyIdx.current <= 0) return
    historyIdx.current--
    const grid = historyRef.current[historyIdx.current].map(r => [...r])
    setEditableGrid(grid)
  }, [])

  const redo = useCallback(() => {
    if (historyIdx.current >= historyRef.current.length - 1) return
    historyIdx.current++
    const grid = historyRef.current[historyIdx.current].map(r => [...r])
    setEditableGrid(grid)
  }, [])

  // ── Cell coordinate helper ──────────────────────────────────────────────────
  const getCellCoord = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || !pattern) return null
    const rect   = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const cx = Math.floor((clientX - rect.left) * scaleX / cellSize)
    const cy = Math.floor((clientY - rect.top)  * scaleY / cellSize)
    if (cx < 0 || cy < 0 || cx >= pattern.width || cy >= pattern.height) return null
    return { cx, cy }
  }, [pattern, cellSize])

  // ── Paint / Erase single cell ───────────────────────────────────────────────
  const paintCell = useCallback((cx: number, cy: number, grid: number[][], erasing: boolean): number[][] => {
    if (!pattern) return grid
    if (erasing) {
      // erase = color index 0 (first dmc = background, typically white)
      if (grid[cy][cx] === 0) return grid
      const next = grid.map(r => [...r])
      next[cy][cx] = 0
      return next
    }
    if (!selectedDmcId) return grid
    const targetIdx = pattern.dmcMap.findIndex(d => d.id === selectedDmcId)
    if (targetIdx < 0) return grid
    if (grid[cy][cx] === targetIdx) return grid
    const next = grid.map(r => [...r])
    next[cy][cx] = targetIdx
    return next
  }, [pattern, selectedDmcId])

  // ── BFS Flood fill ──────────────────────────────────────────────────────────
  const floodFill = useCallback((cx: number, cy: number, grid: number[][]): number[][] => {
    if (!pattern || !selectedDmcId) return grid
    const targetIdx = pattern.dmcMap.findIndex(d => d.id === selectedDmcId)
    if (targetIdx < 0) return grid
    const srcColor = grid[cy][cx]
    if (srcColor === targetIdx) return grid
    const next   = grid.map(r => [...r])
    const queue  = [{ x: cx, y: cy }]
    const visited = new Set<string>()
    while (queue.length > 0) {
      const { x, y } = queue.shift()!
      const key = `${x},${y}`
      if (visited.has(key)) continue
      visited.add(key)
      if (x < 0 || y < 0 || x >= pattern.width || y >= pattern.height) continue
      if (next[y][x] !== srcColor) continue
      next[y][x] = targetIdx
      queue.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 })
    }
    return next
  }, [pattern, selectedDmcId])

  // ── Canvas mouse handlers ───────────────────────────────────────────────────
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (spaceDown.current) return  // panning takes over
    if (editTool === 'none') return
    if (!editableGrid || !pattern) return

    const coord = getCellCoord(e.clientX, e.clientY)
    if (!coord) return
    const { cx, cy } = coord

    if (editTool === 'eyedropper') {
      const dmc = pattern.dmcMap[editableGrid[cy][cx]]
      setSelectedDmcId(dmc.id)
      setEditTool('paint')
      return
    }

    if (editTool === 'fill') {
      const next = floodFill(cx, cy, editableGrid)
      if (next !== editableGrid) {
        pushHistory(next)
        setEditableGrid(next)
      }
      return
    }

    if (editTool === 'paint' || editTool === 'erase') {
      isDrawing.current = true
      const erasing = editTool === 'erase' || e.shiftKey
      const next    = paintCell(cx, cy, editableGrid, erasing)
      if (next !== editableGrid) setEditableGrid(next)
    }
  }, [editTool, editableGrid, pattern, getCellCoord, floodFill, paintCell, pushHistory])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning.current) return
    const canvas = canvasRef.current
    if (!canvas || !pattern || !editableGrid) return

    // Hover info
    const coord = getCellCoord(e.clientX, e.clientY)
    if (coord) {
      const dmc = pattern.dmcMap[editableGrid[coord.cy][coord.cx]]
      setHovered(`DMC ${dmc.id}  ·  ${dmc.name}`)
    } else {
      setHovered(null)
    }

    // Drawing drag
    if (!isDrawing.current || (editTool !== 'paint' && editTool !== 'erase')) return
    if (!coord) return
    const erasing = editTool === 'erase' || e.shiftKey
    const next    = paintCell(coord.cx, coord.cy, editableGrid, erasing)
    if (next !== editableGrid) setEditableGrid(next)
  }, [pattern, editableGrid, getCellCoord, editTool, paintCell])

  const handleCanvasMouseUp = useCallback(() => {
    if (isDrawing.current && editableGrid) {
      pushHistory(editableGrid)
    }
    isDrawing.current = false
  }, [editableGrid, pushHistory])

  // ── Wheel scroll & zoom — window-level capture so page scroll is suppressed ──
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      const el = containerRef.current
      if (!el) return
      // Only act when the pointer is inside our canvas container
      if (!el.contains(e.target as Node)) return

      // Always prevent page scroll / browser pinch-zoom inside the container
      e.preventDefault()

      if (!e.ctrlKey && !e.metaKey) {
        // Normal scroll → manually forward to container
        el.scrollLeft += e.deltaX
        el.scrollTop  += e.deltaY
        return
      }

      // Ctrl/Cmd + wheel → zoom
      wheelAccum.current += e.deltaY
      if (Math.abs(wheelAccum.current) < 60) return
      const dir = wheelAccum.current > 0 ? -1 : 1
      wheelAccum.current = 0

      const rect   = el.getBoundingClientRect()
      const focusX = e.clientX - rect.left + el.scrollLeft
      const focusY = e.clientY - rect.top  + el.scrollTop

      setCellSize(cur => {
        const idx    = CELL_SIZES.indexOf(cur)
        const newIdx = Math.max(0, Math.min(CELL_SIZES.length - 1, idx + dir))
        const next   = CELL_SIZES[newIdx]
        if (next === cur) return cur
        const ratio  = next / cur
        requestAnimationFrame(() => {
          const r2 = el.getBoundingClientRect()
          el.scrollLeft = focusX * ratio - (e.clientX - r2.left)
          el.scrollTop  = focusY * ratio - (e.clientY - r2.top)
        })
        return next
      })
    }

    // capture:true → runs before browser scroll/zoom handlers
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => window.removeEventListener('wheel', onWheel, { capture: true })
  }, [])

  // ── Touch pinch zoom ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const container: HTMLDivElement = el

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 2) return
      const dx   = e.touches[0].clientX - e.touches[1].clientX
      const dy   = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const cx   = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const cy   = (e.touches[0].clientY + e.touches[1].clientY) / 2

      if (lastPinchDist.current !== null) {
        const delta = dist - lastPinchDist.current
        if (Math.abs(delta) >= 30) {
          const dir    = delta > 0 ? 1 : -1
          lastPinchDist.current = dist
          const rect   = container.getBoundingClientRect()
          const focusX = cx - rect.left + container.scrollLeft
          const focusY = cy - rect.top  + container.scrollTop
          setCellSize(cur => {
            const idx    = CELL_SIZES.indexOf(cur)
            const newIdx = Math.max(0, Math.min(CELL_SIZES.length - 1, idx + dir))
            const next   = CELL_SIZES[newIdx]
            if (next === cur) return cur
            const ratio  = next / cur
            requestAnimationFrame(() => {
              const r2 = container.getBoundingClientRect()
              container.scrollLeft = focusX * ratio - (cx - r2.left)
              container.scrollTop  = focusY * ratio - (cy - r2.top)
            })
            return next
          })
        }
      } else {
        lastPinchDist.current = dist
      }
    }

    function onTouchEnd() { lastPinchDist.current = null }

    container.addEventListener('touchmove', onTouchMove, { passive: true })
    container.addEventListener('touchend',  onTouchEnd)
    return () => {
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend',  onTouchEnd)
    }
  }, [])

  // ── Space + drag pan ────────────────────────────────────────────────────────
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isPanning.current) return
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      lastPos.current = { x: e.clientX, y: e.clientY }
      const el = containerRef.current
      if (el) { el.scrollLeft -= dx; el.scrollTop -= dy }
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
      // Undo / Redo
      if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) { redo() } else { undo() }
        e.preventDefault()
        return
      }
      if (e.code === 'KeyY' && (e.ctrlKey || e.metaKey)) {
        redo(); e.preventDefault(); return
      }
      if (e.code !== 'Space' || e.repeat) return
      if (isEditable(document.activeElement)) return
      e.preventDefault()
      spaceDown.current = true
      document.body.classList.add('pan-ready')
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code !== 'Space') return
      spaceDown.current = false
      isPanning.current = false
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
  }, [undo, redo])

  const handleContainerMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!spaceDown.current) return
    e.preventDefault()
    isPanning.current = true
    lastPos.current   = { x: e.clientX, y: e.clientY }
    document.body.classList.remove('pan-ready')
    document.body.classList.add('pan-grabbing')
  }, [])

  const zoom = useCallback((dir: 1 | -1 | 0) => {
    setCellSize(cur => {
      const idx = CELL_SIZES.indexOf(cur)
      if (dir === 0) return 4
      if (dir === 1 && idx < CELL_SIZES.length - 1) return CELL_SIZES[idx + 1]
      if (dir === -1 && idx > 0) return CELL_SIZES[idx - 1]
      return cur
    })
  }, [])

  // Canvas cursor
  const canvasCursor =
    editTool === 'paint'      ? 'crosshair'
    : editTool === 'erase'    ? 'cell'
    : editTool === 'fill'     ? 'copy'
    : editTool === 'eyedropper' ? 'zoom-in'
    : 'default'

  // Unique DMC list for palette picker
  const paletteColors = pattern?.dmcMap ?? []

  return (
    <div className="flex flex-col bg-linen-card">
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-linen-300/20
                      bg-linen-50/70 flex-wrap relative">
        {/* Zoom controls */}
        <ToolBtn onClick={() => zoom(1)}  label="확대"><ZoomInIcon /></ToolBtn>
        <ToolBtn onClick={() => zoom(-1)} label="축소"><ZoomOutIcon /></ToolBtn>
        <ToolBtn onClick={() => zoom(0)}  label="맞춤">
          <FitIcon /> <span className="text-[11px]">맞춤</span>
        </ToolBtn>
        <div className="w-px h-4 bg-linen-300/30 mx-1" />
        <ToolBtn onClick={() => setShowGrid(g => !g)} active={showGrid} label="격자">
          <GridIcon /> <span className="text-[11px]">격자</span>
        </ToolBtn>

        {/* Edit tools */}
        <div className="w-px h-4 bg-linen-300/30 mx-1" />
        <ToolBtn
          onClick={() => setEditTool(t => t === 'paint' ? 'none' : 'paint')}
          active={editTool === 'paint'}
          label="그리기"
        >
          <PaintIcon /> <span className="text-[11px]">그리기</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => setEditTool(t => t === 'erase' ? 'none' : 'erase')}
          active={editTool === 'erase'}
          label="지우개"
        >
          <EraseIcon /> <span className="text-[11px]">지우개</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => setEditTool(t => t === 'fill' ? 'none' : 'fill')}
          active={editTool === 'fill'}
          label="채우기"
        >
          <FillIcon /> <span className="text-[11px]">채우기</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => setEditTool(t => t === 'eyedropper' ? 'none' : 'eyedropper')}
          active={editTool === 'eyedropper'}
          label="스포이드"
        >
          <EyedropIcon />
        </ToolBtn>

        {/* Undo / Redo */}
        <div className="w-px h-4 bg-linen-300/30 mx-1" />
        <ToolBtn onClick={undo} label="실행취소"><UndoIcon /></ToolBtn>
        <ToolBtn onClick={redo} label="다시실행"><RedoIcon /></ToolBtn>

        {/* Selected color swatch + palette picker */}
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
                style={{ background: selectedDmcId ? (pattern.dmcMap.find(d => d.id === selectedDmcId)?.hex ?? '#fff') : '#fff' }}
              />
              <span className="text-[11px]">
                {selectedDmcId ? `DMC ${selectedDmcId}` : '색상 선택'}
              </span>
            </button>
          </>
        )}

        {/* Hint text */}
        <span className="ml-auto flex items-center gap-3 text-[10px] text-warm-400 font-light tracking-wider">
          {pattern && (
            <span className="hidden sm:inline opacity-60">
              Ctrl+휠로 줌 · Space+드래그로 이동
            </span>
          )}
          {cellSize} px / 칸
        </span>

        {/* DMC Palette picker dropdown */}
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
        className="flex-1 overflow-auto p-6 relative min-h-96 select-none"
        onMouseDown={handleContainerMouseDown}
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(168,178,161,0.05) 23px, rgba(168,178,161,0.05) 24px),
            repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(168,178,161,0.05) 23px, rgba(168,178,161,0.05) 24px),
            linear-gradient(160deg, #f8f6f3, #f0ebe4)
          `,
        }}
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
        <canvas
          ref={canvasRef}
          className="block rounded-[10px] shadow-canvas"
          style={{ display: pattern ? 'block' : 'none', cursor: canvasCursor }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => { setHovered(null); handleCanvasMouseUp() }}
        />

        {/* MiniMap */}
        {pattern && effectiveGrid && (
          <MiniMap
            pattern={{ ...pattern, grid: effectiveGrid }}
            containerRef={containerRef}
            cellSize={cellSize}
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
          {hovered && (
            <span className="ml-auto text-warm-500 font-normal">{hovered}</span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Palette Picker Dropdown ───────────────────────────────────────────────────
function PalettePicker({
  colors, selectedId, onSelect, onClose,
}: {
  colors:     { id: string; hex: string; name: string }[]
  selectedId: string | null
  onSelect:   (id: string) => void
  onClose:    () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-10" onClick={onClose} />
      {/* Panel */}
      <div className="absolute top-full left-0 mt-1 z-20
                      bg-linen-50/95 backdrop-blur-sm border border-linen-300/30
                      rounded-card shadow-linen-md p-3 min-w-[220px]">
        <p className="text-[9px] uppercase tracking-wider text-warm-400 mb-2">
          DMC 색상 선택
        </p>
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
function ToolBtn({
  onClick, active = false, label, children,
}: {
  onClick:  () => void
  active?:  boolean
  label:    string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`btn-ghost flex items-center gap-1 ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <span>
      {label}: <strong className="text-warm-500 font-normal">{value}</strong>
    </span>
  )
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const strokeProps = {
  fill:           'none'    as const,
  stroke:         'currentColor' as const,
  strokeWidth:    1.5,
  strokeLinecap:  'round'   as const,
  strokeLinejoin: 'round'   as const,
}

function ZoomInIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg> }
function ZoomOutIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg> }
function FitIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> }
function GridIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function PaintIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg> }
function EraseIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><polyline points="20 20 8.5 20"/><path d="M22 20H2"/><path d="m7 17-4.3-4.3a1 1 0 0 1 0-1.4l9-9a1 1 0 0 1 1.4 0l8.6 8.6a1 1 0 0 1 0 1.4L13 17Z"/></svg> }
function FillIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><path d="m19 11-8-8-8.5 8.5a5.5 5.5 0 0 0 7.78 7.78L19 11Z"/><path d="m20 12 2 2a1 1 0 1 0 2-2l-2-2"/><line x1="22" y1="17" x2="22" y2="17"/></svg> }
function EyedropIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg> }
function UndoIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg> }
function RedoIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg> }
function ArtboardIcon() { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(168,178,161,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="1"/><line x1="12" y1="23" x2="12" y2="21"/><line x1="3" y1="12" x2="1" y2="12"/><line x1="23" y1="12" x2="21" y2="12"/></svg> }
