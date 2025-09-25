import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'

export interface Employee {
	id: string
	first_name: string
	last_name: string
	email: string
	department?: string
	is_active: boolean
}

export interface EmployeeListParams {
	q?: string
	status?: 'active' | 'inactive' | 'all'
	sort?: 'name' | 'status' | 'department'
	order?: 'asc' | 'desc'
	page?: number
	pageSize?: number
}

interface EmployeeListResponse {
	data?: Employee[]
	employees?: Employee[]
	total?: number
}

// Proxy through Next.js route to avoid CORS and attach cookies server-side
const ENDPOINTS = {
	LIST: '/api/employees',
	DETAIL: (id: string) => `/api/employees/${id}`,
	STATS: '/api/employees/stats',
}

export class EmployeesService {
	static async list(params: EmployeeListParams = {}): Promise<{ items: Employee[], total: number }> {
		try {
			const data = await apiClient.get<EmployeeListResponse | Employee[]>(ENDPOINTS.LIST, undefined, {
				searchParams: {
					q: params.q,
					status: params.status,
					sort: params.sort,
					order: params.order,
					page: params.page,
					pageSize: params.pageSize,
				},
				retries: 3,
			})
			const items = Array.isArray(data) ? data : (data.employees || data.data || [])
			const total = Array.isArray(data) ? items.length : (data.total ?? items.length)
			return { items, total }
		} catch (error) {
			return handleServiceError(error, 'EmployeesService.list', 'Failed to load employees')
		}
	}

	static async create(payload: Partial<Employee>): Promise<Employee> {
		try {
			return await apiClient.post<Employee>(ENDPOINTS.LIST, payload)
		} catch (error) {
			return handleServiceError(error, 'EmployeesService.create', 'Failed to create employee')
		}
	}

	static async update(id: string, payload: Partial<Employee>): Promise<Employee> {
		try {
			return await apiClient.put<Employee>(ENDPOINTS.DETAIL(id), payload)
		} catch (error) {
			return handleServiceError(error, 'EmployeesService.update', 'Failed to update employee')
		}
	}

	static async remove(id: string): Promise<void> {
		try {
			await apiClient.delete(ENDPOINTS.DETAIL(id))
		} catch (error) {
			return handleServiceError(error, 'EmployeesService.remove', 'Failed to delete employee')
		}
	}

	static async toggleStatus(id: string, isActive: boolean): Promise<void> {
		try {
			await apiClient.patch(ENDPOINTS.DETAIL(id), { is_active: isActive })
		} catch (error) {
			return handleServiceError(error, 'EmployeesService.toggleStatus', 'Failed to update status')
		}
	}
}


