import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'

const ENDPOINTS = {
	LIST: '/api/timesheets',
	DETAIL: (id: string) => `/api/timesheets/${id}`,
	APPROVE: (id: string) => `/api/timesheets/${id}/approve`,
	REJECT: (id: string) => `/api/timesheets/${id}/reject`,
	SUBMIT: (id: string) => `/api/timesheets/${id}/submit`,
}

export class TimesheetsService {
	static async list<T>(params?: Record<string, string | number | boolean | undefined>): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.LIST, undefined, { searchParams: params, retries: 3 })
		} catch (error) {
			return handleServiceError(error, 'TimesheetsService.list', 'Failed to load timesheets')
		}
	}

	static async get<T>(id: string): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.DETAIL(id), undefined, { retries: 3 })
		} catch (error) {
			return handleServiceError(error, 'TimesheetsService.get', 'Failed to load timesheet')
		}
	}

	static async create<TInput, TOut = unknown>(data: TInput): Promise<TOut> {
		try {
			return await apiClient.post<TOut>(ENDPOINTS.LIST, data)
		} catch (error) {
			return handleServiceError(error, 'TimesheetsService.create', 'Failed to create timesheet')
		}
	}

	static async update<TInput, TOut = unknown>(id: string, data: TInput): Promise<TOut> {
		try {
			return await apiClient.put<TOut>(ENDPOINTS.DETAIL(id), data)
		} catch (error) {
			return handleServiceError(error, 'TimesheetsService.update', 'Failed to update timesheet')
		}
	}

	static async approve<TOut = unknown>(id: string): Promise<TOut> {
		try {
			return await apiClient.patch<TOut>(ENDPOINTS.APPROVE(id), {})
		} catch (error) {
			return handleServiceError(error, 'TimesheetsService.approve', 'Failed to approve timesheet')
		}
	}

	static async reject<TOut = unknown>(id: string, reason?: string): Promise<TOut> {
		try {
			return await apiClient.patch<TOut>(ENDPOINTS.REJECT(id), { reason })
		} catch (error) {
			return handleServiceError(error, 'TimesheetsService.reject', 'Failed to reject timesheet')
		}
	}

	static async submit<TOut = unknown>(id: string): Promise<TOut> {
		try {
			return await apiClient.patch<TOut>(ENDPOINTS.SUBMIT(id), {})
		} catch (error) {
			return handleServiceError(error, 'TimesheetsService.submit', 'Failed to submit timesheet')
		}
	}

	static async remove(id: string): Promise<void> {
		try {
			await apiClient.delete(ENDPOINTS.DETAIL(id))
		} catch (error) {
			return handleServiceError(error, 'TimesheetsService.remove', 'Failed to delete timesheet')
		}
	}
}


