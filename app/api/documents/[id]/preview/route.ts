import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const cookieHeader = request.headers.get('cookie') || ''
		const res = await fetch(`${API_BASE_URL}/api/documents/${id}/preview`, {
			headers: {
				...(cookieHeader && { Cookie: cookieHeader }),
			},
		})

		if (!res.ok) {
			return NextResponse.json({ error: 'Failed to fetch preview' }, { status: res.status })
		}

		const contentType = res.headers.get('content-type') || 'application/pdf'
		const buffer = await res.arrayBuffer()
		return new NextResponse(buffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'private, max-age=3600',
			},
		})
	} catch {
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}


