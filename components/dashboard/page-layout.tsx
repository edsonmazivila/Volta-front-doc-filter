'use client'

import { Header } from '@/components/dashboard/header'
import { ReactNode } from 'react'

interface PageLayoutProps {
  title: string
  children: ReactNode
}

/**
 * Client wrapper for dashboard pages
 * Ensures Header can use SessionProvider context
 */
export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <>
      <Header title={title} />
      {children}
    </>
  )
}
