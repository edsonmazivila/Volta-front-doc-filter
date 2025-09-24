"use client"

import Link from 'next/link'
import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { X } from 'lucide-react'

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/employees', label: 'Employees' },
  { href: '/timesheets', label: 'Timesheets' },
  { href: '/documents', label: 'Documents' },
  { href: '/leaves', label: 'Leaves' },
  { href: '/payroll', label: 'Payroll' },
  { href: '/reports', label: 'Reports' },
  { href: '/users', label: 'Users' },
  { href: '/departments', label: 'Departments' },
  { href: '/company', label: 'Company Management' },
  { href: '/settings', label: 'Settings' },
]

type SidebarContextValue = { open: boolean, openDrawer: () => void, closeDrawer: () => void }
const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openDrawer = useCallback(() => setOpen(true), [])
  const closeDrawer = useCallback(() => setOpen(false), [])
  return (
    <SidebarContext.Provider value={{ open, openDrawer, closeDrawer }}>
      {children}
      <SidebarDrawer />
    </SidebarContext.Provider>
  )
}

export function Sidebar() {
  return (
    <aside className='hidden md:flex w-64 shrink-0 border-r bg-background/50 backdrop-blur'>
      <nav className='p-4 space-y-2 w-full'>
        {NAV_ITEMS.map(item => (
          <Link key={item.href} href={item.href} className='block px-3 py-2 rounded-md hover:bg-muted'>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export function SidebarTrigger({ className = '' }: { className?: string }) {
  const { openDrawer } = useSidebar()
  return (
    <button aria-label='Open menu' className={`md:hidden btn ${className}`} onClick={openDrawer}>
      <span className='i' />
      Menu
    </button>
  )
}

function SidebarDrawer() {
  const { open, closeDrawer } = useSidebar()
  return (
    <div aria-hidden={!open} className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={closeDrawer} aria-label='Close menu overlay' />
      <aside className={`absolute left-0 top-0 h-full w-72 glass p-4 transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`} role='dialog' aria-modal='true' aria-label='Navigation menu'>
        <button onClick={closeDrawer} aria-label='Close menu' className='btn mb-4'>
          <X size={16} /> Close
        </button>
        <nav className='space-y-2'>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className='block px-3 py-2 rounded-md hover:bg-muted' onClick={closeDrawer}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  )
}


