'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { locales, localeNames, LOCALE_COOKIE_NAME, type Locale } from '@/lib/i18n'

export function LanguageToggle() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<Locale>('en')

  useEffect(() => {
    setMounted(true)
    // Read locale from cookie
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
    const locale = cookie?.split('=')[1] as Locale | undefined
    if (locale && locales.includes(locale)) {
      setCurrentLocale(locale)
    }
  }, [])

  const handleLocaleChange = (locale: Locale) => {
    // Set cookie with 1 year expiry
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setCurrentLocale(locale)
    // Refresh to apply new locale
    router.refresh()
  }

  const isPortuguese = currentLocale === 'pt-PT'

  return (
    <button
      type='button'
      onClick={() => handleLocaleChange(isPortuguese ? 'en' : 'pt-PT')}
      aria-label='Toggle language'
      className='cursor-pointer relative inline-flex items-center h-6 w-12 rounded-full border border-[var(--border)] bg-[var(--card)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors'
    >
      <span className={`absolute left-0.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-foreground transition-transform ${mounted && isPortuguese ? 'translate-x-6' : ''}`} />
      <span className='absolute left-1 text-[10px] font-medium opacity-80'>
        EN
      </span>
      <span className='absolute right-1 text-[10px] font-medium opacity-80'>
        PT
      </span>
    </button>
  )
}

export function LanguageSelect() {
  const router = useRouter()
  const [currentLocale, setCurrentLocale] = useState<Locale>('en')

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
    const locale = cookie?.split('=')[1] as Locale | undefined
    if (locale && locales.includes(locale)) {
      setCurrentLocale(locale)
    }
  }, [])

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value as Locale
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setCurrentLocale(locale)
    router.refresh()
  }

  return (
    <select
      value={currentLocale}
      onChange={handleLocaleChange}
      className='h-6 px-2 text-xs rounded border border-[var(--border)] bg-[var(--card)] cursor-pointer focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]'
      aria-label='Select language'
    >
      {locales.map(locale => (
        <option key={locale} value={locale}>
          {localeNames[locale]}
        </option>
      ))}
    </select>
  )
}
