'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/lib/rbac/hooks'
import type { UserRole } from '@/lib/auth/types'

interface ProtectedPageProps {
	children: React.ReactNode
	allowedRoles?: UserRole[]
	redirectTo?: string
}

/**
 * Client-side page protection component
 * Redirects user if they don't have the required role
 */
export function ProtectedPage({ children, allowedRoles, redirectTo = '/dashboard' }: ProtectedPageProps) {
	const { role, hasAnyRole } = usePermissions()
	const router = useRouter()

	useEffect(() => {
		// If no roles specified, allow access
		if (!allowedRoles || allowedRoles.length === 0) return

		// Check if user has required role
		if (!role || !hasAnyRole(allowedRoles)) {
			router.push(redirectTo)
		}
	}, [role, allowedRoles, hasAnyRole, router, redirectTo])

	// Don't render children if user doesn't have access
	if (allowedRoles && allowedRoles.length > 0 && (!role || !hasAnyRole(allowedRoles))) {
		return null
	}

	return <>{children}</>
}
