'use client'

import { useState } from 'react'
import { useLang } from '@/lib/i18n/context'
import { COMPARE_MAX, formatSummary, type HistorySnapshot } from '@/lib/history/snapshot'

interface HistoryPanelProps {
  items:    HistorySnapshot[]
  activeId: number | null
  onRestore: (snap: HistorySnapshot) => void
  onCompare: (snaps: HistorySnapshot[]) => void
}

export default function HistoryPanel({ items, activeId, onRestore, onCompare }: HistoryPanelProps) {
  const { t } = useLang()
  const [selected, setSelected] = useState<number[]>([])

  // Panel is hidden entirely until at least one snapshot exists.
  if (items.length === 0) return null

  function toggleSelect(id: number, checked: boolean) {
    setSelected(prev => {
      if (checked) {
        if (prev.length >= COMPARE_MAX) {
          if (typeof window !== 'undefined') window.alert(t.history.maxCompareWarning)
          return prev
        }
        return [...prev, id]
      }
      return prev.filter(x => x !== id)
    })
  }

  function handleCompare() {
    const chosen = selected
      .map(id => items.find(it => it.id === id))
      .filter((s): s is HistorySnapshot => Boolean(s))
    if (chosen.length >= 2) onCompare(chosen)
  }

  const canCompare = selected.length >= 2 && selected.length <= COMPARE_MAX

  return (
    <section className="mt-6 bg-linen-50/70 border border-linen-300/20 rounded-card shadow-linen px-4 py-3.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-cormorant text-[14px] text-warm-600 tracking-wide">
          {t.history.sectionTitle}
        </h3>
        <button
          type="button"
          onClick={handleCompare}
          disabled={!canCompare}
          className="text-[11px] px-3 py-1.5 rounded-full border transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed
                     enabled:hover:bg-sage-400/12 border-sage-400/40 text-sage-500"
        >
          {t.history.compareButton}
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto scrollbar-linen pb-1">
        {items.map(snap => {
          const isActive   = snap.id === activeId
          const isChecked  = selected.includes(snap.id)
          return (
            <div
              key={snap.id}
              className={`flex-shrink-0 w-[88px] rounded-card border bg-linen-50 p-1.5
                          transition-all cursor-pointer
                          ${isActive
                            ? 'border-sage-400 ring-1 ring-sage-400/50 shadow-linen-md'
                            : 'border-linen-300/30 hover:border-linen-300/60'}`}
              onClick={() => onRestore(snap)}
              title={formatSummary(snap.settings, t)}
            >
              <div className="relative">
                {snap.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={snap.thumbnail}
                    alt={snap.label}
                    width={64}
                    height={64}
                    className="w-full aspect-square object-contain rounded-[6px] bg-linen-100"
                  />
                )}
                {isActive && (
                  <span className="absolute top-1 left-1 text-[8px] uppercase tracking-wide
                                   px-1 py-0.5 rounded-full bg-sage-400 text-linen-50">
                    {t.history.active}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <span className="text-[11px] font-mono text-warm-500">{snap.label}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onClick={e => e.stopPropagation()}
                  onChange={e => toggleSelect(snap.id, e.target.checked)}
                  className="w-3.5 h-3.5 accent-sage-400 cursor-pointer"
                  aria-label={snap.label}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
