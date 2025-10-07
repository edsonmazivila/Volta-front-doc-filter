'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_NAMES, API_BASE_URL } from '@/lib/config'
import { AUTH_ENDPOINTS } from './utils'

/**
 * Server Action to logout user and clear cookies
 */
export async function logoutAction() {
	const cookieStore = await cookies()

	// Best-effort call to backend logout
	try {
		const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value
		if (sessionToken) {
			await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cookie': `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken}`
				},
			})
		}
	} catch {
		// Ignore logout API errors
	}

	// Clear cookies
	cookieStore.delete(COOKIE_NAMES.SESSION_TOKEN)
	cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN)

	// Redirect to login
	redirect('/login')
}
