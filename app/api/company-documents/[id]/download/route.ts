import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const cookieStore = await cookies()
		const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)

		if (!sessionToken) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const response = await fetch(
			`${API_BASE_URL}/api/company-documents/${id}/download`,
			{
				headers: {
					Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
				},
			}
		)

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to download document' },
				{ status: response.status }
			)
		}

		// Get headers from backend
		const contentType = response.headers.get('content-type') || 'application/octet-stream'
		const contentDisposition = response.headers.get('content-disposition')
		const buffer = await response.arrayBuffer()

		const headers: Record<string, string> = {
			'Content-Type': contentType,
		}

		if (contentDisposition) {
			headers['Content-Disposition'] = contentDisposition
		}

		return new NextResponse(buffer, { headers })
	} catch (error) {
		console.error('Download proxy error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

