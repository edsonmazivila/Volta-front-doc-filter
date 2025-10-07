'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'
import { revalidateEntityMutation, CacheTags, fetchWithGracefulFallback } from '@/lib/cache-utils'

// Types
export interface Employee {
	id: string
	first_name: string
	last_name: string
	email: string
	department?: string
	is_active: boolean
	created_at?: string
}

export interface EmployeeListParams {
	q?: string
	status?: 'active' | 'inactive' | 'all'
	sort?: 'name' | 'status' | 'department'
	order?: 'asc' | 'desc'
	page?: number
	pageSize?: number
}

// Validation schemas
const createEmployeeSchema = z.object({
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	email: z.string().email('Invalid email'),
	department: z.string().optional(),
	is_active: z.boolean().default(true),
})

const updateEmployeeSchema = z.object({
	first_name: z.string().min(1).optional(),
	last_name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	department: z.string().optional(),
	is_active: z.boolean().optional(),
})

// READ operations (cached)
export const getEmployees = cache(async (params: EmployeeListParams = {}): Promise<{ items: Employee[], total: number }> => {
	return fetchWithGracefulFallback(
		async () => {
			const cookieHeader = await getAuthCookieHeader()

			const searchParams = new URLSearchParams()
			if (params.q) searchParams.append('q', params.q)
			if (params.status) searchParams.append('status', params.status)
			if (params.sort) searchParams.append('sort', params.sort)
			if (params.order) searchParams.append('order', params.order)
			if (params.page) searchParams.append('page', params.page.toString())
			if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())

			const url = `${API_BASE_URL}/api/employees${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

			const res = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
				next: { tags: [CacheTags.EMPLOYEES], revalidate: 60 },
			})

			if (!res.ok) {
				throw new Error(`Failed to fetch employees: ${res.status}`)
			}

			const data = await res.json()
			const items = Array.isArray(data) ? data : (data.employees || data.data || [])
			const total = Array.isArray(data) ? items.length : (data.total ?? items.length)

			return { items, total }
		},
		{ items: [], total: 0 },
		{ errorContext: 'getEmployees' }
	)
})

// Server Actions for mutations
type ActionResult = { errors: Record<string, string[]> } | { success: true; data?: unknown }

export async function createEmployeeAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = createEmployeeSchema.safeParse({
		first_name: formData.get('first_name'),
		last_name: formData.get('last_name'),
		email: formData.get('email'),
		department: formData.get('department'),
		is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		const res = await fetch(`${API_BASE_URL}/api/employees`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(parsed.data),
		})

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			return { errors: { _form: [error.message || 'Failed to create employee'] } }
		}

		const data = await res.json()
		// Revalidate employees and all dependent caches
		revalidateEntityMutation('EMPLOYEES')

		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to create employee'] } }
	}
}

export async function updateEmployeeAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = updateEmployeeSchema.safeParse({
		first_name: formData.get('first_name') || undefined,
		last_name: formData.get('last_name') || undefined,
		email: formData.get('email') || undefined,
		department: formData.get('department') || undefined,
		is_active: formData.get('is_active') ? formData.get('is_active') === 'true' || formData.get('is_active') === 'on' : undefined,
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(parsed.data),
		})

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			return { errors: { _form: [error.message || 'Failed to update employee'] } }
		}

		const data = await res.json()
		// Revalidate employees and all dependent caches
		revalidateEntityMutation('EMPLOYEES')

		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to update employee'] } }
	}
}

export async function deleteEmployeeAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to delete employee')
	}

	// Revalidate employees and all dependent caches
	revalidateEntityMutation('EMPLOYEES')
}

export async function toggleEmployeeStatusAction(id: string, isActive: boolean): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		body: JSON.stringify({ is_active: isActive }),
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to toggle employee status')
	}

	// Revalidate employees and all dependent caches
	revalidateEntityMutation('EMPLOYEES')
}
