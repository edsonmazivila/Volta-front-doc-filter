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
	parent_department_id: string | null
	parent_department_name?: string | null
	manager: {
		id: string
		full_name: string
		email: string
	} | null
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface DepartmentDetail extends Department {
	child_departments?: Department[]
}

export interface DepartmentStats {
	totalDepartments: number
	activeDepartments: number
	inactiveDepartments: number
	departmentsWithManager: number
}

// Internal types for API responses
interface RawDepartmentChild {
	id?: string | number;
	name?: string;
	description?: string;
	manager_id?: string | number;
	parent_department_id?: string | number;
	manager?: {
		id?: string | number;
		full_name?: string;
		email?: string;
	};
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
}

// Validation schemas
const createDepartmentSchema = z.object({
	name: z.string().min(1, 'Department name is required'),
	description: z.string().optional().default(''),
	manager_id: z.string().nullable().optional(),
	parent_department_id: z.string().nullable().optional(),
	company_id: z.string().optional(), // For organization admins to specify company
	is_active: z.boolean().default(true),
})

const updateDepartmentSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	manager_id: z.string().nullable().optional(),
	parent_department_id: z.string().nullable().optional(),
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
				parent_department_id?: string | number;
				parent_department_name?: string;
				manager?: {
					id?: string | number;
					full_name?: string;
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
				parent_department_id: d.parent_department_id ? String(d.parent_department_id) : null,
				parent_department_name: d.parent_department_name ? String(d.parent_department_name) : null,
				manager: d.manager ? {
					id: String(d.manager.id || ''),
					full_name: String(d.manager.full_name || ''),
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

export const getActiveDepartments = cache(async (): Promise<Department[]> => {
	const departments = await getDepartments()
	return departments.filter(d => d.is_active)
})

export const getDepartmentById = cache(async (id: string): Promise<DepartmentDetail | null> => {
	return fetchWithGracefulFallback(
		async () => {
			const cookieHeader = await getAuthCookieHeader()
			const res = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
				next: { tags: [`${CacheTags.DEPARTMENTS}-${id}`], revalidate: 60 },
			})

			if (!res.ok) {
				if (res.status === 404) return null
				// Log warning but return null to prevent page crash
				console.warn(`[getDepartmentById] Failed to fetch department ${id}: ${res.status}`)
				const errorData = await res.json().catch(() => ({}))
				if (res.status >= 500) {
					console.warn(`[getDepartmentById] Backend error:`, errorData)
				}
				return null
			}

			const json = await res.json()
			const d = json.data || json
			
			return {
				id: String(d.id || ''),
				name: String(d.name || ''),
				description: String(d.description || ''),
				manager_id: d.manager_id ? String(d.manager_id) : null,
				parent_department_id: d.parent_department_id ? String(d.parent_department_id) : null,
				parent_department_name: d.parent_department_name ? String(d.parent_department_name) : null,
				manager: d.manager ? {
					id: String(d.manager.id || ''),
					full_name: String(d.manager.full_name || ''),
					email: String(d.manager.email || ''),
				} : null,
				is_active: Boolean(d.is_active),
				created_at: String(d.created_at || ''),
				updated_at: String(d.updated_at || ''),
				child_departments: d.child_departments ? d.child_departments.map((child: RawDepartmentChild) => ({
					id: String(child.id || ''),
					name: String(child.name || ''),
					description: String(child.description || ''),
					manager_id: child.manager_id ? String(child.manager_id) : null,
					parent_department_id: child.parent_department_id ? String(child.parent_department_id) : null,
					manager: child.manager ? {
						id: String(child.manager.id || ''),
						full_name: String(child.manager.full_name || ''),
						email: String(child.manager.email || ''),
					} : null,
					is_active: Boolean(child.is_active),
					created_at: String(child.created_at || ''),
					updated_at: String(child.updated_at || ''),
				})) : undefined
			}
		},
		null,
		{ errorContext: 'getDepartmentById' }
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
	// Handle duplicate fields (hidden false + checkbox true). Prefer any true value.
	const isActiveValues = formData.getAll('is_active').map(String)
	const isActive = isActiveValues.some(v => v === 'true' || v === 'on')

	const parentDeptId = formData.get('parent_department_id')
	const managerId = formData.get('manager_id')

	console.log('[createDepartmentAction] FormData values:', {
		parent_department_id_raw: parentDeptId,
		parent_department_id_type: typeof parentDeptId,
		manager_id_raw: managerId,
	})

	const parsed = createDepartmentSchema.safeParse({
		name: formData.get('name'),
		description: formData.get('description'),
		manager_id: managerId ? String(managerId) : null,
		parent_department_id: parentDeptId ? String(parentDeptId) : null,
		company_id: formData.get('company_id') || undefined, // Organization Admin can specify company
		is_active: isActive,
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		console.log('[createDepartmentAction] Sending to backend:', parsed.data)
		
		const res = await fetch(`${API_BASE_URL}/api/departments`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(parsed.data),
		})

		console.log('[createDepartmentAction] Response status:', res.status)

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			console.error('[createDepartmentAction] Error response:', error)
			return { errors: { _form: [error.message || error.error || 'Failed to create department'] } }
		}

		const data = await res.json()
		console.log('[createDepartmentAction] Success response:', data)
		
		// Revalidate departments and all dependent caches (including per-id cache)
		const createdId = data.department?.id
		const additionalTags = createdId ? [`${CacheTags.DEPARTMENTS}-${createdId}`] : []
		revalidateEntityMutation('DEPARTMENTS', { additionalTags })

		return { success: true, data }
	} catch (err) {
		console.error('[createDepartmentAction] Exception:', err)
		return { errors: { _form: ['Failed to create department: ' + (err instanceof Error ? err.message : 'Unknown error')] } }
	}
}

export async function updateDepartmentAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const id = formData.get('id') as string
	
	if (!id) {
		return { errors: { _form: ['Department ID is required'] } }
	}
	
	// Prefer any true value if multiple are present; undefined if no field present
	const isActiveValues = formData.getAll('is_active').map(String)
	const hasIsActiveField = isActiveValues.length > 0
	const isActive = hasIsActiveField ? isActiveValues.some(v => v === 'true' || v === 'on') : undefined

	const parentDeptId = formData.get('parent_department_id')
	const managerId = formData.get('manager_id')

	console.log('[updateDepartmentAction] FormData values:', {
		id,
		parent_department_id_raw: parentDeptId,
		parent_department_id_type: typeof parentDeptId,
		manager_id_raw: managerId,
	})

	const parsed = updateDepartmentSchema.safeParse({
		name: formData.get('name') || undefined,
		description: formData.get('description') || undefined,
		manager_id: formData.has('manager_id') 
			? (managerId ? String(managerId) : null) 
			: undefined,
		parent_department_id: formData.has('parent_department_id')
			? (parentDeptId ? String(parentDeptId) : null)
			: undefined,
		is_active: isActive,
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
		// Revalidate departments and all dependent caches (including per-id cache)
		const additionalTags = [`${CacheTags.DEPARTMENTS}-${id}`]
		revalidateEntityMutation('DEPARTMENTS', { additionalTags })

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

	// Revalidate departments and all dependent caches (including per-id cache)
	const additionalTags = [`${CacheTags.DEPARTMENTS}-${id}`]
	revalidateEntityMutation('DEPARTMENTS', { additionalTags })
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

	// Revalidate departments and all dependent caches (including per-id cache)
	const additionalTags = [`${CacheTags.DEPARTMENTS}-${id}`]
	revalidateEntityMutation('DEPARTMENTS', { additionalTags })
}
