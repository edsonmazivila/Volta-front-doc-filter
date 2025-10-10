"use client"
import Link from 'next/link'
import React from 'react'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { Settings } from 'lucide-react'
import { NotificationsMenu } from '@/components/dashboard/notifications-menu'
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
				<button aria-label='User menu' className='rounded-full h-10 w-10 bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]'>
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

          <NotificationsMenu />
        </div>
      </div>
    </header>
  )
}


