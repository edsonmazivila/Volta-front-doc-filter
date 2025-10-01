import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AUTH_ENDPOINTS } from './utils'
import { getAuthCookieHeader } from './server-utils'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'
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
		cache: 'no-store',
	})

	if (!res.ok) {
		// Session expired or invalid - delete the cookie
		const cookieStore = await cookies()
		cookieStore.delete(COOKIE_NAMES.SESSION_TOKEN)
		cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN)
		return null
	}

	const data = await res.json().catch(() => null)
	const user = data?.data?.user || data?.data || data?.user
	if (!user) return null
	return { user }
})

export async function getUser(): Promise<User | null> {
	const session = await verifySession()
	return session?.user ?? null
}

export async function requireUser(redirectTo: string = '/login'): Promise<User> {
	const session = await verifySession()
	if (!session?.user) redirect(redirectTo)
	return session.user
}


