import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'
import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '@/lib/config'

/**
 * Change Password API Route
 * Proxies authenticated request to backend Go API
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		
		// Validate required fields
		if (!body.current_password || typeof body.current_password !== 'string') {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'Current password is required' },
				{ status: 400 }
			)
		}
		
		if (!body.new_password || typeof body.new_password !== 'string') {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'New password is required' },
				{ status: 400 }
			)
		}

		// Get session cookie
		const cookieStore = await cookies()
		const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value

		if (!sessionToken) {
			return NextResponse.json(
				{ status: 401, code: 'UNAUTHORIZED', message: 'Authentication required' },
				{ status: 401 }
			)
		}

		const backendUrl = `${API_BASE_URL}/api/auth/change-password`
		console.log('[API:change-password] Calling backend:', backendUrl)

		// Forward request to backend with session cookie
		const response = await fetch(backendUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Cookie': `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken}`,
			},
			body: JSON.stringify({
				current_password: body.current_password,
				new_password: body.new_password,
			}),
		})

		console.log('[API:change-password] Backend response status:', response.status)
		
		const data = await response.json()
		console.log('[API:change-password] Backend response data:', data)

		// Forward backend response with same status code
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('[API:change-password] Error:', error)
		return NextResponse.json(
			{
				status: 500,
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while processing your request',
			},
			{ status: 500 }
		)
	}
}
