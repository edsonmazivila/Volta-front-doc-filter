"use client"

import Link from 'next/link'
import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Clock, FileText, Calendar, DollarSign, 
  BarChart3, UserCog, Building2, Settings, Briefcase, 
  FileCheck, CalendarCheck, FolderOpen, X 
} from 'lucide-react'
import { Button } from '@/components/ui'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { useSession } from '@/components/auth/session-context'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

type NavSection = {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Management',
    items: [
      { href: '/dashboard/employees', label: 'Employees', icon: Users },
      { href: '/dashboard/timesheets', label: 'Timesheets', icon: Clock },
      { href: '/dashboard/leaves', label: 'Leaves', icon: Calendar },
      { href: '/dashboard/payroll', label: 'Payroll', icon: DollarSign },
      { href: '/dashboard/departments', label: 'Departments', icon: Building2 },
    ]
  },
  {
    title: 'Self Service',
    items: [
      { href: '/self-service/paystubs', label: 'My Paystubs', icon: FileCheck },
      { href: '/my-timesheets', label: 'My Timesheets', icon: Clock },
      { href: '/leaves?my=true', label: 'My Leaves', icon: CalendarCheck },
      { href: '/self-service/documents', label: 'My Documents', icon: FolderOpen },
    ]
  },
  {
    title: 'Administration',
    items: [
      { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
      { href: '/dashboard/users', label: 'Users', icon: UserCog },
      { href: '/dashboard/documents', label: 'Documents', icon: FileText },
      { href: '/dashboard/company', label: 'Company', icon: Briefcase },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]
  }
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
  const { user, isAuthenticated } = useSession()
  const pathname = usePathname()
  
  return (
    <aside className='hidden md:flex w-64 shrink-0 border-r bg-background/50 backdrop-blur flex-col'>
      <div className='p-3.5 border-b'>
        <h2 className='text-lg font-bold'>JECH Pay</h2>
      </div>
      
      <nav className='flex-1 overflow-y-auto p-3 space-y-6'>
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <h3 className='px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {section.title}
            </h3>
            <div className='space-y-1'>
              {section.items.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground font-medium' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Icon className='h-4 w-4 shrink-0' />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      
      {isAuthenticated && (
        <div className='p-4 border-t'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold'>
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='font-medium truncate text-sm'>{user?.name || user?.email}</div>
              <div className='text-xs text-muted-foreground capitalize'>{user?.role?.replace(/_/g, ' ')}</div>
            </div>
          </div>
          <LogoutButton className='w-full justify-start' />
        </div>
      )}
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
  const { user, isAuthenticated } = useSession()
  const pathname = usePathname()
  
  return (
    <div aria-hidden={!open} className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={closeDrawer} aria-label='Close menu overlay' />
      <aside className={`absolute left-0 top-0 h-full w-72 bg-background border-r flex flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`} role='dialog' aria-modal='true' aria-label='Navigation menu'>
        <div className='p-4 border-b flex items-center justify-between'>
          <h2 className='text-lg font-bold'>JECH Pay</h2>
          <button onClick={closeDrawer} aria-label='Close menu' className='p-2 hover:bg-muted rounded-lg'>
            <X className='h-5 w-5' />
          </button>
        </div>
        
        <nav className='flex-1 overflow-y-auto p-3 space-y-6'>
          {NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <h3 className='px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                {section.title}
              </h3>
              <div className='space-y-1'>
                {section.items.map(item => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground font-medium' 
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <Icon className='h-4 w-4 shrink-0' />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        
        {isAuthenticated && (
          <div className='p-4 border-t'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold'>
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='font-medium truncate text-sm'>{user?.name || user?.email}</div>
                <div className='text-xs text-muted-foreground capitalize'>{user?.role?.replace(/_/g, ' ')}</div>
              </div>
            </div>
            <LogoutButton className='w-full justify-start' />
          </div>
        )}
      </aside>
    </div>
  )
}


