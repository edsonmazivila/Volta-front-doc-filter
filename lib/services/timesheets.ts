'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'
import { revalidateEntityMutation, CacheTags, fetchWithGracefulFallback } from '@/lib/cache-utils'
import { toIsoUtc } from '@/lib/utils'

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface TimesheetListItem {
	id: string
	employeeId?: string
	employeeName: string
	periodStart: string
	periodEnd: string
	status: TimesheetStatus
	regularHours?: number
	overtimeHours?: number
	totalHours: number
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
				employee_id?: string;
				employeeId?: string;
				employee?: { id?: string; user?: { first_name?: string; last_name?: string; email?: string }; first_name?: string; last_name?: string; email?: string; name?: string; full_name?: string };
				user?: { id?: string; user?: { first_name?: string; last_name?: string; email?: string }; first_name?: string; last_name?: string; email?: string; name?: string; full_name?: string };
				employee_info?: { id?: string; user?: { first_name?: string; last_name?: string; email?: string }; first_name?: string; last_name?: string; email?: string; name?: string; full_name?: string };
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
				regularHours?: number;
				regular_hours?: number;
				overtimeHours?: number;
				overtime_hours?: number;
				totalHours?: number;
				total_hours?: number;
				hours?: number;
				notes?: string;
				note?: string;
			}
			
			return (raw as RawTimesheet[]).map((t) => {
				const emp = t.employee || t.user || t.employee_info || undefined
				const empUser = emp?.user || undefined
				const first = empUser?.first_name ?? emp?.first_name ?? undefined
				const last = empUser?.last_name ?? emp?.last_name ?? undefined
				const joined = [first, last].filter(Boolean).join(' ')
				const nameField = emp?.name ?? emp?.full_name ?? undefined
				const email = empUser?.email ?? emp?.email ?? t.employee_email ?? t.email ?? undefined
				const employeeNameSource = (
					t.employeeName ?? t.employee_name ?? nameField ?? (joined || email || '—')
				)
				const employeeName: string = String(employeeNameSource)

				const periodStart = String(t.pay_period_start ?? t.periodStart ?? t.period_start ?? t.start_date ?? t.start ?? '')
				const periodEnd = String(t.pay_period_end ?? t.periodEnd ?? t.period_end ?? t.end_date ?? t.end ?? '')
				const submittedAtRaw = t.submittedAt ?? t.submitted_at ?? t.submitted ?? undefined
				const submittedAt = submittedAtRaw ? String(submittedAtRaw) : undefined

				return {
					id: String(t.id ?? t.ts_id ?? t.uuid ?? ''),
					employeeId: t.employee_id ?? t.employeeId ?? emp?.id ?? undefined,
					employeeName,
					periodStart,
					periodEnd,
					status: ((t.status ?? 'draft') as TimesheetStatus),
					regularHours: Number(t.regularHours ?? t.regular_hours ?? 0) || 0,
					overtimeHours: Number(t.overtimeHours ?? t.overtime_hours ?? 0) || 0,
					totalHours: Number(t.totalHours ?? t.total_hours ?? t.hours ?? 0) || 0,
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
	employee_id: z.string().min(1, 'Employee is required'),
	period_start: z.string().min(1, 'Period start is required'),
	period_end: z.string().min(1, 'Period end is required'),
	regular_hours: z.number().min(0, 'Regular hours must be >= 0').default(0),
	overtime_hours: z.number().min(0, 'Overtime hours must be >= 0').default(0),
	total_hours: z.number().min(0, 'Total hours must be >= 0'),
	status: z.enum(['draft', 'submitted']).default('draft'),
	notes: z.string().optional(),
})

export interface ActionResult {
	success?: boolean
	data?: unknown
	errors?: { _form?: string[]; [key: string]: string[] | undefined }
}

// MUTATIONS (server actions)
export async function createTimesheetAction(input: { employee_id: string; period_start: string; period_end: string; regular_hours?: number; overtime_hours?: number; total_hours: number; status?: 'draft' | 'submitted'; notes?: string | null }): Promise<ActionResult> {
    const parsed = upsertSchema.safeParse({
        employee_id: String(input.employee_id || ''),
        period_start: toIsoUtc(input.period_start),
        period_end: toIsoUtc(input.period_end),
        regular_hours: Number(input.regular_hours ?? 0),
        overtime_hours: Number(input.overtime_hours ?? 0),
        total_hours: Number(input.total_hours),
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

export async function updateTimesheetAction(id: string, input: { employee_id: string; period_start: string; period_end: string; regular_hours?: number; overtime_hours?: number; total_hours: number; status?: 'draft' | 'submitted'; notes?: string | null }): Promise<ActionResult> {
    const parsed = upsertSchema.safeParse({
        employee_id: String(input.employee_id || ''),
        period_start: toIsoUtc(input.period_start),
        period_end: toIsoUtc(input.period_end),
        regular_hours: Number(input.regular_hours ?? 0),
        overtime_hours: Number(input.overtime_hours ?? 0),
        total_hours: Number(input.total_hours),
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
		method: 'PATCH',
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
		method: 'PATCH',
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
		method: 'PATCH',
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

