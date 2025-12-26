import { NextRequest, NextResponse } from 'next/server'
import { getUsersByCompany } from '@/lib/services/users'

/**
 * Proxy endpoint for client-side components to fetch users
 * This allows client components to use server-side authentication
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const company_id = searchParams.get('company_id')

    const result = await getUsersByCompany(
      company_id ? { company_id } : undefined
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API /proxy/users] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
