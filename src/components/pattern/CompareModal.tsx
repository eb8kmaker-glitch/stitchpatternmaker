'use client'

import { useEffect, useRef } from 'react'
import { renderPattern } from '@/lib/pattern/renderer'
import { useLang } from '@/lib/i18n/context'
import { formatSummary, type HistorySnapshot } from '@/lib/history/snapshot'

const MAX_PX = 300

interface CompareModalProps {
  items:   HistorySnapshot[]   // 2 or 3 snapshots
  onClose: () => void
  onUse:   (snap: HistorySnapshot) => void
}

function CompareCanvas({ snap }: { snap: HistorySnapshot }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const { width, height } = snap.pattern
    const cell = Math.max(1, Math.floor(MAX_PX / Math.max(width, height)))
    renderPattern(canvas, snap.pattern, { cellSize: cell, showGrid: false, displayMode: 'color' })
  }, [snap])
  return (
    <canvas
      ref={ref}
      className="rounded-[6px] border border-linen-300/30 bg-linen-100"
      style={{ maxWidth: MAX_PX, maxHeight: MAX_PX, width: '100%', height: 'auto' }}
    />
  )
}

export default function CompareModal({ items, onClose, onUse }: CompareModalProps) {
  const { t } = useLang()

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-warm-900/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-linen-50 border border-linen-300/30 rounded-panel shadow-linen-md
                        w-full max-w-3xl flex flex-col max-h-[88vh]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-linen-300/20">
            <h3 className="font-cormorant text-[15px] text-warm-600 tracking-wide">
              {t.history.compareTitle}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[12px] px-3 py-1.5 rounded-full border border-linen-300/40
                         text-warm-500 hover:bg-linen-200/40 transition-colors"
            >
              {t.history.close}
            </button>
          </div>

          <div className="overflow-y-auto scrollbar-linen p-5">
            <div
              className="grid gap-4 justify-center"
              style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
            >
              {items.map(snap => (
                <div key={snap.id} className="flex flex-col items-center gap-2.5">
                  <span className="text-[12px] font-mono text-warm-500">{snap.label}</span>
                  <CompareCanvas snap={snap} />
                  <p className="text-[11px] text-warm-400 font-light text-center leading-relaxed">
                    {formatSummary(snap.settings, t)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onUse(snap)}
                    className="text-[11px] px-3.5 py-1.5 rounded-full border border-sage-400/40
                               text-sage-500 hover:bg-sage-400/12 transition-colors"
                  >
                    {t.history.useThis}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
