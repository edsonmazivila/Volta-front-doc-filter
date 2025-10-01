import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'
import { API_BASE_URL } from '@/lib/config'

export interface DepartmentListResponse<T> {
	departments?: T[]
}

const ENDPOINTS = {
    LIST: `${API_BASE_URL}/api/departments`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/departments/${id}`,
    STATS: `${API_BASE_URL}/api/departments/stats`,
}

export class DepartmentsService {
	static async list<T>(): Promise<T[]> {
		try {
            const data = await apiClient.get<DepartmentListResponse<T> | { data?: T[] } | T[]>(ENDPOINTS.LIST, undefined, { retries: 3 })
            return Array.isArray(data) ? data : ((data as any).data || (data as any).departments || [])
		} catch (error) {
			return handleServiceError(error, 'DepartmentsService.list', 'Failed to load departments')
		}
	}

	static async stats<T>(): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.STATS, undefined, { retries: 3 })
		} catch (error) {
			return handleServiceError(error, 'DepartmentsService.stats', 'Failed to load department stats')
		}
	}

	static async create<TInput>(data: TInput): Promise<void> {
		try {
			await apiClient.post(ENDPOINTS.LIST, data)
		} catch (error) {
			return handleServiceError(error, 'DepartmentsService.create', 'Failed to create department')
		}
	}

	static async update<TInput>(id: string, data: TInput): Promise<void> {
		try {
			await apiClient.put(ENDPOINTS.DETAIL(id), data)
		} catch (error) {
			return handleServiceError(error, 'DepartmentsService.update', 'Failed to update department')
		}
	}

	static async remove(id: string): Promise<void> {
		try {
			await apiClient.delete(ENDPOINTS.DETAIL(id))
		} catch (error) {
			return handleServiceError(error, 'DepartmentsService.remove', 'Failed to delete department')
		}
	}

	static async toggleStatus(id: string, isActive: boolean): Promise<void> {
		try {
            await apiClient.put(ENDPOINTS.DETAIL(id), { is_active: isActive })
		} catch (error) {
			return handleServiceError(error, 'DepartmentsService.toggleStatus', 'Failed to update department status')
		}
	}
}
