import React from 'react'

export function SectionLabel({ num }: { num: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="w-6 h-6 rounded-full bg-sage-400/20 border border-sage-400/30
                       flex items-center justify-center text-[10px] text-sage-500 tabular-nums">
        {num}
      </span>
      <div className="h-px w-8 bg-sage-400/40" />
    </div>
  )
}

export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex gap-3 p-4 bg-sage-400/8 border border-sage-400/20 rounded-chip">
      <span className="text-sage-400 text-[14px] flex-shrink-0 mt-0.5">✦</span>
      <p className="text-[13px] text-warm-500 font-light leading-relaxed">{children}</p>
    </div>
  )
}

export function PrepItem({ title, badge, desc }: { title: string; badge: string; desc: string }) {
  return (
    <div className="flex gap-4 p-5 bg-linen-50/70 border border-linen-300/20 rounded-card">
      <div className="w-1 flex-shrink-0 rounded-full bg-sage-400/50" />
      <div>
        <div className="flex items-center gap-3 mb-1.5">
          <h3 className="font-cormorant text-[17px] text-warm-600">{title}</h3>
          <span className="text-[10px] px-2 py-0.5 bg-sage-400/15 text-sage-500
                           rounded-pill border border-sage-400/25">{badge}</span>
        </div>
        <p className="text-[13px] text-warm-500 font-light leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export function TipItem({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <span className="text-sage-400 mt-0.5 flex-shrink-0">·</span>
      <span><strong className="text-warm-600">{title}</strong> — {desc}</span>
    </li>
  )
}
