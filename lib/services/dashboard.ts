'use server'
import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'
import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '@/lib/config'
import { API_BASE_URL } from '@/lib/config'

const DASHBOARD_ENDPOINTS = {
	EMPLOYEES_STATS: '/api/employees/stats',
	TIMESHEETS_STATS: '/api/timesheets/stats',
	PAYROLL_STATS: '/payroll/stats',
} as const

export interface DashboardStats {
	TotalEmployees: number
	PendingTimesheets: number
	MonthlyPayroll: number
}

interface EmployeesStatsResponse {
	total?: number
	data?: { total?: number }
}

interface TimesheetsStatsResponse {
	pending?: number
	data?: { pending?: number }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
	try {
		// Forward auth cookies to backend
		const cookieStore = await cookies()
		const session = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value
		const refresh = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value
		const cookieHeader = [
			session ? `${COOKIE_NAMES.SESSION_TOKEN}=${session}` : null,
			refresh ? `${COOKIE_NAMES.REFRESH_TOKEN}=${refresh}` : null,
		].filter(Boolean).join('; ')
		const commonHeaders: Record<string, string> | undefined = cookieHeader ? { Cookie: cookieHeader } : undefined

	    const [employeesStats, timesheetsStats] = await Promise.all([
			apiClient.get<EmployeesStatsResponse>(DASHBOARD_ENDPOINTS.EMPLOYEES_STATS, undefined, { retries: 3, headers: commonHeaders }),
			apiClient.get<TimesheetsStatsResponse>(DASHBOARD_ENDPOINTS.TIMESHEETS_STATS, undefined, { retries: 3, headers: commonHeaders }),
		])

		const totalEmployees = employeesStats?.total ?? employeesStats?.data?.total ?? 0
		const pendingTimesheets = timesheetsStats?.pending ?? timesheetsStats?.data?.pending ?? 0

		// Fetch payroll stats from legacy web endpoint; be tolerant of response shape
		let monthlyPayroll = 0
		try {
			const res = await fetch(`${API_BASE_URL}${DASHBOARD_ENDPOINTS.PAYROLL_STATS}`, {
				method: 'GET',
				headers: {
					...(commonHeaders || {}),
					'Accept': 'application/json, text/plain;q=0.9, */*;q=0.1'
				},
				cache: 'no-store'
			})
			if (res.ok) {
				const contentType = res.headers.get('content-type') || ''
				if (contentType.includes('application/json')) {
					const data = await res.json().catch(() => null)
					const val = (data?.data?.monthly_total ?? data?.monthly_total ?? data?.total ?? 0) as number
					monthlyPayroll = Number(val) || 0
				} else {
					const text = await res.text()
					const num = parseFloat(text.replace(/[^0-9.-]/g, ''))
					monthlyPayroll = isFinite(num) ? num : 0
				}
			}
		} catch {}

		return {
			TotalEmployees: Number(totalEmployees) || 0,
			PendingTimesheets: Number(pendingTimesheets) || 0,
			MonthlyPayroll: Number(monthlyPayroll) || 0,
		}
	} catch (error) {
		return handleServiceError(error, 'fetchDashboardStats', 'Failed to fetch dashboard stats')
	}
}


