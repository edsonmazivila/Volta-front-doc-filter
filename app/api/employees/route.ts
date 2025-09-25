import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'

export async function GET(request: Request) {
	const url = new URL(request.url)
	const qs = url.search
	const cookieStore = await cookies()
	const session = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value
	const refresh = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value
	const cookieHeader = [
		session ? `${COOKIE_NAMES.SESSION_TOKEN}=${session}` : null,
		refresh ? `${COOKIE_NAMES.REFRESH_TOKEN}=${refresh}` : null,
	].filter(Boolean).join('; ')

	const upstream = await fetch(`${API_BASE_URL}/api/employees${qs}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader ? { Cookie: cookieHeader } : {}),
		},
		cache: 'no-store',
	})

	const text = await upstream.text()
	const contentType = upstream.headers.get('content-type') || 'application/json'
	return new NextResponse(text, {
		status: upstream.status,
		headers: {
			'content-type': contentType,
		},
	})
}


