import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

export async function GET(request: Request): Promise<Response> {
	const cookie = request.headers.get('cookie') || ''
	const res = await fetch(`${API_BASE_URL}/api/notifications/count`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
	})
	const text = await res.text()
	const body = text ? (() => { try { return JSON.parse(text) } catch { return { data: text } } })() : {}
	return NextResponse.json(body, { status: res.status })
}


