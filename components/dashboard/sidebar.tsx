"use client"

import Link from 'next/link'
import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/employees', label: 'Employees' },
  { href: '/dashboard/timesheets', label: 'Timesheets' },
  { href: '/dashboard/documents', label: 'Documents' },
  { href: '/dashboard/leaves', label: 'Leaves' },
  { href: '/dashboard/payroll', label: 'Payroll' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/departments', label: 'Departments' },
  { href: '/dashboard/company', label: 'Company Management' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/self-service/paystubs', label: 'My Paystubs' },
  { href: '/my-timesheets', label: 'My Timesheets' },
  { href: '/leaves?my=true', label: 'My Leaves' },
  { href: '/self-service/documents', label: 'My Documents' },
  { href: '/meetings', label: 'My Meetings' },
  { href: '/attendance/my', label: 'My Attendance' },
  { href: '/admin/leaves', label: 'Leaves Management (Admin)' },
  { href: '/attendance/admin', label: 'Attendance (HR)' },
  { href: '/company-documents', label: 'Company Documents' },
  { href: '/company/profile', label: 'Company Profile' },
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
    <Button aria-label='Open menu' className={`md:hidden ${className}`} variant='outline' size='sm' onClick={openDrawer}>
      Menu
    </Button>
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


