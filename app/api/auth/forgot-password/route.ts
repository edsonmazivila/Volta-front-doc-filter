import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'
import { AUTH_ENDPOINTS } from '@/lib/auth/utils'

/**
 * Forgot Password API Route
 * Proxies request to backend Go API without requiring CSRF token from client
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const email = typeof body?.email === 'string' ? body.email.trim() : ''
		
		// Validate email is present
		if (!email) {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'Email is required' },
				{ status: 400 }
			)
		}

		// Validate email format to avoid backend generic 500 errors
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'Invalid email address' },
				{ status: 400 }
			)
		}

		const backendUrl = `${API_BASE_URL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`
		console.log('[API:forgot-password] Calling backend:', backendUrl)

		// Forward request to backend
		const response = await fetch(backendUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		})

		console.log('[API:forgot-password] Backend response status:', response.status)
		
		const data = await response.json()
		console.log('[API:forgot-password] Backend response data:', data)

		// Forward backend response with same status code
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('[API:forgot-password] Error:', error)
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
