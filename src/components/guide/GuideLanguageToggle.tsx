'use client'

import { useState, useEffect } from 'react'

interface Props {
  ko: React.ReactNode
  en: React.ReactNode
}

export default function GuideLanguageToggle({ ko, en }: Props) {
  const [lang, setLang] = useState<'ko' | 'en'>('ko')

  useEffect(() => {
    const nav = navigator.language ?? ''
    if (!nav.startsWith('ko')) setLang('en')
  }, [])

  return (
    <>
      {/* Language toggle pill */}
      <div className="flex items-center gap-1 mb-10 bg-linen-100/60 border border-linen-300/25
                      rounded-full p-1 w-fit">
        <button
          type="button"
          onClick={() => setLang('ko')}
          className={`px-4 py-1.5 text-[11px] tracking-wide rounded-full transition-all duration-150
            ${lang === 'ko'
              ? 'bg-warm-600 text-linen-50 shadow-sm'
              : 'text-warm-400 hover:text-warm-600'}`}
        >
          한국어
        </button>
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-4 py-1.5 text-[11px] tracking-wide rounded-full transition-all duration-150
            ${lang === 'en'
              ? 'bg-warm-600 text-linen-50 shadow-sm'
              : 'text-warm-400 hover:text-warm-600'}`}
        >
          English
        </button>
      </div>

      {lang === 'ko' ? ko : en}
    </>
  )
}
