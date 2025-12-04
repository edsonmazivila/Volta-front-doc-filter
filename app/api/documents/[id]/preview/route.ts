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
			`${API_BASE_URL}/api/documents/${id}/preview`,
			{
				headers: {
					Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
				},
			}
		)

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch preview' },
				{ status: response.status }
			)
		}

		// Get the content type from the backend response
		const contentType = response.headers.get('content-type') || 'application/pdf'
		const buffer = await response.arrayBuffer()

		return new NextResponse(buffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'private, max-age=3600',
			},
		})
	} catch (error) {
		console.error('Preview proxy error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}


