'use server'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { handleServiceError } from '@/lib/http/error-handler'

export interface TimesheetEntry {
	date: string
	hours: number
	overtimeHours?: number
}

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface TimesheetListItem {
	id: string
	employeeName: string
	periodStart: string
	periodEnd: string
	status: TimesheetStatus
	totalHours: number
	submittedAt?: string
	notes?: string
}

interface TimesheetListResponseShape {
	data?: TimesheetListItem[]
	timesheets?: TimesheetListItem[]
}

export async function fetchTimesheets(): Promise<TimesheetListItem[]> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string, string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader

		const res = await fetch(`${API_BASE_URL}/api/timesheets`, {
			method: 'GET',
			headers,
			cache: 'no-store',
		})
		if (!res.ok) {
			throw new Error(`Failed to fetch timesheets: ${res.status}`)
		}
		const json: TimesheetListResponseShape & { items?: unknown[] } = await res.json().catch(() => ({} as TimesheetListResponseShape))
		const raw = json.data || json.timesheets || json.items || []
		return (raw as any[]).map((t) => {
			// Normalize employee name from various shapes
			const emp = t.employee || t.user || t.employee_info || undefined
			const empUser = emp?.user || undefined
			const first = empUser?.first_name ?? emp?.first_name ?? empUser?.firstName ?? emp?.firstName ?? undefined
			const last = empUser?.last_name ?? emp?.last_name ?? empUser?.lastName ?? emp?.lastName ?? undefined
			const joined = [first, last].filter(Boolean).join(' ')
			const nameField = emp?.name ?? emp?.full_name ?? emp?.fullName ?? undefined
			const email = empUser?.email ?? emp?.email ?? t.employee_email ?? t.email ?? undefined
			const employeeNameSource = (
				t.employeeName ?? t.employee_name ?? nameField ?? (joined || email || t.employee || '—')
			)
			const employeeName: string = String(employeeNameSource)

			const periodStart = String(t.pay_period_start ?? t.periodStart ?? t.period_start ?? t.start_date ?? t.start ?? '')
			const periodEnd = String(t.pay_period_end ?? t.periodEnd ?? t.period_end ?? t.end_date ?? t.end ?? '')
			const submittedAtRaw = t.submittedAt ?? t.submitted_at ?? t.submitted ?? undefined
			const submittedAt = submittedAtRaw ? String(submittedAtRaw) : undefined

			return {
				id: String(t.id ?? t.ts_id ?? t.uuid ?? ''),
				employeeName,
				periodStart,
				periodEnd,
				status: (t.status ?? 'draft') as TimesheetStatus,
				totalHours: Number(t.totalHours ?? t.total_hours ?? t.hours ?? 0) || 0,
				submittedAt,
				notes: (t.notes ?? t.note ?? undefined) as string | undefined,
			}
		})
	} catch (error) {
		return handleServiceError(error, 'fetchTimesheets', 'Failed to load timesheets')
	}
}


