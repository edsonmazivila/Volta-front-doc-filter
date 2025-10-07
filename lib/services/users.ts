'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'
import { revalidateEntityMutation, CacheTags, fetchWithGracefulFallback } from '@/lib/cache-utils'

// Types
export interface User {
	id: string
	first_name: string
	last_name: string
	email: string
	role: string
	is_active: boolean
	created_at: string
}

export interface UserStats {
	totalUsers: number
	activeUsers: number
	adminUsers: number
	managerUsers: number
	employeeUsers: number
}

// Validation schemas
const createUserSchema = z.object({
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	email: z.string().email('Invalid email'),
	role: z.string().min(1, 'Role is required'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	is_active: z.boolean().default(true),
})

const updateUserSchema = z.object({
	first_name: z.string().min(1).optional(),
	last_name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	role: z.string().optional(),
	is_active: z.boolean().optional(),
})

// READ operations (cached with graceful fallback)
export const getUsers = cache(async (): Promise<User[]> => {
	return fetchWithGracefulFallback(
		async () => {
			const cookieHeader = await getAuthCookieHeader()
			const res = await fetch(`${API_BASE_URL}/api/users`, {
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
				next: { tags: [CacheTags.USERS], revalidate: 60 },
			})

			if (!res.ok) {
				throw new Error(`Failed to fetch users: ${res.status}`)
			}

			const json = await res.json()
			const raw = Array.isArray(json) ? json : (json.data || json.users || [])

			return raw.map((u: { id?: string; first_name?: string; last_name?: string; email?: string; role?: string; is_active?: boolean; created_at?: string }) => ({
				id: String(u.id || ''),
				first_name: String(u.first_name || ''),
				last_name: String(u.last_name || ''),
				email: String(u.email || ''),
				role: String(u.role || ''),
				is_active: Boolean(u.is_active),
				created_at: String(u.created_at || ''),
			}))
		},
		[], // Fallback to empty array on error
		{ errorContext: 'getUsers' }
	)
})

export const getUserStats = cache(async (): Promise<UserStats> => {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/users/stats`, {
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		next: { tags: ['users-stats'], revalidate: 60 },
	})

	if (!res.ok) {
		// Fallback: derive stats from users list
		const users = await getUsers()
		const roleCount = users.reduce<Record<string, number>>((acc, u) => { 
			acc[u.role] = (acc[u.role] || 0) + 1
			return acc
		}, {})
		
		return {
			totalUsers: users.length,
			activeUsers: users.filter(u => u.is_active).length,
			adminUsers: (roleCount['admin'] || 0) + (roleCount['system_admin'] || 0),
			managerUsers: (roleCount['hr_manager'] || 0) + (roleCount['payroll_manager'] || 0) + (roleCount['operational_manager'] || 0) + (roleCount['manager'] || 0),
			employeeUsers: roleCount['employee'] || 0,
		}
	}

	const json = await res.json()
	const data = json?.data ?? json
	const roles = data.roles || {}
	
	return {
		totalUsers: Number(data.totalUsers ?? data.total ?? 0) || 0,
		activeUsers: Number(data.activeUsers ?? data.active ?? 0) || 0,
		adminUsers: Number(data.adminUsers ?? roles.system_admin ?? 0) || 0,
		managerUsers: Number(data.managerUsers ?? ((roles.hr_manager||0) + (roles.payroll_manager||0) + (roles.operational_manager||0) + (roles.manager||0))) || 0,
		employeeUsers: Number(data.employeeUsers ?? roles.employee ?? data.employees ?? 0) || 0,
	}
})

// Server Actions for mutations
type ActionResult = { errors: Record<string, string[]> } | { success: true; data?: unknown }

export async function createUserAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = createUserSchema.safeParse({
		first_name: formData.get('first_name'),
		last_name: formData.get('last_name'),
		email: formData.get('email'),
		role: formData.get('role'),
		password: formData.get('password'),
		is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		const res = await fetch(`${API_BASE_URL}/api/users`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(parsed.data),
		})

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			return { errors: { _form: [error.message || 'Failed to create user'] } }
		}

		const data = await res.json()
		// Revalidate users and all dependent caches (departments, employees, etc.)
		revalidateEntityMutation('USERS')

		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to create user'] } }
	}
}

export async function updateUserAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = updateUserSchema.safeParse({
		first_name: formData.get('first_name') || undefined,
		last_name: formData.get('last_name') || undefined,
		email: formData.get('email') || undefined,
		role: formData.get('role') || undefined,
		is_active: formData.get('is_active') ? formData.get('is_active') === 'true' || formData.get('is_active') === 'on' : undefined,
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(parsed.data),
		})

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			return { errors: { _form: [error.message || 'Failed to update user'] } }
		}

		const data = await res.json()
		// Revalidate users and all dependent caches (departments, employees, etc.)
		revalidateEntityMutation('USERS')

		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to update user'] } }
	}
}

export async function deleteUserAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to delete user')
	}

	// Revalidate users and all dependent caches (departments, employees, etc.)
	revalidateEntityMutation('USERS')
}

export async function toggleUserStatusAction(id: string, isActive: boolean): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		body: JSON.stringify({ is_active: isActive }),
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to toggle user status')
	}

	// Revalidate users and all dependent caches (departments, employees, etc.)
	revalidateEntityMutation('USERS')
}
