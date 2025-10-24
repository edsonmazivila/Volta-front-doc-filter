'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'
import { revalidateEntityMutation, CacheTags, fetchWithGracefulFallback } from '@/lib/cache-utils'

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface TimesheetListItem {
	id: string
	user_id?: string
	employeeId?: string
	employeeName: string
	pay_period_start: string
	pay_period_end: string
	periodStart: string
	periodEnd: string
	status: TimesheetStatus
	regular_hours?: number
	overtime_hours?: number
	sick_hours?: number
	vacation_hours?: number
	holiday_hours?: number
	regularHours?: number
	overtimeHours?: number
	totalHours: number
	total_hours: number
	submittedAt?: string
	notes?: string
}

interface TimesheetListResponseShape {
	data?: TimesheetListItem[]
	timesheets?: TimesheetListItem[]
}

// READ (cached)
export const getTimesheets = cache(async (): Promise<TimesheetListItem[]> => {
	return fetchWithGracefulFallback(
		async () => {
			const cookieHeader = await getAuthCookieHeader()
			const res = await fetch(`${API_BASE_URL}/api/timesheets`, {
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
				next: { tags: [CacheTags.TIMESHEETS], revalidate: 60 },
			})

			if (!res.ok) {
				throw new Error(`Failed to fetch timesheets: ${res.status}`)
			}

			const json: TimesheetListResponseShape & { items?: unknown[] } = await res.json().catch(() => ({} as TimesheetListResponseShape))
			const raw = json.data || json.timesheets || json.items || []
			
			interface RawTimesheet {
				id?: string | number;
				ts_id?: string | number;
				uuid?: string;
				user_id?: string;
				employee_id?: string;
				employeeId?: string;
				employee?: { id?: string; user?: { full_name?: string; email?: string }; full_name?: string; email?: string; name?: string };
				user?: { id?: string; user?: { full_name?: string; email?: string }; full_name?: string; email?: string; name?: string };
				employee_info?: { id?: string; user?: { full_name?: string; email?: string }; full_name?: string; email?: string; name?: string };
				employeeName?: string;
				employee_name?: string;
				employee_email?: string;
				email?: string;
				pay_period_start?: string;
				periodStart?: string;
				period_start?: string;
				start_date?: string;
				start?: string;
				pay_period_end?: string;
				periodEnd?: string;
				period_end?: string;
				end_date?: string;
				end?: string;
				submittedAt?: string;
				submitted_at?: string;
				submitted?: string;
				status?: string;
				regular_hours?: number;
				regularHours?: number;
				overtime_hours?: number;
				overtimeHours?: number;
				sick_hours?: number;
				vacation_hours?: number;
				holiday_hours?: number;
				total_hours?: number;
				totalHours?: number;
				hours?: number;
				notes?: string;
				note?: string;
			}
			
			return (raw as RawTimesheet[]).map((t) => {
				const emp = t.employee || t.user || t.employee_info || undefined
				const empUser = emp?.user || undefined
				const fullName = empUser?.full_name ?? emp?.full_name ?? undefined
				const nameField = emp?.name ?? emp?.full_name ?? undefined
				const email = empUser?.email ?? emp?.email ?? t.employee_email ?? t.email ?? undefined
				const employeeNameSource = (
					t.employeeName ?? t.employee_name ?? nameField ?? (fullName || email || '—')
				)
				const employeeName: string = String(employeeNameSource)

				const payPeriodStart = String(t.pay_period_start ?? t.periodStart ?? t.period_start ?? t.start_date ?? t.start ?? '')
				const payPeriodEnd = String(t.pay_period_end ?? t.periodEnd ?? t.period_end ?? t.end_date ?? t.end ?? '')
				const submittedAtRaw = t.submittedAt ?? t.submitted_at ?? t.submitted ?? undefined
				const submittedAt = submittedAtRaw ? String(submittedAtRaw) : undefined

				return {
					id: String(t.id ?? t.ts_id ?? t.uuid ?? ''),
					user_id: t.user_id ? String(t.user_id) : undefined,
					employeeId: t.employee_id ?? t.employeeId ?? emp?.id ?? undefined,
					employeeName,
					pay_period_start: payPeriodStart,
					pay_period_end: payPeriodEnd,
					periodStart: payPeriodStart,
					periodEnd: payPeriodEnd,
					status: ((t.status ?? 'draft') as TimesheetStatus),
					regular_hours: Number(t.regular_hours ?? t.regularHours ?? 0) || 0,
					overtime_hours: Number(t.overtime_hours ?? t.overtimeHours ?? 0) || 0,
					sick_hours: Number(t.sick_hours ?? 0) || 0,
					vacation_hours: Number(t.vacation_hours ?? 0) || 0,
					holiday_hours: Number(t.holiday_hours ?? 0) || 0,
					regularHours: Number(t.regular_hours ?? t.regularHours ?? 0) || 0,
					overtimeHours: Number(t.overtime_hours ?? t.overtimeHours ?? 0) || 0,
					total_hours: Number(t.total_hours ?? t.totalHours ?? t.hours ?? 0) || 0,
					totalHours: Number(t.total_hours ?? t.totalHours ?? t.hours ?? 0) || 0,
					submittedAt,
					notes: ((t.notes ?? t.note ?? undefined) as string | undefined),
				}
			})
		},
		[],
		{ errorContext: 'getTimesheets' }
	)
})

// Validation schemas
const upsertSchema = z.object({
	user_id: z.string().min(1, 'User is required'),
	pay_period_start: z.string().min(1, 'Pay period start is required'),
	pay_period_end: z.string().min(1, 'Pay period end is required'),
	total_hours: z.number().min(0, 'Total hours must be >= 0'),
	regular_hours: z.number().min(0, 'Regular hours must be >= 0').default(0),
	overtime_hours: z.number().min(0, 'Overtime hours must be >= 0').default(0),
	sick_hours: z.number().min(0, 'Sick hours must be >= 0').default(0),
	vacation_hours: z.number().min(0, 'Vacation hours must be >= 0').default(0),
	holiday_hours: z.number().min(0, 'Holiday hours must be >= 0').default(0),
	status: z.enum(['draft', 'submitted', 'approved', 'rejected']).default('draft'),
	notes: z.string().optional(),
})

export interface ActionResult {
	success?: boolean
	data?: unknown
	errors?: { _form?: string[]; [key: string]: string[] | undefined }
}

// MUTATIONS (server actions)
export async function createTimesheetAction(input: { user_id: string; pay_period_start: string; pay_period_end: string; total_hours: number; regular_hours?: number; overtime_hours?: number; sick_hours?: number; vacation_hours?: number; holiday_hours?: number; status?: 'draft' | 'submitted' | 'approved' | 'rejected'; notes?: string | null }): Promise<ActionResult> {
    const parsed = upsertSchema.safeParse({
        user_id: String(input.user_id || ''),
        pay_period_start: input.pay_period_start,
        pay_period_end: input.pay_period_end,
        total_hours: Number(input.total_hours),
        regular_hours: Number(input.regular_hours ?? 0),
        overtime_hours: Number(input.overtime_hours ?? 0),
        sick_hours: Number(input.sick_hours ?? 0),
        vacation_hours: Number(input.vacation_hours ?? 0),
        holiday_hours: Number(input.holiday_hours ?? 0),
        status: input.status || 'draft',
        notes: input.notes || undefined,
    })
	if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/timesheets`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
		body: JSON.stringify(parsed.data),
	})
	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		return { errors: { _form: [error.message || 'Failed to create timesheet'] } }
	}
	const data = await res.json()
	// Revalidate timesheets and all dependent caches
	revalidateEntityMutation('TIMESHEETS')
	return { success: true, data }
}

export async function updateTimesheetAction(id: string, input: { user_id: string; pay_period_start: string; pay_period_end: string; total_hours: number; regular_hours?: number; overtime_hours?: number; sick_hours?: number; vacation_hours?: number; holiday_hours?: number; status?: 'draft' | 'submitted' | 'approved' | 'rejected'; notes?: string | null }): Promise<ActionResult> {
    const parsed = upsertSchema.safeParse({
        user_id: String(input.user_id || ''),
        pay_period_start: input.pay_period_start,
        pay_period_end: input.pay_period_end,
        total_hours: Number(input.total_hours),
        regular_hours: Number(input.regular_hours ?? 0),
        overtime_hours: Number(input.overtime_hours ?? 0),
        sick_hours: Number(input.sick_hours ?? 0),
        vacation_hours: Number(input.vacation_hours ?? 0),
        holiday_hours: Number(input.holiday_hours ?? 0),
        status: input.status || 'draft',
        notes: input.notes || undefined,
    })
	if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
		body: JSON.stringify(parsed.data),
	})
	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		return { errors: { _form: [error.message || 'Failed to update timesheet'] } }
	}
	const data = await res.json()
	// Revalidate timesheets and all dependent caches
	revalidateEntityMutation('TIMESHEETS')
	return { success: true, data }
}

export async function deleteTimesheetAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
	})
	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to delete timesheet')
	}
	// Revalidate timesheets and all dependent caches
	revalidateEntityMutation('TIMESHEETS')
}

export async function submitTimesheetAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}/submit`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
		body: JSON.stringify({}),
	})
	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to submit timesheet')
	}
	// Revalidate timesheets and all dependent caches
	revalidateEntityMutation('TIMESHEETS')
}

export async function approveTimesheetAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}/approve`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
		body: JSON.stringify({}),
	})
	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to approve timesheet')
	}
	// Revalidate timesheets and all dependent caches
	revalidateEntityMutation('TIMESHEETS')
}

export async function rejectTimesheetAction(id: string, reason?: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}/reject`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
		body: JSON.stringify({ reason }),
	})
	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to reject timesheet')
	}
	// Revalidate timesheets and all dependent caches
	revalidateEntityMutation('TIMESHEETS')
}

// Additional endpoints
export async function getTimesheetStatuses(): Promise<string[]> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/timesheets/statuses`, {
		headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
	})
	if (!res.ok) {
		throw new Error(`Failed to fetch timesheet statuses: ${res.status}`)
	}
	const json = await res.json()
	return json.statuses || ['draft', 'submitted', 'approved', 'rejected']
}

export async function getTimesheetStats(): Promise<{
	approved: number
	draft: number
	pending: number
	rejected: number
	total: number
}> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/timesheets/stats`, {
		headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
	})
	if (!res.ok) {
		throw new Error(`Failed to fetch timesheet stats: ${res.status}`)
	}
	const json = await res.json()
	const data = json.data || json
	return {
		approved: Number(data.approved || 0),
		draft: Number(data.draft || 0),
		pending: Number(data.pending || 0),
		rejected: Number(data.rejected || 0),
		total: Number(data.total || 0),
	}
}

