import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const cookieHeader = request.headers.get('cookie') || ''
		const res = await fetch(`${API_BASE_URL}/api/documents/${id}/download`, {
			headers: {
				...(cookieHeader && { Cookie: cookieHeader }),
			},
		})

		if (!res.ok) {
			return NextResponse.json({ error: 'Failed to download document' }, { status: res.status })
		}

		const contentType = res.headers.get('content-type') || 'application/octet-stream'
		const contentDisposition = res.headers.get('content-disposition') || undefined
		const buffer = await res.arrayBuffer()

		const headers: Record<string, string> = { 'Content-Type': contentType }
		if (contentDisposition) headers['Content-Disposition'] = contentDisposition

		return new NextResponse(buffer, { headers })
	} catch {
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}


