'use server'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { handleServiceError } from '@/lib/http/error-handler'

export interface ReportsListItem {
	id: string
	name: string
	date: string
	type: string
}

export interface PayrollChartData {
	labels: string[]
	totalPayroll: number[]
	netPay: number[]
	taxes?: number[]
}

export interface EmployeeMetricsData {
	employmentTypes: { labels: string[]; data: number[]; colors?: string[] }
	summary?: { totalEmployees?: number; activeEmployees?: number; newHiresThisMonth?: number; avgTenure?: number; turnoverRate?: number }
	departmentDistribution?: { labels: string[]; data: number[]; colors?: string[] }
}

export interface TaxTrendData {
	labels: string[]
	federalTax?: number[]
	stateTax?: number[]
	socialSecurity?: number[]
	medicare?: number[]
	futa?: number[]
	suta?: number[]
}

async function doGetJson<T>(url: string, headers: Record<string,string>): Promise<T | null> {
	const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' })
	if (!res.ok) return null
	const ct = res.headers.get('content-type') || ''
	if (!ct.includes('application/json')) return null
	return await res.json().catch(() => null)
}

// Prefer JSON endpoints; backend may not have them yet. Return safe defaults if unavailable.
export async function fetchReportsList(): Promise<ReportsListItem[]> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string,string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader
		const json = await doGetJson<{ data?: any[]; reports?: any[] }>(`${API_BASE_URL}/api/reports/list`, headers)
		const raw = json?.data || json?.reports || []
		return (raw as any[]).map(r => ({
			id: String(r.id ?? r.report_id ?? r.name ?? ''),
			name: String(r.name ?? r.title ?? 'Report'),
			date: String(r.date ?? r.created_at ?? ''),
			type: String(r.type ?? r.format ?? 'PDF')
		}))
	} catch (error) {
		return handleServiceError(error, 'fetchReportsList', 'Failed to load reports list')
	}
}

export async function fetchPayrollChart(period: string = 'monthly'): Promise<PayrollChartData> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string,string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader
		const url = `${API_BASE_URL}/api/reports/payroll-stats?period=${encodeURIComponent(period)}`
		const json = await doGetJson<{ data?: PayrollChartData }>(url, headers)
		if (json?.data) return json.data
		// Fallback defaults
		return { labels: [], totalPayroll: [], netPay: [] }
	} catch (error) {
		return handleServiceError(error, 'fetchPayrollChart', 'Failed to load payroll stats')
	}
}

export async function fetchEmployeeMetrics(): Promise<EmployeeMetricsData> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string,string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader
		const json = await doGetJson<{ data?: EmployeeMetricsData }>(`${API_BASE_URL}/api/reports/employee-metrics`, headers)
		if (json?.data) return json.data
		return { employmentTypes: { labels: [], data: [] } }
	} catch (error) {
		return handleServiceError(error, 'fetchEmployeeMetrics', 'Failed to load employee metrics')
	}
}

export async function fetchTaxTrend(period: string = 'monthly'): Promise<TaxTrendData> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string,string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader
		const url = `${API_BASE_URL}/api/reports/tax-liability-trend?period=${encodeURIComponent(period)}`
		const json = await doGetJson<{ data?: TaxTrendData }>(url, headers)
		if (json?.data) return json.data
		return { labels: [] }
	} catch (error) {
		return handleServiceError(error, 'fetchTaxTrend', 'Failed to load tax trend')
	}
}


