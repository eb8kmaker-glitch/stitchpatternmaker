'use client'

import { useLang } from '@/lib/i18n/context'
import { localePath } from '@/lib/i18n/routing'

/** Returns a locale-prefixed version of `path` based on the current language. */
export function useLocalePath(path: string): string {
  const { lang } = useLang()
  return localePath(lang, path)
}
