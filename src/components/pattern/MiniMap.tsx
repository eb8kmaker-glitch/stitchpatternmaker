'use client'

import { useRef, useEffect, useCallback, RefObject } from 'react'
import type { PatternResult } from '@/types'

interface MiniMapProps {
  pattern:        PatternResult
  containerRef:   RefObject<HTMLDivElement>
  cellSize:       number
  offset:         { x: number; y: number }
  scale:          number
  onOffsetChange: (offset: { x: number; y: number }) => void
}

const MAX_SIZE = 120

export default function MiniMap({
  pattern, containerRef, cellSize, offset, scale, onOffsetChange,
}: MiniMapProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const boxRef     = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const { width, height, grid, dmcMap } = pattern

  // Minimap pixel size: longest side → MAX_SIZE
  const tooSmall = width < 50 || height < 50
  const mapScale = tooSmall ? 1 : Math.min(MAX_SIZE / width, MAX_SIZE / height, 1)
  const mapW     = Math.max(1, Math.round(width  * mapScale))
  const mapH     = Math.max(1, Math.round(height * mapScale))

  // Draw minimap (sampled 1:1 at mapScale)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = mapW
    canvas.height = mapH
    const ctx  = canvas.getContext('2d')!
    const step = 1 / mapScale   // how many grid cells per minimap pixel

    for (let my = 0; my < mapH; my++) {
      for (let mx = 0; mx < mapW; mx++) {
        const gy = Math.min(Math.floor(my * step), height - 1)
        const gx = Math.min(Math.floor(mx * step), width  - 1)
        ctx.fillStyle = dmcMap[grid[gy][gx]].hex
        ctx.fillRect(mx, my, 1, 1)
      }
    }
  }, [pattern, mapW, mapH, mapScale, width, height, grid, dmcMap])

  // Update viewport indicator box
  const updateBox = useCallback(() => {
    const el  = containerRef.current
    const box = boxRef.current
    if (!el || !box) return

    // Canvas pixel dimensions (before CSS transform)
    const canvasW = width  * cellSize
    const canvasH = height * cellSize

    // Visible area in canvas-pixel coords
    const visLeft   = Math.max(0, -offset.x / scale)
    const visTop    = Math.max(0, -offset.y / scale)
    const visRight  = Math.min(canvasW, (el.clientWidth  - offset.x) / scale)
    const visBottom = Math.min(canvasH, (el.clientHeight - offset.y) / scale)

    // Map to minimap coords
    const bx = (visLeft   / canvasW) * mapW
    const by = (visTop    / canvasH) * mapH
    const bw = Math.max(2, ((visRight  - visLeft) / canvasW) * mapW)
    const bh = Math.max(2, ((visBottom - visTop)  / canvasH) * mapH)

    box.style.left   = `${Math.max(0, bx)}px`
    box.style.top    = `${Math.max(0, by)}px`
    box.style.width  = `${Math.min(mapW - Math.max(0, bx), bw)}px`
    box.style.height = `${Math.min(mapH - Math.max(0, by), bh)}px`
  }, [containerRef, offset, scale, cellSize, width, height, mapW, mapH])

  useEffect(() => { updateBox() }, [updateBox])

  // Scroll to minimap click position (center the clicked point)
  const scrollToRatio = useCallback((mxRatio: number, myRatio: number) => {
    const el = containerRef.current
    if (!el) return
    const canvasW = width  * cellSize
    const canvasH = height * cellSize
    const newOffset = {
      x: el.clientWidth  / 2 - mxRatio * canvasW * scale,
      y: el.clientHeight / 2 - myRatio * canvasH * scale,
    }
    onOffsetChange(newOffset)
  }, [containerRef, width, height, cellSize, scale, onOffsetChange])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    const canvas = canvasRef.current
    if (!canvas) return
    const rect   = canvas.getBoundingClientRect()
    scrollToRatio(
      (e.clientX - rect.left) / mapW,
      (e.clientY - rect.top)  / mapH,
    )
    e.preventDefault()
  }, [scrollToRatio, mapW, mapH])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isDragging.current) return
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      scrollToRatio(
        (e.clientX - rect.left) / mapW,
        (e.clientY - rect.top)  / mapH,
      )
    }
    function onUp() { isDragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [scrollToRatio, mapW, mapH])

  // All hooks called above — safe to return early now
  if (tooSmall) return null

  return (
    <div
      className="absolute bottom-4 right-4 rounded-[6px] overflow-hidden
                 bg-linen-50/90 border border-linen-300/30 shadow-linen
                 cursor-crosshair select-none"
      style={{ width: mapW, height: mapH }}
      onMouseDown={onMouseDown}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {/* Viewport indicator */}
      <div
        ref={boxRef}
        className="absolute border border-white/80 bg-white/20 pointer-events-none"
        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.25)' }}
      />
    </div>
  )
}
