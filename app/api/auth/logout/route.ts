import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'
import { AUTH_ENDPOINTS } from '@/lib/auth/utils'

export async function POST() {
	const cookieStore = await cookies()

	// Best-effort call to backend logout
	try {
		await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		})
	} catch {}

	// Clear session cookie on our domain
	cookieStore.set(COOKIE_NAMES.SESSION_TOKEN, '', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 0
	})

	return NextResponse.json({ success: true })
}


