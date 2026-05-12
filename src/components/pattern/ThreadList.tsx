'use client'

import { useState } from 'react'
import type { ThreadUsage, PatternResult } from '@/types'

interface ThreadListProps {
  threads: ThreadUsage[]
  pattern: PatternResult | null
}

export default function ThreadList({ threads, pattern }: ThreadListProps) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (!pattern || threads.length === 0) return
    setExporting(true)
    try {
      const { exportPatternPdf } = await import('@/lib/pdf/exporter')
      await exportPatternPdf(pattern, threads)
    } finally {
      setExporting(false)
    }
  }

  if (threads.length === 0) return null

  return (
    <div className="px-[18px] py-3.5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <p className="sec-label mb-0">실 목록 · 범례</p>
        <span className="text-[9px] bg-sage-400/15 text-sage-500 px-2 py-0.5 rounded-full
                         font-light tracking-wide">
          {threads.length}색
        </span>
      </div>

      {/* Column labels */}
      <div className="flex items-center gap-2 px-1 mb-1.5">
        <span className="w-6 text-[9px] uppercase tracking-wider text-warm-400/70 text-center flex-shrink-0">기호</span>
        <span className="w-4 flex-shrink-0" />
        <span className="flex-1 text-[9px] uppercase tracking-wider text-warm-400/70">DMC 번호</span>
        <span className="text-[9px] uppercase tracking-wider text-warm-400/70">사용량</span>
      </div>

      {/* Thread rows */}
      <div className="max-h-52 overflow-y-auto scrollbar-linen space-y-0">
        {threads.map(({ dmc, cells, skeins, symbol }) => (
          <div
            key={dmc.id}
            className="flex items-center gap-2 py-1.5
                       border-b border-dashed border-linen-300/20 last:border-0"
          >
            {/* Symbol chip */}
            <div
              className="w-6 h-6 rounded-[6px] bg-linen-100/90 border border-linen-300/35
                         flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              <span className="text-[12px] font-mono font-bold text-warm-700 leading-none">
                {symbol}
              </span>
            </div>

            {/* Color chip */}
            <div
              className="w-4 h-4 rounded-[4px] border border-linen-300/25 flex-shrink-0 shadow-sm"
              style={{ background: dmc.hex }}
            />

            {/* DMC number */}
            <span className="flex-1 text-[11px] text-warm-600 font-normal">
              DMC {dmc.id}
            </span>

            {/* Counts */}
            <span className="text-[10px] text-warm-400 font-mono tabular-nums whitespace-nowrap">
              {cells.toLocaleString()} · {skeins}타래
            </span>
          </div>
        ))}
      </div>

      {/* PDF export */}
      <button
        className="btn-secondary w-full mt-3"
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? (
          '내보내는 중...'
        ) : (
          <>
            <PdfIcon />
            PDF 다운로드
          </>
        )}
      </button>
    </div>
  )
}

function PdfIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  )
}
