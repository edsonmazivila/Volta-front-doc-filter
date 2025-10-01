'use server'
import { handleServiceError } from '@/lib/http/error-handler'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
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
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}
		if (cookieHeader) {
			headers['Cookie'] = cookieHeader
		}

		// Fetch stats from backend API using native fetch (server-side)
		const [employeesRes, timesheetsRes] = await Promise.all([
			fetch(`${API_BASE_URL}${DASHBOARD_ENDPOINTS.EMPLOYEES_STATS}`, {
				method: 'GET',
				headers,
				cache: 'no-store',
			}),
			fetch(`${API_BASE_URL}${DASHBOARD_ENDPOINTS.TIMESHEETS_STATS}`, {
				method: 'GET',
				headers,
				cache: 'no-store',
			}),
		])

		let totalEmployees = 0
		let pendingTimesheets = 0

		if (employeesRes.ok) {
			const employeesData = await employeesRes.json().catch(() => ({}))
			totalEmployees = employeesData?.total ?? employeesData?.data?.total ?? 0
		}

		if (timesheetsRes.ok) {
			const timesheetsData = await timesheetsRes.json().catch(() => ({}))
			pendingTimesheets = timesheetsData?.pending ?? timesheetsData?.data?.pending ?? 0
		}

		// Fetch payroll stats from legacy web endpoint; be tolerant of response shape
		let monthlyPayroll = 0
		try {
			const res = await fetch(`${API_BASE_URL}${DASHBOARD_ENDPOINTS.PAYROLL_STATS}`, {
				method: 'GET',
				headers: {
					...headers,
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


