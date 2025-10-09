import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

export async function PUT(request: Request): Promise<Response> {
	const cookie = request.headers.get('cookie') || ''
	const res = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
		body: JSON.stringify({}),
	})
	const text = await res.text()
	const body = text ? (() => { try { return JSON.parse(text) } catch { return { data: text } } })() : {}
	return NextResponse.json(body, { status: res.status })
}


