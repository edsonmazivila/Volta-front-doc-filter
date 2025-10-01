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

// API endpoints for employee operations
const ENDPOINTS = {
	LIST: '/api/employees',
	DETAIL: (id: string) => `/api/employees/${id}`,
	STATS: '/api/employees/stats',
}

// Client-side service for Client Components (CRUD operations only)
export class EmployeesService {
    static async list<T>(params?: Record<string, string | number | boolean | undefined>): Promise<T> {
        try {
			return await apiClient.get<T>(ENDPOINTS.LIST, undefined, { searchParams: params, retries: 3 })
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


