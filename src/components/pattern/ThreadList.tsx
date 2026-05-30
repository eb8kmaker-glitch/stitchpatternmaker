'use client'

import { useState } from 'react'
import type { ThreadUsage, PatternResult, FabricCount, PaperSize } from '@/types'

interface ThreadListProps {
  threads:      ThreadUsage[]
  pattern:      PatternResult | null
  imageDataUrl?: string
}

const FABRIC_OPTIONS: { value: FabricCount; label: string }[] = [
  { value: 18, label: '18CT' },
  { value: 16, label: '16CT' },
  { value: 14, label: '14CT' },
  { value: 11, label: '11CT' },
  { value: 28, label: '28CT' },
]

const PAPER_OPTIONS: { value: PaperSize; label: string }[] = [
  { value: 'a4',     label: 'A4' },
  { value: 'a3',     label: 'A3' },
  { value: 'letter', label: 'Letter' },
]

export default function ThreadList({ threads, pattern, imageDataUrl }: ThreadListProps) {
  const [exporting,     setExporting]     = useState(false)
  const [fabricCount,   setFabricCount]   = useState<FabricCount>(14)
  const [paperSize,     setPaperSize]     = useState<PaperSize>('a4')
  const [showCover,     setShowCover]     = useState(true)
  const [showReference, setShowReference] = useState(true)

  const w = pattern?.width  ?? 0
  const h = pattern?.height ?? 0
  const finishedW = w > 0 ? (w / fabricCount * 2.54).toFixed(1) : '-'
  const finishedH = h > 0 ? (h / fabricCount * 2.54).toFixed(1) : '-'

  async function handleExport() {
    if (!pattern || threads.length === 0) return
    setExporting(true)
    try {
      const { exportPatternPdf } = await import('@/lib/pdf/exporter')
      await exportPatternPdf(pattern, threads, {
        fabricCount,
        paperSize,
        showCover,
        showReference,
        imageDataUrl,
        threadBrand: 'DMC',
      })
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
            <div
              className="w-6 h-6 rounded-[6px] bg-linen-100/90 border border-linen-300/35
                         flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              <span className="text-[12px] font-mono font-bold text-warm-700 leading-none">
                {symbol}
              </span>
            </div>

            <div
              className="w-4 h-4 rounded-[4px] border border-linen-300/25 flex-shrink-0 shadow-sm"
              style={{ background: dmc.hex }}
            />

            <span className="flex-1 text-[11px] text-warm-600 font-normal">
              DMC {dmc.id}
            </span>

            <span className="text-[10px] text-warm-400 font-mono tabular-nums whitespace-nowrap">
              {cells.toLocaleString()} · {skeins}타래
            </span>
          </div>
        ))}
      </div>

      {/* ── PDF 저장 설정 ── */}
      <div className="mt-4 space-y-3 border-t border-linen-300/20 pt-3">

        {/* CT 선택 */}
        <div>
          <p className="text-[9px] uppercase tracking-wider text-warm-400/70 mb-1.5">원단 규격 (CT)</p>
          <div className="flex gap-1 flex-wrap">
            {FABRIC_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFabricCount(opt.value)}
                className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors
                  ${fabricCount === opt.value
                    ? 'bg-sage-400/25 border-sage-400/50 text-sage-600 font-bold'
                    : 'bg-linen-100/60 border-linen-300/30 text-warm-400 hover:border-sage-400/30'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[9.5px] text-warm-400 font-light">
            완성 예상 크기:{' '}
            <span className="font-mono text-warm-500">{finishedW} × {finishedH} cm</span>
            {w > 0 && (
              <span className="text-warm-300"> ({w} × {h} 기준)</span>
            )}
          </p>
        </div>

        {/* 용지 선택 */}
        <div>
          <p className="text-[9px] uppercase tracking-wider text-warm-400/70 mb-1.5">인쇄 용지</p>
          <div className="flex gap-1">
            {PAPER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPaperSize(opt.value)}
                className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors
                  ${paperSize === opt.value
                    ? 'bg-sage-400/25 border-sage-400/50 text-sage-600 font-bold'
                    : 'bg-linen-100/60 border-linen-300/30 text-warm-400 hover:border-sage-400/30'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 페이지 토글 */}
        <div className="space-y-1.5">
          <p className="text-[9px] uppercase tracking-wider text-warm-400/70 mb-1">PDF 페이지</p>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showCover}
              onChange={e => setShowCover(e.target.checked)}
              className="accent-sage-500 w-3 h-3"
            />
            <span className="text-[10px] text-warm-500 group-hover:text-warm-600 transition-colors">
              표지 페이지 (원본 이미지 · 도안 정보)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showReference}
              onChange={e => setShowReference(e.target.checked)}
              className="accent-sage-500 w-3 h-3"
            />
            <span className="text-[10px] text-warm-500 group-hover:text-warm-600 transition-colors">
              참고 이미지 페이지 (마지막 페이지)
            </span>
          </label>
        </div>
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
