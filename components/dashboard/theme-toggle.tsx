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
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label='Toggle theme'
      className='cursor-pointer relative inline-flex items-center h-6 w-12 rounded-full border border-[var(--border)] bg-[var(--card)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors'
    >
      <span className={`absolute left-0.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-foreground transition-transform ${mounted && isDark ? 'translate-x-6' : ''}`} />
      <span className='absolute left-1 text-[10px] opacity-80'>
        <Sun size={12} />
      </span>
      <span className='absolute right-1 text-[10px] opacity-80'>
        <Moon size={12} />
      </span>
    </button>
  )
}


