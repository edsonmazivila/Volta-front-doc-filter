import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const cookieHeader = request.headers.get('cookie') || ''
		const res = await fetch(`${API_BASE_URL}/api/paystubs/${id}/pdf`, {
			headers: {
				...(cookieHeader && { Cookie: cookieHeader }),
			},
		})

		if (!res.ok) {
			return NextResponse.json({ error: 'Failed to download paystub' }, { status: res.status })
		}

		const contentType = res.headers.get('content-type') || 'application/pdf'
		const contentDisposition = res.headers.get('content-disposition') || `attachment; filename="paystub-${id}.pdf"`
		const buffer = await res.arrayBuffer()

		return new NextResponse(buffer, {
			headers: {
				'Content-Type': contentType,
				'Content-Disposition': contentDisposition,
			},
		})
	} catch {
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}


