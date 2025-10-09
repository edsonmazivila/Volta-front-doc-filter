import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

interface Params { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params): Promise<Response> {
    const { id } = await params
	const cookie = request.headers.get('cookie') || ''
	const res = await fetch(`${API_BASE_URL}/api/notifications/${encodeURIComponent(id)}/read`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
		body: JSON.stringify({}),
	})
	const text = await res.text()
	const body = text ? (() => { try { return JSON.parse(text) } catch { return { data: text } } })() : {}
	return NextResponse.json(body, { status: res.status })
}


