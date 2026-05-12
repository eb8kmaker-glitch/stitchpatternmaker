'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { renderPattern } from '@/lib/pattern/renderer'
import type { PatternResult, DisplayMode } from '@/types'

interface PatternCanvasProps {
  pattern:     PatternResult | null
  displayMode: DisplayMode
}

const CELL_SIZES = [2, 3, 4, 6, 8, 10, 12, 16]

export default function PatternCanvas({ pattern, displayMode }: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cellSize, setCellSize] = useState(4)
  const [showGrid, setShowGrid] = useState(true)
  const [hovered, setHovered]   = useState<string | null>(null)

  // Re-render when pattern, mode, cellSize, or grid changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !pattern) return
    renderPattern(canvas, pattern, { cellSize, showGrid, displayMode })
  }, [pattern, displayMode, cellSize, showGrid])

  const zoom = useCallback((dir: 1 | -1 | 0) => {
    setCellSize(cur => {
      const idx = CELL_SIZES.indexOf(cur)
      if (dir === 0) return 4
      if (dir === 1 && idx < CELL_SIZES.length - 1) return CELL_SIZES[idx + 1]
      if (dir === -1 && idx > 0) return CELL_SIZES[idx - 1]
      return cur
    })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !pattern) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const cx = Math.floor((e.clientX - rect.left) * scaleX / cellSize)
    const cy = Math.floor((e.clientY - rect.top)  * scaleY / cellSize)
    if (cx >= 0 && cx < pattern.width && cy >= 0 && cy < pattern.height) {
      const dmc = pattern.dmcMap[pattern.grid[cy][cx]]
      setHovered(`DMC ${dmc.id}  ·  ${dmc.name}`)
    }
  }, [pattern, cellSize])

  return (
    <div className="flex flex-col bg-linen-card">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-linen-300/20
                      bg-linen-50/70 flex-wrap">
        <ToolBtn onClick={() => zoom(1)}  label="확대">
          <ZoomInIcon />
        </ToolBtn>
        <ToolBtn onClick={() => zoom(-1)} label="축소">
          <ZoomOutIcon />
        </ToolBtn>
        <ToolBtn onClick={() => zoom(0)}  label="맞춤">
          <FitIcon /> <span className="text-[11px]">맞춤</span>
        </ToolBtn>
        <div className="w-px h-4 bg-linen-300/30 mx-1" />
        <ToolBtn
          onClick={() => setShowGrid(g => !g)}
          active={showGrid}
          label="격자"
        >
          <GridIcon /> <span className="text-[11px]">격자</span>
        </ToolBtn>
        <span className="ml-auto text-[10px] text-warm-400 font-light tracking-wider">
          {cellSize} px / 칸
        </span>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto p-6 relative min-h-96"
           style={{
             backgroundImage: `
               repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(168,178,161,0.05) 23px, rgba(168,178,161,0.05) 24px),
               repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(168,178,161,0.05) 23px, rgba(168,178,161,0.05) 24px),
               linear-gradient(160deg, #f8f6f3, #f0ebe4)
             `,
           }}>
        {!pattern && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5">
            <div className="w-24 h-24 rounded-[20px] border border-sage-400/25
                            bg-linen-100/40 flex items-center justify-center
                            relative">
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
          style={{ display: pattern ? 'block' : 'none' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
        />
      </div>

      {/* Info strip */}
      {pattern && (
        <div className="flex items-center gap-4 px-4 py-2 border-t border-linen-300/20
                        bg-linen-50/60 flex-wrap text-[10px] text-warm-400 font-light tracking-wide">
          <InfoChip label="크기" value={`${pattern.width}×${pattern.height}`} />
          <InfoChip label="색상" value={`${new Set(pattern.grid.flat()).size}색`} />
          <InfoChip label="총 칸" value={`${(pattern.width * pattern.height).toLocaleString()}칸`} />
          {hovered && (
            <span className="ml-auto text-warm-500 font-normal">
              {hovered}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function ToolBtn({
  onClick, active = false, label, children,
}: {
  onClick: () => void
  active?: boolean
  label: string
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

// ── Tiny SVG icons ────────────────────────────────────────────────────────────
const strokeProps = {
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function ZoomInIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
}
function ZoomOutIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
}
function FitIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
}
function GridIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...strokeProps}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function ArtboardIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(168,178,161,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="1"/><line x1="12" y1="23" x2="12" y2="21"/><line x1="3" y1="12" x2="1" y2="12"/><line x1="23" y1="12" x2="21" y2="12"/></svg>
}
