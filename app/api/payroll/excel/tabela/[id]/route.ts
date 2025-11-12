import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL, COOKIE_NAMES } from '@/lib/config'
import { hasAnyRole } from '@/lib/rbac/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const searchParams = request.nextUrl.searchParams
		const mes = searchParams.get('mes')
		
		// Validate input
		if (!id || typeof id !== 'string' || id.trim().length === 0) {
			return NextResponse.json({ error: 'Invalid payroll run ID' }, { status: 400 })
		}

		// Check authentication and authorization
		const cookieStore = await cookies()
		const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)

		if (!sessionToken) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Verify user has permission to export payroll
		const hasPermission = await hasAnyRole(['payroll_manager', 'system_admin'])
		if (!hasPermission) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		let url = `${API_BASE_URL}/api/payroll/excel/tabela/${id}`
		if (mes) {
			url += `?mes=${encodeURIComponent(mes)}`
		}

		const response = await fetch(url, {
			headers: {
				Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
			},
		})

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to export Tabela payroll' },
				{ status: response.status }
			)
		}

		// Get headers from backend
		const contentType = response.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		const contentDisposition = response.headers.get('content-disposition') || `attachment; filename="payroll-tabela-${id}.xlsx"`
		const buffer = await response.arrayBuffer()

		const headers: Record<string, string> = {
			'Content-Type': contentType,
		}

		if (contentDisposition) {
			headers['Content-Disposition'] = contentDisposition
		}

		return new NextResponse(buffer, { headers })
	} catch (error) {
		console.error('Tabela payroll export error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

