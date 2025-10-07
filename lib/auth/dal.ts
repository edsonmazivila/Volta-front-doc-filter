import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { AUTH_ENDPOINTS } from './utils'
import { getAuthCookieHeader } from './server-utils'
import { API_BASE_URL } from '@/lib/config'
import type { User } from './types'


interface Session {
	user: User
}

export const verifySession = cache(async (): Promise<Session | null> => {
	const cookieHeader = await getAuthCookieHeader()
	if (!cookieHeader) return null

	const res = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.PROFILE}` , {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Cookie': cookieHeader,
		},
		next: { revalidate: 0 }, // Don't cache auth checks
	})

	if (!res.ok) {
		// Session expired or invalid - just return null
		// Cookie deletion happens in logout route or will expire naturally
		return null
	}

	const data = await res.json().catch(() => null)
	const user = data?.data?.user || data?.data || data?.user
	if (!user) return null

	// Normalize backend role aliases to our 5-role set
	const rawRole = (user.role || '').toString().toLowerCase()
	const roleMap: Record<string, User['role']> = {
		admin: 'system_admin',
		manager: 'operational_manager',
	}
	const normalizedRole = (roleMap[rawRole] || rawRole) as User['role']

	return { user: { ...user, role: normalizedRole } }
})

export async function getUser(): Promise<User | null> {
	const session = await verifySession()
	return session?.user ?? null
}

export async function requireUser(redirectTo: string = '/login'): Promise<User> {
	const session = await verifySession()
	if (!session?.user) {
		// Cannot delete cookies here (Server Component context)
		// Cookie will be handled by middleware or expire naturally
		redirect(redirectTo)
	}
	return session.user
}


