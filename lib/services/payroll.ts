import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'

const ENDPOINTS = {
	LIST: '/api/payroll',
	PROCESS: '/api/payroll/process',
	REPORT: (id: string) => `/api/payroll/reports/${id}`,
}

export class PayrollService {
	static async list<T>(params?: Record<string, string | number | boolean | undefined>): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.LIST, undefined, { searchParams: params, retries: 3 })
		} catch (error) {
			return handleServiceError(error, 'PayrollService.list', 'Failed to load payroll list')
		}
	}

	static async process<TInput, TOut = unknown>(data: TInput): Promise<TOut> {
		try {
			return await apiClient.post<TOut>(ENDPOINTS.PROCESS, data)
		} catch (error) {
			return handleServiceError(error, 'PayrollService.process', 'Failed to process payroll')
		}
	}

	static async getReport<TOut = unknown>(id: string): Promise<TOut> {
		try {
			return await apiClient.get<TOut>(ENDPOINTS.REPORT(id), undefined, { retries: 3 })
		} catch (error) {
			return handleServiceError(error, 'PayrollService.getReport', 'Failed to fetch payroll report')
		}
	}
}


