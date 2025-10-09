import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

export async function GET(request: Request): Promise<Response> {
	const { searchParams } = new URL(request.url)
	const limit = searchParams.get('limit') || '10'
	const url = new URL(`${API_BASE_URL}/api/notifications`)
	url.searchParams.set('limit', limit)

	// forward cookies to backend to keep auth context
	const cookie = request.headers.get('cookie') || ''
	const res = await fetch(url.toString(), {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
	})

	const text = await res.text()
	const body = text ? (() => { try { return JSON.parse(text) } catch { return { data: text } } })() : {}
	return NextResponse.json(body, { status: res.status })
}


