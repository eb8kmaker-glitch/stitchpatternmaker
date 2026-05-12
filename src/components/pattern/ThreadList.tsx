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
      <div className="flex items-center gap-2 mb-2.5">
        <p className="sec-label mb-0">실 목록</p>
        <span className="text-[9px] bg-sage-400/14 text-sage-500 px-2 py-0.5 rounded-full
                         font-light tracking-wide">
          {threads.length}색
        </span>
      </div>

      {/* Thread rows */}
      <div className="max-h-44 overflow-y-auto scrollbar-linen space-y-0">
        {threads.map(({ dmc, cells, skeins }) => (
          <div
            key={dmc.id}
            className="flex items-center gap-2 py-1.5 border-b border-dashed border-linen-300/20 last:border-0"
          >
            <div
              className="w-5 h-5 rounded-[6px] border border-linen-300/25 flex-shrink-0 shadow-sm"
              style={{ background: dmc.hex }}
            />
            <span className="flex-1 text-[11px] text-warm-600 font-normal">DMC {dmc.id}</span>
            <span className="text-[10px] text-warm-400 font-mono">
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
