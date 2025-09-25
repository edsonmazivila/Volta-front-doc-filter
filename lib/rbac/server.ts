import 'server-only'
import { verifySession } from '@/lib/auth/dal'
import { redirect } from 'next/navigation'
import type { Role } from './types'

export async function requireRole(roles: Role[] , redirectTo: string = '/login') {
	const session = await verifySession()
	const role = session?.user?.role as Role | undefined
	if (!role) redirect(redirectTo)
	if (!roles.includes(role)) redirect('/unauthorized')
	return session!.user
}

export async function hasAnyRole(roles: Role[]): Promise<boolean> {
	const session = await verifySession()
	const role = session?.user?.role as Role | undefined
	return !!role && roles.includes(role)
}


