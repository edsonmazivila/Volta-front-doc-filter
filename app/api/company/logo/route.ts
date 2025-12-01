import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'

export async function POST(request: NextRequest) {
	try {
		const cookieStore = await cookies()
		const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)

		if (!sessionToken) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Get the form data from the request
		const formData = await request.formData()

		// Forward the request to the backend API
		const response = await fetch(`${API_BASE_URL}/api/company/logo`, {
			method: 'POST',
			headers: {
				Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
			},
			body: formData,
		})

		if (!response.ok) {
			const errorText = await response.text()
			let errorMessage = 'Failed to upload logo'
			try {
				const errorJson = JSON.parse(errorText)
				errorMessage = errorJson.message || errorJson.error || errorMessage
			} catch {
				// Use default error message
			}
			return NextResponse.json(
				{ error: errorMessage },
				{ status: response.status }
			)
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Logo upload proxy error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
