import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'

export interface UserListResponse<T> {
	users?: T[]
}

const ENDPOINTS = {
	LIST: '/api/users',
	DETAIL: (id: string) => `/api/users/${id}`,
	STATS: '/api/users/stats',
}

export class UsersService {
	static async list<T>(): Promise<T[]> {
		try {
			const data = await apiClient.get<UserListResponse<T> | T[]>(ENDPOINTS.LIST, undefined, { retries: 3 })
			return Array.isArray(data) ? data : (data.users || [])
		} catch (error) {
			return handleServiceError(error, 'UsersService.list', 'Failed to load users')
		}
	}

	static async stats<T>(): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.STATS, undefined, { retries: 3 })
		} catch (error) {
			return handleServiceError(error, 'UsersService.stats', 'Failed to load user stats')
		}
	}

	static async create<TInput>(data: TInput): Promise<void> {
		try {
			await apiClient.post(ENDPOINTS.LIST, data)
		} catch (error) {
			return handleServiceError(error, 'UsersService.create', 'Failed to create user')
		}
	}

	static async update<TInput>(id: string, data: TInput): Promise<void> {
		try {
			await apiClient.put(ENDPOINTS.DETAIL(id), data)
		} catch (error) {
			return handleServiceError(error, 'UsersService.update', 'Failed to update user')
		}
	}

	static async remove(id: string): Promise<void> {
		try {
			await apiClient.delete(ENDPOINTS.DETAIL(id))
		} catch (error) {
			return handleServiceError(error, 'UsersService.remove', 'Failed to delete user')
		}
	}

	static async toggleStatus(id: string, isActive: boolean): Promise<void> {
		try {
			await apiClient.put(ENDPOINTS.DETAIL(id), { is_active: isActive })
		} catch (error) {
			return handleServiceError(error, 'UsersService.toggleStatus', 'Failed to update user status')
		}
	}
}


