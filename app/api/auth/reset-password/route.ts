import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'
import { AUTH_ENDPOINTS } from '@/lib/auth/utils'

/**
 * Reset Password API Route
 * Proxies request to backend Go API without requiring CSRF token from client
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		
		// Validate required fields
		if (!body.token || typeof body.token !== 'string') {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'Token is required' },
				{ status: 400 }
			)
		}
		
		if (!body.new_password || typeof body.new_password !== 'string') {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'New password is required' },
				{ status: 400 }
			)
		}

		// Forward request to backend
		const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: body.token,
				new_password: body.new_password,
			}),
		})

		const data = await response.json()

		// Forward backend response with same status code
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('[API:reset-password] Error:', error)
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
