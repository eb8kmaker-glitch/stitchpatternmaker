'use client'

import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from 'react'
import { locales, type Locale, type Translations, LOCALE_STORAGE_KEY } from './locales'

interface LangContextValue {
  lang: Locale
  t:    Translations
  setLang: (l: Locale) => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  t:    locales.en,
  setLang: () => {},
})

export function LangProvider({
  children,
  initialLang,
}: {
  children: ReactNode
  initialLang?: Locale
}) {
  const [lang, setLangState] = useState<Locale>(initialLang ?? 'en')

  // Read from localStorage on mount — skip when locale comes from URL
  useEffect(() => {
    if (initialLang) return
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
      if (stored && stored in locales) setLangState(stored)
    } catch { /* SSR / private mode */ }
  }, [initialLang])

  // Sync html[lang], og:locale, title, description on lang change
  useEffect(() => {
    const t = locales[lang]
    document.documentElement.lang = t.meta.htmlLang

    const ogLocale = document.querySelector('meta[property="og:locale"]')
    ogLocale?.setAttribute('content', t.meta.ogLocale)

    document.title = t.meta.title

    const desc = document.querySelector('meta[name="description"]')
    desc?.setAttribute('content', t.meta.description)
  }, [lang])

  const setLang = useCallback((l: Locale) => {
    setLangState(l)
    try { localStorage.setItem(LOCALE_STORAGE_KEY, l) } catch { /* ignore */ }
  }, [])

  return (
    <LangContext.Provider value={{ lang, t: locales[lang], setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
