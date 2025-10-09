import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

interface Params { params: Promise<{ id: string }> }

export async function DELETE(request: Request, { params }: Params): Promise<Response> {
    const { id } = await params
	const cookie = request.headers.get('cookie') || ''
	const res = await fetch(`${API_BASE_URL}/api/notifications/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
	})
	const text = await res.text()
	const body = text ? (() => { try { return JSON.parse(text) } catch { return { data: text } } })() : {}
	return NextResponse.json(body, { status: res.status })
}


