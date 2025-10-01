import 'server-only'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import type { Employee, EmployeeListParams } from './employees'

interface EmployeeListResponse {
	data?: Employee[]
	employees?: Employee[]
	total?: number
}

// Server-side fetch function for Server Components
export async function fetchEmployees(params: EmployeeListParams = {}): Promise<{ items: Employee[], total: number }> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}
		if (cookieHeader) {
			headers['Cookie'] = cookieHeader
		}

		const searchParams = new URLSearchParams()
		if (params.q) searchParams.append('q', params.q)
		if (params.status) searchParams.append('status', params.status)
		if (params.sort) searchParams.append('sort', params.sort)
		if (params.order) searchParams.append('order', params.order)
		if (params.page) searchParams.append('page', params.page.toString())
		if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())

		const url = `${API_BASE_URL}/api/employees${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
		const res = await fetch(url, {
			method: 'GET',
			headers,
			cache: 'no-store',
		})

		if (!res.ok) {
			console.error('Failed to fetch employees:', res.status)
			return { items: [], total: 0 }
		}

		const data: EmployeeListResponse | Employee[] = await res.json()
		const items = Array.isArray(data) ? data : (data.employees || data.data || [])
		const total = Array.isArray(data) ? items.length : (data.total ?? items.length)
		return { items, total }
	} catch (error) {
		console.error('Error fetching employees:', error)
		return { items: [], total: 0 }
	}
}
