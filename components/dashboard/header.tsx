"use client"
import Link from 'next/link'
import React from 'react'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { LanguageToggle } from '@/components/dashboard/language-toggle'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { UserCog } from 'lucide-react'
import { NotificationsMenu } from '@/components/dashboard/notifications-menu'
import { useSession } from '@/components/auth/session-context'
import { UserAvatar } from '@/components/profile/user-avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/dashboard/sidebar'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

export function Header({ title }: { title: string }) {
  const [mounted, setMounted] = React.useState(false)
  const { user, isAuthenticated } = useSession()
  const { i18n } = useLingui()
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    // During SSR or initial render, show minimal header
    return (
      <header className='sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='h-12 px-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h1 className='text-lg font-medium'>{title}</h1>
          </div>
        </div>
      </header>
    )
  }
  
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
              <button
                aria-label={i18n._(msg`User menu`)}
                className='rounded-full focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]'
                suppressHydrationWarning
              >
                <UserAvatar 
                  photoUrl={user?.profile_photo_url}
                  name={user?.full_name || user?.email}
                  size="md"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              {isAuthenticated && (
                <div className='px-3 py-2 text-sm'>
                  <div className='font-medium truncate'>{user?.full_name || user?.email}</div>
                  <div className='text-xs text-muted-foreground capitalize'>{user?.role}</div>
                </div>
              )}
              <DropdownMenuLabel className='flex items-center justify-between'>
                <span>{i18n._(msg`Theme`)}</span>
                <ThemeToggle />
              </DropdownMenuLabel>
              <DropdownMenuLabel className='flex items-center justify-between'>
                <span>{i18n._(msg`Language`)}</span>
                <LanguageToggle />
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href='/dashboard/profile' className='flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground'>
                  <UserCog size={14} /> {i18n._(msg`Profile`)}
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


