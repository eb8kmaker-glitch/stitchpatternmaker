export const LOCALE_PREFIXES = ['ko', 'ja'] as const
export type LocalePrefix = (typeof LOCALE_PREFIXES)[number]

/** Strip the locale prefix from a pathname. Returns the rest of the path (always starts with / or is '/'). */
export function stripLocale(pathname: string): string {
  for (const loc of LOCALE_PREFIXES) {
    if (pathname === `/${loc}`) return '/'
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(`/${loc}`.length)
  }
  return pathname
}

/** Build a locale-prefixed path. EN = no prefix. */
export function localePath(locale: string, path: string): string {
  const clean = path === '' ? '/' : path
  if (locale === 'en') return clean
  return locale === 'ko' || locale === 'ja' ? `/${locale}${clean === '/' ? '' : clean}` : clean
}
