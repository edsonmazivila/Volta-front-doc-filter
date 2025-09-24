'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = (resolvedTheme ?? theme) === 'dark'

  return (
    <button
      type='button'
      className='inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-muted'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label='Toggle theme'
    >
      {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <span className='w-4 h-4' />}
      <span className='hidden sm:inline'>Theme</span>
    </button>
  )
}


