import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/dal'

export async function GET() {
	const session = await verifySession()
	if (!session?.user) return new NextResponse(null, { status: 401 })

    const role = session.user.role || ''
    const ROLE_PERMISSIONS = {
        admin: ['user:create', 'user:delete', 'payroll:process', 'reports:view'],
        system_admin: ['user:create', 'user:delete', 'payroll:process', 'reports:view'],
        hr: ['user:view', 'payroll:process', 'reports:view'],
        employee: ['profile:view', 'timesheet:submit']
    } as const

    const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || []

	return NextResponse.json({ role, permissions, context: {} })
}


