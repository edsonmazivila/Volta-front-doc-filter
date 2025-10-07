import 'server-only'
import { verifySession } from '@/lib/auth/dal'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/lib/auth/types'

/**
 * Server-side function to require specific roles
 * Redirects if user doesn't have required role
 */
export async function requireRole(roles: UserRole[], redirectTo: string = '/dashboard') {
	const session = await verifySession()
	const role = session?.user?.role

	if (!role) {
		redirect('/login')
	}

	if (!roles.includes(role)) {
		redirect(redirectTo)
	}

	return session!.user
}

/**
 * Server-side function to check if user has any of the specified roles
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
	const session = await verifySession()
	const role = session?.user?.role
	return !!role && roles.includes(role)
}


