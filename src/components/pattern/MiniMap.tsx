'use client'

import { useRef, useEffect, useCallback, RefObject } from 'react'
import type { PatternResult } from '@/types'

interface MiniMapProps {
  pattern:      PatternResult
  containerRef: RefObject<HTMLDivElement>
  cellSize:     number
}

const MAX_SIZE = 120

export default function MiniMap({ pattern, containerRef, cellSize }: MiniMapProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const boxRef       = useRef<HTMLDivElement>(null)
  const isDragging   = useRef(false)

  const { width, height, grid, dmcMap } = pattern

  // Hide when pattern is too small
  if (width < 50 || height < 50) return null

  // Scale so longest side = MAX_SIZE
  const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height, 1)
  const mapW  = Math.round(width  * scale)
  const mapH  = Math.round(height * scale)

  // Draw minimap (1px per scale unit)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = mapW
    canvas.height = mapH
    const ctx = canvas.getContext('2d')!
    const iw = Math.max(1, Math.round(width  / mapW))
    const ih = Math.max(1, Math.round(height / mapH))

    for (let my = 0; my < mapH; my++) {
      for (let mx = 0; mx < mapW; mx++) {
        const gy = Math.min(Math.round(my / scale), height - 1)
        const gx = Math.min(Math.round(mx / scale), width  - 1)
        // sample a block for avg color
        let r = 0, g2 = 0, b = 0, cnt = 0
        for (let dy = 0; dy < ih && gy + dy < height; dy++) {
          for (let dx = 0; dx < iw && gx + dx < width; dx++) {
            const dmc = dmcMap[grid[gy + dy][gx + dx]]
            const hex = dmc.hex.replace('#', '')
            r  += parseInt(hex.slice(0, 2), 16)
            g2 += parseInt(hex.slice(2, 4), 16)
            b  += parseInt(hex.slice(4, 6), 16)
            cnt++
          }
        }
        ctx.fillStyle = `rgb(${Math.round(r/cnt)},${Math.round(g2/cnt)},${Math.round(b/cnt)})`
        ctx.fillRect(mx, my, 1, 1)
      }
    }
  }, [pattern, mapW, mapH, scale, width, height, grid, dmcMap])

  // Update viewport box
  const updateBox = useCallback(() => {
    const container = containerRef.current
    const box       = boxRef.current
    if (!container || !box) return

    const totalW = width  * cellSize
    const totalH = height * cellSize

    const vl = container.scrollLeft
    const vt = container.scrollTop
    const vw = container.clientWidth
    const vh = container.clientHeight

    const bx = Math.max(0, (vl / totalW) * mapW)
    const by = Math.max(0, (vt / totalH) * mapH)
    const bw = Math.min(mapW - bx, (vw / totalW) * mapW)
    const bh = Math.min(mapH - by, (vh / totalH) * mapH)

    box.style.left   = `${bx}px`
    box.style.top    = `${by}px`
    box.style.width  = `${Math.max(2, bw)}px`
    box.style.height = `${Math.max(2, bh)}px`
  }, [containerRef, cellSize, width, height, mapW, mapH])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', updateBox, { passive: true })
    updateBox()
    return () => el.removeEventListener('scroll', updateBox)
  }, [containerRef, updateBox])

  // Also update when cellSize or pattern changes
  useEffect(() => { updateBox() }, [cellSize, pattern, updateBox])

  const scrollTo = useCallback((clientX: number, clientY: number) => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect  = canvas.getBoundingClientRect()
    const mx    = (clientX - rect.left)  / mapW
    const my    = (clientY - rect.top)   / mapH

    const totalW = width  * cellSize
    const totalH = height * cellSize
    container.scrollLeft = mx * totalW - container.clientWidth  / 2
    container.scrollTop  = my * totalH - container.clientHeight / 2
  }, [containerRef, mapW, mapH, width, height, cellSize])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    scrollTo(e.clientX, e.clientY)
    e.preventDefault()
  }, [scrollTo])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isDragging.current) return
      scrollTo(e.clientX, e.clientY)
    }
    function onUp() { isDragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [scrollTo])

  return (
    <div
      className="absolute bottom-4 right-4 rounded-[6px] overflow-hidden
                 bg-linen-50/90 border border-linen-300/30 shadow-linen
                 cursor-crosshair select-none"
      style={{ width: mapW, height: mapH }}
      onMouseDown={onMouseDown}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {/* Viewport indicator box */}
      <div
        ref={boxRef}
        className="absolute border border-white/80 bg-white/20 pointer-events-none"
        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.25)' }}
      />
    </div>
  )
}
