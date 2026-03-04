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
		const token = typeof body?.token === 'string' ? body.token.trim() : ''
		const newPassword = typeof body?.new_password === 'string' ? body.new_password : ''
		
		// Validate required fields
		if (!token) {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'Token is required' },
				{ status: 400 }
			)
		}
		
		if (!newPassword) {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'New password is required' },
				{ status: 400 }
			)
		}

		// Validate token format early to avoid backend generic 500 errors
		if (token.length < 32) {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'Invalid reset token' },
				{ status: 400 }
			)
		}

		// Validate password strength
		if (newPassword.length < 8) {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'Password must be at least 8 characters' },
				{ status: 400 }
			)
		}
		if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
			return NextResponse.json(
				{ status: 400, code: 'BAD_REQUEST', message: 'Password must contain uppercase, lowercase, and number' },
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
				token,
				new_password: newPassword,
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
