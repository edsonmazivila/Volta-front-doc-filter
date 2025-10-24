'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'
import { revalidateEntityMutation, CacheTags } from '@/lib/cache-utils'
import type { MyTimesheet, MyTimesheetStatus } from '@/lib/types/my-timesheets'

interface MyTimesheetsResponseShape {
  data?: MyTimesheet[]
  timesheets?: MyTimesheet[]
}

// READ (cached) - Get my timesheets
export const getMyTimesheets = cache(async (params?: { status?: string; year?: string }): Promise<MyTimesheet[]> => {
  const cookieHeader = await getAuthCookieHeader()

  const queryParams = new URLSearchParams()
  if (params?.status) queryParams.append('status', params.status)
  if (params?.year) queryParams.append('year', params.year)

  const url = `${API_BASE_URL}/api/timesheets/my${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    next: { tags: [CacheTags.MY_TIMESHEETS], revalidate: 60 },
  })

  if (!res.ok) {
    console.error('Failed to fetch my timesheets:', res.status)
    return []
  }

  const json: MyTimesheetsResponseShape = await res.json().catch(() => ({} as MyTimesheetsResponseShape))
  console.log('My Timesheets API Response:', json)
  const raw = json.data || json.timesheets || []
  console.log('Raw timesheets data:', raw)

  interface RawTimesheet {
    id?: string | number
    employee_id?: string
    period_start?: string
    pay_period_start?: string
    period_end?: string
    pay_period_end?: string
    status?: string
    total_hours?: number
    totalHours?: number
    regular_hours?: number
    overtime_hours?: number
    sick_hours?: number
    vacation_hours?: number
    holiday_hours?: number
    submitted_at?: string
    submittedAt?: string
    notes?: string
    created_at?: string
    createdAt?: string
    updated_at?: string
    updatedAt?: string
  }

  const mapped = (raw as RawTimesheet[]).map((t) => ({
    id: String(t.id || ''),
    period_start: String(t.period_start || t.pay_period_start || ''),
    period_end: String(t.period_end || t.pay_period_end || ''),
    status: (t.status || 'draft') as MyTimesheetStatus,
    total_hours: Number(t.total_hours || t.totalHours || t.regular_hours || 0),
    submitted_at: t.submitted_at || t.submittedAt,
    notes: t.notes,
    created_at: t.created_at || t.createdAt,
    updated_at: t.updated_at || t.updatedAt,
  }))
  
  console.log('Mapped timesheets:', mapped)
  return mapped
})

// Validation schemas
const timesheetSchema = z.object({
  period_start: z.string().min(1, 'Period start is required'),
  period_end: z.string().min(1, 'Period end is required'),
  total_hours: z.number().min(0, 'Total hours must be >= 0'),
  notes: z.string().optional(),
})

export interface ActionResult {
  success?: boolean
  data?: unknown
  errors?: { _form?: string[]; [key: string]: string[] | undefined }
}

// MUTATIONS (server actions)
export async function createMyTimesheetAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const period_start = formData.get('period_start') as string
  const period_end = formData.get('period_end') as string
  const total_hours = Number(formData.get('total_hours'))
  const notes = formData.get('notes') as string | null

  const parsed = timesheetSchema.safeParse({
    period_start,
    period_end,
    total_hours,
    notes: notes || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/timesheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    body: JSON.stringify({
      pay_period_start: parsed.data.period_start,
      pay_period_end: parsed.data.period_end,
      total_hours: parsed.data.total_hours,
      notes: parsed.data.notes,
    }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    return { errors: { _form: [error.message || 'Failed to create timesheet'] } }
  }

  const data = await res.json()
  revalidateEntityMutation('MY_TIMESHEETS')
  return { success: true, data }
}

export async function updateMyTimesheetAction(
  id: string,
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const period_start = formData.get('period_start') as string
  const period_end = formData.get('period_end') as string
  const total_hours = Number(formData.get('total_hours'))
  const notes = formData.get('notes') as string | null

  const parsed = timesheetSchema.safeParse({
    period_start,
    period_end,
    total_hours,
    notes: notes || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    body: JSON.stringify({
      pay_period_start: parsed.data.period_start,
      pay_period_end: parsed.data.period_end,
      total_hours: parsed.data.total_hours,
      notes: parsed.data.notes,
    }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    return { errors: { _form: [error.message || 'Failed to update timesheet'] } }
  }

  const data = await res.json()
  revalidateEntityMutation('MY_TIMESHEETS')
  return { success: true, data }
}

export async function submitMyTimesheetAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    body: JSON.stringify({}),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to submit timesheet')
  }

  revalidateEntityMutation('MY_TIMESHEETS')
}

export async function deleteMyTimesheetAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to delete timesheet')
  }

  revalidateEntityMutation('MY_TIMESHEETS')
}