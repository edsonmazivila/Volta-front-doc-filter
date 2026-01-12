'use client'
import React from 'react'
import Image from 'next/image'
import { getCompanyLogoUrl } from '@/lib/utils/logo-helpers'
import { useSession } from '@/components/auth/session-context'

interface CompanyLogoDisplayProps {
  className?: string
  size?: number
}

/**
 * Displays the company logo in navigation/header
 * Falls back to platform logo if no company logo is set
 */
export function CompanyLogoDisplay({ className = '', size = 80 }: CompanyLogoDisplayProps) {
  const { user } = useSession()
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [companyName, setCompanyName] = React.useState<string>('Volta HR')

  React.useEffect(() => {
    // Fetch company data to get logo
    async function fetchCompanyData() {
      try {
        const response = await fetch('/api/proxy?endpoint=/api/company', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const company = data.data
            setCompanyName(company.name || 'Volta HR')
            
            if (company.logo_path) {
              const url = getCompanyLogoUrl(company.logo_path, company.logo_url)
              setLogoUrl(url)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch company data:', error)
      }
    }

    // Only fetch if user has a company (not platform_owner)
    if (user && user.role !== 'platform_owner') {
      fetchCompanyData()
    }
  }, [user])

  // Show platform logo for platform_owner or if no company logo
  if (!logoUrl || user?.role === 'platform_owner') {
    return (
      <>
        {/* Logo para light mode */}
        <Image
          src="/logo/SVG/full-logo-purple-black-2000x1500.svg"
          alt="Volta HR"
          width={size}
          height={size}
          className={`h-auto dark:hidden ${className}`}
        />
        {/* Logo para dark mode */}
        <Image
          src="/logo/SVG/full-logo-purple-white-2000x1500.svg"
          alt="Volta HR"
          width={size}
          height={size}
          className={`h-auto hidden dark:block ${className}`}
        />
      </>
    )
  }

  // Show company logo
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 0.75 }}>
      <Image
        src={logoUrl}
        alt={companyName}
        fill
        className="object-contain"
        unoptimized={logoUrl.startsWith('/api/')}
        onError={() => {
          console.error('[CompanyLogoDisplay] Failed to load logo:', logoUrl)
          // Fallback to platform logo on error
          setLogoUrl(null)
        }}
      />
    </div>
  )
}

/**
 * Compact version for mobile drawer
 */
export function CompanyLogoCompact() {
  const { user } = useSession()
  const [companyName, setCompanyName] = React.useState<string>('Volta HR')

  React.useEffect(() => {
    async function fetchCompanyData() {
      try {
        const response = await fetch('/api/proxy?endpoint=/api/company', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setCompanyName(data.data.name || 'Volta HR')
          }
        }
      } catch (error) {
        console.error('Failed to fetch company data:', error)
      }
    }

    if (user && user.role !== 'platform_owner') {
      fetchCompanyData()
    }
  }, [user])

  return (
    <h2 className="text-lg font-bold">{companyName}</h2>
  )
}
