import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'

export async function POST(request: NextRequest) {
	try {
		const cookieStore = await cookies()
		const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)

		if (!sessionToken) {
			console.error('[Photo Upload Proxy] No session token found')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Get the form data from the request - this reads the multipart data
		const formData = await request.formData()
		
		// Create a new FormData to send to backend
		const backendFormData = new FormData()
		const photo = formData.get('photo')
		
		if (photo && photo instanceof File) {
			backendFormData.append('photo', photo)
		}
		
		console.log('[Photo Upload Proxy] Uploading to backend:', {
			url: `${API_BASE_URL}/api/auth/profile/photo`,
			hasPhoto: !!photo,
			photoName: photo instanceof File ? photo.name : 'N/A',
			photoSize: photo instanceof File ? photo.size : 'N/A'
		})

		// Forward the request to the backend API
		const response = await fetch(`${API_BASE_URL}/api/auth/profile/photo`, {
			method: 'POST',
			headers: {
				Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
			},
			body: backendFormData,
		})
		
		console.log('[Photo Upload Proxy] Backend response:', {
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries(response.headers.entries())
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[Photo Upload Proxy] Backend returned error:', {
				status: response.status,
				errorText
			})
			
			let errorData: { error?: string; message?: string; status?: number; code?: string; timestamp?: string } = { error: 'Failed to upload photo' }
			try {
				errorData = JSON.parse(errorText)
			} catch {
				errorData = { 
					status: response.status,
					code: 'UPLOAD_ERROR',
					message: errorText || 'Failed to upload photo',
					timestamp: new Date().toISOString()
				}
			}
			return NextResponse.json(errorData, { status: response.status })
		}

		const data = await response.json()
		console.log('[Photo Upload Proxy] Success:', data)
		return NextResponse.json(data)
	} catch (error) {
		console.error('[Photo Upload Proxy] Exception:', error)
		return NextResponse.json(
			{ 
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error',
				code: 'PROXY_ERROR',
				status: 500,
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		)
	}
}
