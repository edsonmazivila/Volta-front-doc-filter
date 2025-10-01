'use server'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { handleServiceError } from '@/lib/http/error-handler'

export interface ServerUserItem {
	id: string
	first_name?: string
	last_name?: string
	email: string
	role?: string
	is_active?: boolean
	created_at?: string
}

export interface UserItemUI {
	id: string
	first_name: string
	last_name: string
	email: string
	role: string
	is_active: boolean
	created_at: string
}

export interface UserStatsUI {
	totalUsers: number
	activeUsers: number
	adminUsers: number
	managerUsers: number
	employeeUsers: number
}

export async function fetchUsersServer(): Promise<UserItemUI[]> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string, string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader

		const res = await fetch(`${API_BASE_URL}/api/users`, {
			method: 'GET',
			headers,
			cache: 'no-store',
		})
		if (!res.ok) {
			throw new Error(`Failed to load users (${res.status})`)
		}
		const json = await res.json().catch(() => ({})) as any
		const raw: ServerUserItem[] = Array.isArray(json) ? json : (json.data || json.users || [])
		return (raw || []).map((u) => ({
			id: String(u.id || ''),
			first_name: String(u.first_name || ''),
			last_name: String(u.last_name || ''),
			email: String(u.email || ''),
			role: String(u.role || ''),
			is_active: Boolean(u.is_active),
			created_at: String(u.created_at || ''),
		}))
	} catch (error) {
		return handleServiceError(error, 'fetchUsersServer', 'Failed to load users')
	}
}

export async function fetchUsersStatsServer(): Promise<UserStatsUI> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string, string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader

		const res = await fetch(`${API_BASE_URL}/api/users/stats`, {
			method: 'GET',
			headers,
			cache: 'no-store',
		})
		if (!res.ok) {
			// If stats endpoint is missing, derive minimal stats from list
			const users = await fetchUsersServer().catch(() => [])
			const roleCount = users.reduce<Record<string, number>>((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc }, {})
			return {
				totalUsers: users.length,
				activeUsers: users.filter(u => u.is_active).length,
				adminUsers: (roleCount['admin'] || 0) + (roleCount['system_admin'] || 0),
				managerUsers: (roleCount['hr_manager'] || 0) + (roleCount['payroll_manager'] || 0) + (roleCount['operational_manager'] || 0) + (roleCount['manager'] || 0),
				employeeUsers: roleCount['employee'] || 0,
			}
		}
		const json = await res.json().catch(() => ({})) as any
		const data = (json?.data ?? json) as any
		const roles = data.roles || {}
		return {
			totalUsers: Number(data.totalUsers ?? data.total ?? 0) || 0,
			activeUsers: Number(data.activeUsers ?? data.active ?? 0) || 0,
			adminUsers: Number(data.adminUsers ?? roles.system_admin ?? 0) || 0,
			managerUsers: Number(data.managerUsers ?? ((roles.hr_manager||0) + (roles.payroll_manager||0) + (roles.operational_manager||0) + (roles.manager||0))) || 0,
			employeeUsers: Number(data.employeeUsers ?? roles.employee ?? data.employees ?? 0) || 0,
		}
	} catch (error) {
		return handleServiceError(error, 'fetchUsersStatsServer', 'Failed to load user stats')
	}
}


