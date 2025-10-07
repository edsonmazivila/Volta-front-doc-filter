'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'
import { revalidateEntityMutation, CacheTags, fetchWithGracefulFallback } from '@/lib/cache-utils'

// Types
export interface Department {
	id: string
	name: string
	description: string
	manager_id: string | null
	manager: {
		id: string
		first_name: string
		last_name: string
		email: string
	} | null
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface DepartmentStats {
	totalDepartments: number
	activeDepartments: number
	inactiveDepartments: number
	departmentsWithManager: number
}

// Validation schemas
const createDepartmentSchema = z.object({
	name: z.string().min(1, 'Department name is required'),
	description: z.string().optional().default(''),
	manager_id: z.string().nullable().optional(),
	is_active: z.boolean().default(true),
})

const updateDepartmentSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	manager_id: z.string().nullable().optional(),
	is_active: z.boolean().optional(),
})

// READ operations (cached)
export const getDepartments = cache(async (): Promise<Department[]> => {
	return fetchWithGracefulFallback(
		async () => {
			const cookieHeader = await getAuthCookieHeader()
			const res = await fetch(`${API_BASE_URL}/api/departments`, {
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
				next: { tags: [CacheTags.DEPARTMENTS], revalidate: 60 },
			})

			if (!res.ok) {
				throw new Error(`Failed to fetch departments: ${res.status}`)
			}

			const json = await res.json()
			const raw = Array.isArray(json) ? json : (json.data || json.departments || [])

			interface RawDepartment {
				id?: string | number;
				name?: string;
				description?: string;
				manager_id?: string | number;
				manager?: {
					id?: string | number;
					first_name?: string;
					last_name?: string;
					email?: string;
				};
				is_active?: boolean;
				created_at?: string;
				updated_at?: string;
			}
			return raw.map((d: RawDepartment) => ({
				id: String(d.id || ''),
				name: String(d.name || ''),
				description: String(d.description || ''),
				manager_id: d.manager_id ? String(d.manager_id) : null,
				manager: d.manager ? {
					id: String(d.manager.id || ''),
					first_name: String(d.manager.first_name || ''),
					last_name: String(d.manager.last_name || ''),
					email: String(d.manager.email || ''),
				} : null,
				is_active: Boolean(d.is_active),
				created_at: String(d.created_at || ''),
				updated_at: String(d.updated_at || ''),
			}))
		},
		[],
		{ errorContext: 'getDepartments' }
	)
})

export const getDepartmentStats = cache(async (): Promise<DepartmentStats> => {
	return fetchWithGracefulFallback(
		async () => {
			const cookieHeader = await getAuthCookieHeader()
			const res = await fetch(`${API_BASE_URL}/api/departments/stats`, {
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
				next: { tags: [CacheTags.DEPARTMENT_STATS], revalidate: 60 },
			})

			if (!res.ok) {
				// Fallback: derive stats from departments list
				const departments = await getDepartments()
				return {
					totalDepartments: departments.length,
					activeDepartments: departments.filter(d => d.is_active).length,
					inactiveDepartments: departments.filter(d => !d.is_active).length,
					departmentsWithManager: departments.filter(d => d.manager_id).length,
				}
			}

			const json = await res.json()
			const data = json?.data ?? json

			return {
				totalDepartments: Number(data.totalDepartments ?? data.total ?? 0) || 0,
				activeDepartments: Number(data.activeDepartments ?? data.active ?? 0) || 0,
				inactiveDepartments: Number(data.inactiveDepartments ?? data.inactive ?? 0) || 0,
				departmentsWithManager: Number(data.departmentsWithManager ?? data.with_manager ?? 0) || 0,
			}
		},
		{ totalDepartments: 0, activeDepartments: 0, inactiveDepartments: 0, departmentsWithManager: 0 },
		{ errorContext: 'getDepartmentStats' }
	)
})

// Server Actions for mutations
type ActionResult = { errors: Record<string, string[]> } | { success: true; data?: unknown }

export async function createDepartmentAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = createDepartmentSchema.safeParse({
		name: formData.get('name'),
		description: formData.get('description'),
		manager_id: formData.get('manager_id') || null,
		is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		const res = await fetch(`${API_BASE_URL}/api/departments`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(parsed.data),
		})

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			return { errors: { _form: [error.message || 'Failed to create department'] } }
		}

		const data = await res.json()
		// Revalidate departments and all dependent caches
		revalidateEntityMutation('DEPARTMENTS')

		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to create department'] } }
	}
}

export async function updateDepartmentAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = updateDepartmentSchema.safeParse({
		name: formData.get('name') || undefined,
		description: formData.get('description') || undefined,
		manager_id: formData.get('manager_id') || null,
		is_active: formData.get('is_active') ? formData.get('is_active') === 'true' || formData.get('is_active') === 'on' : undefined,
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		const res = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(parsed.data),
		})

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			return { errors: { _form: [error.message || 'Failed to update department'] } }
		}

		const data = await res.json()
		// Revalidate departments and all dependent caches
		revalidateEntityMutation('DEPARTMENTS')

		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to update department'] } }
	}
}

export async function deleteDepartmentAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to delete department')
	}

	// Revalidate departments and all dependent caches
	revalidateEntityMutation('DEPARTMENTS')
}

export async function toggleDepartmentStatusAction(id: string, isActive: boolean): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		body: JSON.stringify({ is_active: isActive }),
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to toggle department status')
	}

	// Revalidate departments and all dependent caches
	revalidateEntityMutation('DEPARTMENTS')
}
