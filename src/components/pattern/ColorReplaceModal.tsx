'use client'

import { useState } from 'react'
import { DMC_COLORS } from '@/lib/dmc/database'
import type { DmcColor } from '@/types'

interface ColorReplaceModalProps {
  sourceColor: DmcColor
  usedColors:  DmcColor[]      // current pattern colors (source excluded)
  onReplace:   (target: DmcColor) => void
  onClose:     () => void
}

type Tab = 'pattern' | 'all'

export default function ColorReplaceModal({
  sourceColor, usedColors, onReplace, onClose,
}: ColorReplaceModalProps) {
  const [tab,      setTab]      = useState<Tab>('pattern')
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState<DmcColor | null>(null)

  const usedIds = new Set(usedColors.map(c => c.id))

  // Tab 2: filtered full DMC list (exclude source)
  const searchResults = DMC_COLORS
    .filter(c => c.id !== sourceColor.id)
    .filter(c => {
      if (!query) return true
      const q = query.toLowerCase()
      return c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    })
    .slice(0, 50)

  function handleTabChange(t: Tab) {
    setTab(t)
    setSelected(null)
  }

  function handleConfirm() {
    if (selected) onReplace(selected)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-warm-900/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-linen-50 border border-linen-300/30 rounded-panel shadow-linen-md
                        w-full max-w-md flex flex-col max-h-[80vh]">

          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-linen-300/20">
            <p className="text-[9px] uppercase tracking-[0.15em] text-warm-400 font-light mb-2">
              색상 변환
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-[6px] border border-linen-300/30 shadow-sm flex-shrink-0"
                style={{ background: sourceColor.hex }}
              />
              <div>
                <p className="text-[13px] text-warm-700 font-normal leading-tight">
                  DMC {sourceColor.id}
                </p>
                <p className="text-[11px] text-warm-400 font-light">{sourceColor.name}</p>
              </div>
              <span className="text-warm-300 mx-1">→</span>
              {selected ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-[6px] border-2 border-sage-400/60 shadow-sm flex-shrink-0"
                    style={{ background: selected.hex }}
                  />
                  <div>
                    <p className="text-[13px] text-warm-700 font-normal leading-tight">
                      DMC {selected.id}
                    </p>
                    <p className="text-[11px] text-warm-400 font-light">{selected.name}</p>
                  </div>
                </div>
              ) : (
                <span className="text-[11px] text-warm-300 italic font-light">선택 없음</span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-linen-300/20">
            {([['pattern', '도안 내 색상'], ['all', '전체 DMC 검색']] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`flex-1 py-2.5 text-[11px] font-light tracking-wide transition-colors
                            ${tab === t
                              ? 'text-warm-700 border-b-2 border-warm-500 -mb-px bg-linen-100/50'
                              : 'text-warm-400 hover:text-warm-600'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-linen p-4 min-h-0">
            {tab === 'pattern' ? (
              usedColors.length === 0 ? (
                <p className="text-center text-[11px] text-warm-300 italic py-6">
                  현재 도안에 다른 색상이 없습니다
                </p>
              ) : (
                <div className="space-y-1">
                  {usedColors.map(c => (
                    <ColorRow
                      key={c.id}
                      color={c}
                      selected={selected?.id === c.id}
                      badge={null}
                      onClick={() => setSelected(c)}
                    />
                  ))}
                </div>
              )
            ) : (
              <>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="DMC 번호 또는 색상명 검색..."
                  className="w-full mb-3 px-3 py-2 text-[11px] bg-linen-100/80 border border-linen-300/30
                             rounded-card text-warm-700 placeholder:text-warm-300
                             focus:outline-none focus:border-sage-400/50"
                  autoFocus
                />
                <div className="space-y-1">
                  {searchResults.map(c => (
                    <ColorRow
                      key={c.id}
                      color={c}
                      selected={selected?.id === c.id}
                      badge={usedIds.has(c.id) ? '도안 내 사용중' : null}
                      onClick={() => setSelected(c)}
                    />
                  ))}
                  {searchResults.length === 0 && (
                    <p className="text-center text-[11px] text-warm-300 italic py-4">
                      검색 결과가 없습니다
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-4
                          border-t border-linen-300/20 bg-linen-100/30">
            <button
              onClick={onClose}
              className="btn-ghost text-[11px] px-4"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="btn-primary text-[11px] px-5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              변환 확정
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function ColorRow({
  color, selected, badge, onClick,
}: {
  color:    DmcColor
  selected: boolean
  badge:    string | null
  onClick:  () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-[6px] text-left
                  transition-colors duration-100
                  ${selected
                    ? 'bg-sage-400/15 border border-sage-400/40'
                    : 'hover:bg-linen-200/60 border border-transparent'}`}
    >
      <div
        className="w-5 h-5 rounded-[4px] border border-linen-300/30 flex-shrink-0 shadow-sm"
        style={{ background: color.hex }}
      />
      <span className="text-[11px] text-warm-600 font-normal flex-1 text-left">
        DMC {color.id}
        <span className="text-warm-400 font-light ml-1.5">· {color.name}</span>
      </span>
      {badge && (
        <span className="text-[9px] bg-sage-400/15 text-sage-500 px-1.5 py-0.5
                         rounded-full font-light tracking-wide flex-shrink-0">
          {badge}
        </span>
      )}
    </button>
  )
}
