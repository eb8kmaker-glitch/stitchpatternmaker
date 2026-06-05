import { notFound } from 'next/navigation'
import { LangProvider } from '@/lib/i18n/context'
import type { Locale } from '@/lib/i18n/locales'

const VALID_LOCALES: Locale[] = ['ko', 'ja']

export function generateStaticParams() {
  return VALID_LOCALES.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!VALID_LOCALES.includes(locale as Locale)) notFound()

  return (
    <LangProvider initialLang={locale as Locale}>
      {children}
    </LangProvider>
  )
}
