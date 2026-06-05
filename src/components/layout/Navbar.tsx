'use client'

import Link from 'next/link'
import { useLang } from '@/lib/i18n/context'
import type { Locale } from '@/lib/i18n/locales'

const LOCALES: Locale[] = ['ko', 'en', 'ja']

export default function Navbar() {
  const { lang, t, setLang } = useLang()

  const navLinks = [
    { label: t.nav.gallery,   href: '/gallery' },
    { label: t.nav.guide,     href: '/guide' },
    { label: t.nav.dmcColors, href: '/dmc-colors' },
    { label: t.nav.feedback,  href: '/feedback' },
  ]

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-9 py-4 sm:py-5
                    bg-linen-50/88 backdrop-blur-md border-b border-linen-300/20">
      {/* Brand */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 font-cormorant text-lg sm:text-xl tracking-wider text-warm-600">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
          Stitch Pattern Maker
        </div>
        <p className="text-[9px] uppercase tracking-[0.14em] text-warm-400 font-light font-noto hidden sm:block">
          {t.nav.subtitle}
        </p>
      </div>

      {/* Links + Language toggle */}
      <ul className="flex items-center gap-3 sm:gap-7 list-none">

        {/* Language toggle */}
        <li className="hidden sm:flex items-center gap-1 mr-1">
          {LOCALES.map((l, i) => (
            <span key={l} className="flex items-center">
              {i > 0 && (
                <span className="text-warm-300 text-[10px] mx-1 select-none">|</span>
              )}
              <button
                type="button"
                onClick={() => setLang(l)}
                className={`text-[10px] tracking-widest uppercase transition-colors duration-150 cursor-pointer
                  ${lang === l
                    ? 'text-warm-700 font-semibold'
                    : 'text-warm-400 hover:text-warm-600 font-light'
                  }`}
              >
                {l.toUpperCase()}
              </button>
            </span>
          ))}
        </li>

        {navLinks.map(link => (
          <li key={link.href} className="hidden sm:block">
            <Link
              href={link.href}
              className="text-xs text-warm-500 font-light tracking-wider
                         hover:text-warm-600 transition-colors duration-200
                         no-underline"
            >
              {link.label}
            </Link>
          </li>
        ))}

        <li>
          <Link
            href="/"
            className="px-4 sm:px-5 py-2 bg-warm-600 text-linen-50 text-xs
                       rounded-pill cursor-pointer no-underline
                       hover:bg-warm-500 transition-colors duration-200"
          >
            {t.nav.cta}
          </Link>
        </li>
      </ul>
    </nav>
  )
}
