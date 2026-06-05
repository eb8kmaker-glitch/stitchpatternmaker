'use client'

import { useState } from 'react'
import { useLang } from '@/lib/i18n/context'

export default function HomeFAQ() {
  const { t } = useLang()
  const [open, setOpen] = useState<number | null>(null)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faq.items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-9 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center gap-2.5 mb-7">
        <span className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light">
          {t.faq.sectionLabel}
        </span>
        <div className="h-px flex-1 bg-linen-300/30" />
      </div>
      <h2 className="font-playfair text-[26px] text-warm-700 mb-7 leading-snug">
        {t.faq.title}
      </h2>

      <div className="space-y-2">
        {t.faq.items.map(({ q, a }, i) => {
          const isOpen = open === i
          return (
            <div
              key={i}
              className="bg-linen-50/70 border border-linen-300/25 rounded-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 cursor-pointer
                           text-[14px] text-warm-600 font-normal text-left
                           hover:bg-linen-100/50 transition-colors"
              >
                <h3 className="font-normal leading-snug">{q}</h3>
                <span
                  className="text-sage-400 text-lg leading-none ml-4 flex-shrink-0 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-[13px] text-warm-500 font-light leading-relaxed
                                border-t border-linen-300/20">
                  {a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
