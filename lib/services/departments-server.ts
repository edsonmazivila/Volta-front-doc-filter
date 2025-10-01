'use server'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { handleServiceError } from '@/lib/http/error-handler'

export interface ServerDepartmentItem {
	id: string
	name?: string
	description?: string
	manager_id?: string
	manager?: {
		id: string
		first_name?: string
		last_name?: string
		email?: string
	}
	is_active?: boolean
	created_at?: string
	updated_at?: string
}

export interface DepartmentItemUI {
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

export interface DepartmentStatsUI {
	totalDepartments: number
	activeDepartments: number
	inactiveDepartments: number
	departmentsWithManager: number
}

export async function fetchDepartmentsServer(): Promise<DepartmentItemUI[]> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string, string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader

		const res = await fetch(`${API_BASE_URL}/api/departments`, {
			method: 'GET',
			headers,
			cache: 'no-store',
		})
		if (!res.ok) {
			throw new Error(`Failed to load departments (${res.status})`)
		}
		const json = await res.json().catch(() => ({})) as any
		const raw: ServerDepartmentItem[] = Array.isArray(json) ? json : (json.data || json.departments || [])
		return (raw || []).map((d) => ({
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
	} catch (error) {
		return handleServiceError(error, 'fetchDepartmentsServer', 'Failed to load departments')
	}
}

export async function fetchDepartmentsStatsServer(): Promise<DepartmentStatsUI> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string, string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader

		const res = await fetch(`${API_BASE_URL}/api/departments/stats`, {
			method: 'GET',
			headers,
			cache: 'no-store',
		})
		if (!res.ok) {
			// If stats endpoint is missing, derive minimal stats from list
			const departments = await fetchDepartmentsServer().catch(() => [])
			return {
				totalDepartments: departments.length,
				activeDepartments: departments.filter(d => d.is_active).length,
				inactiveDepartments: departments.filter(d => !d.is_active).length,
				departmentsWithManager: departments.filter(d => d.manager_id).length,
			}
		}
		const json = await res.json().catch(() => ({})) as any
		const data = (json?.data ?? json) as any
		return {
			totalDepartments: Number(data.totalDepartments ?? data.total ?? 0) || 0,
			activeDepartments: Number(data.activeDepartments ?? data.active ?? 0) || 0,
			inactiveDepartments: Number(data.inactiveDepartments ?? data.inactive ?? 0) || 0,
			departmentsWithManager: Number(data.departmentsWithManager ?? data.with_manager ?? 0) || 0,
		}
	} catch (error) {
		return handleServiceError(error, 'fetchDepartmentsStatsServer', 'Failed to load department stats')
	}
}
