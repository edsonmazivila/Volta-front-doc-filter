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
			console.error('[Company Logo GET Proxy] No session token')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { filename } = await params
		
		console.log('[Company Logo GET Proxy] Fetching logo:', {
			filename,
			url: `${API_BASE_URL}/api/company/logo/${filename}`
		})

		// Forward the request to the backend API
		const response = await fetch(
			`${API_BASE_URL}/api/company/logo/${filename}`,
			{
				headers: {
					Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
				},
			}
		)

		console.log('[Company Logo GET Proxy] Backend response:', {
			status: response.status,
			statusText: response.statusText,
			redirected: response.redirected,
			contentType: response.headers.get('Content-Type')
		})

		if (!response.ok) {
			console.error('[Company Logo GET Proxy] Not OK response')
			return NextResponse.json(
				{ error: 'Logo not found' },
				{ status: response.status }
			)
		}

		// For S3, backend will redirect to presigned URL
		if (response.redirected || response.status === 302) {
			console.log('[Company Logo GET Proxy] Redirecting to:', response.url)
			return NextResponse.redirect(response.url)
		}

		// For local storage, stream the file
		const blob = await response.blob()
		const headers = new Headers()
		headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png')
		headers.set('Cache-Control', 'public, max-age=3600')

		console.log('[Company Logo GET Proxy] Returning blob, size:', blob.size)
		return new NextResponse(blob, { headers })
	} catch (error) {
		console.error('[Company Logo GET Proxy] Exception:', error)
		return NextResponse.json(
			{ error: 'Failed to download logo' },
			{ status: 500 }
		)
	}
}
