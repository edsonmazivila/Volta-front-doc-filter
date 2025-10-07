"use client"
import Link from 'next/link'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { Button } from '@/components/ui'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { Bell, Settings } from 'lucide-react'
import { useSession } from '@/components/auth/session-context'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/dashboard/sidebar'

export function Header({ title }: { title: string }) {
  const { user, isAuthenticated } = useSession()
  return (
    <header className='sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='h-12 px-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger />
          <h1 className='text-lg font-medium'>{title}</h1>
        </div>
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label='User menu' className='rounded-full h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]'>
                {(user?.name || user?.email || 'U').substring(0,1).toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              {isAuthenticated && (
                <div className='px-3 py-2 text-sm'>
                  <div className='font-medium truncate'>{user?.name || user?.email}</div>
                  <div className='text-xs text-muted-foreground capitalize'>{user?.role}</div>
                </div>
              )}
              <DropdownMenuLabel className='flex items-center justify-between'>
                <span>Theme</span>
                <ThemeToggle />
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href='/dashboard/settings' className='flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground'>
                  <Settings size={14} /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <LogoutButton className='w-full justify-start' />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label='Notifications' className='rounded-full p-1 hover:bg-accent focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]'>
                <Bell size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-80'>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <div className='max-h-64 overflow-auto divide-y divide-[var(--border)]'>
                <div className='px-2 py-2 text-sm opacity-70'>No notifications</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button variant='ghost' className='px-2 py-0 h-auto text-xs' asChild>
                  <Link href='/notifications'>View all</Link>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}


