import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'

export async function GET() {
	try {
		const cookieStore = await cookies()
		const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)

		if (!sessionToken) {
			console.error('[Company Proxy] No session token found')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		console.log('[Company Proxy] Fetching company data from backend')

		const response = await fetch(`${API_BASE_URL}/api/company`, {
			headers: {
				'Content-Type': 'application/json',
				Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
			},
		})

		console.log('[Company Proxy] Backend response:', {
			status: response.status,
			statusText: response.statusText
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[Company Proxy] Backend error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to fetch company' },
				{ status: response.status }
			)
		}

		const data = await response.json()
		console.log('[Company Proxy] Success, has logo_path:', !!data?.data?.logo_path || !!data?.logo_path)
		
		return NextResponse.json({ success: true, data })
	} catch (error) {
		console.error('[Company Proxy] Exception:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
