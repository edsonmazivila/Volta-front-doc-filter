import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ filename: string }> }
) {
	try {
		const cookieStore = await cookies()
		const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)

		if (!sessionToken) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { filename } = await params

		// Forward the request to the backend API
		const response = await fetch(
			`${API_BASE_URL}/api/auth/profile/photo/${filename}`,
			{
				headers: {
					Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
				},
			}
		)

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Photo not found' },
				{ status: response.status }
			)
		}

		// For S3, backend will redirect to presigned URL
		if (response.redirected || response.status === 302) {
			return NextResponse.redirect(response.url)
		}

		// For local storage, stream the file
		const blob = await response.blob()
		const headers = new Headers()
		headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png')
		headers.set('Cache-Control', 'public, max-age=3600')

		return new NextResponse(blob, { headers })
	} catch (error) {
		console.error('Profile photo download error:', error)
		return NextResponse.json(
			{ error: 'Failed to download photo' },
			{ status: 500 }
		)
	}
}
