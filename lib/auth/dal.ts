import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_ENDPOINTS } from './utils'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'
import type { User } from './types'


interface Session {
	user: User
}

export const verifySession = cache(async (): Promise<Session | null> => {
	const cookieStore = await cookies()
	const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value
	const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value
	if (!sessionToken) return null

	const cookieHeader = [
		`${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken}`,
		refreshToken ? `${COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}` : null,
	].filter(Boolean).join('; ')

	const res = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.PROFILE}` , {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Cookie': cookieHeader,
		},
		cache: 'no-store',
	})

	if (!res.ok) return null
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


