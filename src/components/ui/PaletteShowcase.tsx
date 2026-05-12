'use client'

import { useState } from 'react'
import { DMC_COLORS } from '@/lib/dmc/database'

// Curated linen/cotton palette for showcase
const LINEN_COLLECTION_IDS = [
  '3865','ecru','712','739','738','437','436','435',
  '543','842','841','840','822','644','3864','3863',
  '524','523','522','3364','3363','369','368','928',
  '927','926','3689','3688','3687','3727','3726','778',
  '3354','3733','676','677','3047','3046','951','754',
]

export default function PaletteShowcase() {
  const [tooltip, setTooltip] = useState<string | null>(null)

  const palette = LINEN_COLLECTION_IDS
    .map(id => DMC_COLORS.find(c => c.id === id))
    .filter(Boolean)

  return (
    <section className="mt-7 bg-linen-50/80 border border-linen-300/20 rounded-card p-5 shadow-linen">
      <div className="flex items-baseline gap-2.5 mb-3.5">
        <h3 className="font-cormorant text-[15px] text-warm-600 tracking-wide">
          추천 DMC 컬러 — Linen Collection
        </h3>
        <span className="text-[10px] text-warm-400 font-light tracking-wide">
          장미 정원 · 코튼 · 린넨 계열
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {palette.map(color => {
          if (!color) return null
          return (
            <div
              key={color.id}
              className="flex flex-col items-center gap-1 cursor-pointer"
              onMouseEnter={() => setTooltip(`DMC ${color.id} — ${color.name}`)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className="w-8 h-8 rounded-[8px] border border-black/7 shadow-sm
                           transition-transform duration-150 hover:scale-[1.15]"
                style={{ background: color.hex }}
              />
              <span className="text-[9px] text-warm-400 font-mono">{color.id}</span>
            </div>
          )
        })}
      </div>

      {tooltip && (
        <p className="mt-3 text-[11px] text-warm-500 font-light">{tooltip}</p>
      )}
    </section>
  )
}
