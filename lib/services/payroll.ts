import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'

const ENDPOINTS = {
	LIST: '/api/payroll',
	HISTORY: '/api/payroll/history',
	PROCESS: '/api/payroll/calculate',
	RUN: (id: string) => `/api/payroll/run/${id}`,
	REPORT: (id: string) => `/api/payroll/reports/${id}`,
	EXCEL: (id: string) => `/api/payroll/excel/${id}`,
	EXCEL_BCI: (id: string) => `/api/payroll/excel/bci/${id}`,
	EXCEL_TABELA: (id: string, mes?: string) => `/api/payroll/excel/tabela/${id}${mes ? `?mes=${encodeURIComponent(mes)}` : ''}`,
}

export class PayrollService {
	static async list<T>(params?: Record<string, string | number | boolean | undefined>): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.LIST, undefined, { searchParams: params, retries: 3 })
		} catch (error) {
			return handleServiceError(error, 'PayrollService.list', 'Failed to load payroll list')
		}
	}

	static async history<T = unknown>(): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.HISTORY)
		} catch (error) {
			return handleServiceError(error, 'PayrollService.history', 'Failed to load payroll history')
		}
	}

	static async process<TInput, TOut = any>(data: TInput): Promise<TOut> {
		try {
			return await apiClient.post<TOut>(ENDPOINTS.PROCESS, data)
		} catch (error) {
			return handleServiceError(error, 'PayrollService.process', 'Failed to process payroll')
		}
	}

	static async run<TOut = any>(runId: string): Promise<TOut> {
		try {
			return await apiClient.post<TOut>(ENDPOINTS.RUN(runId), {})
		} catch (error) {
			return handleServiceError(error, 'PayrollService.run', 'Failed to run payroll')
		}
	}

	static async getReport<TOut = unknown>(id: string): Promise<TOut> {
		try {
			return await apiClient.get<TOut>(ENDPOINTS.REPORT(id), undefined, { retries: 3 })
		} catch (error) {
			return handleServiceError(error, 'PayrollService.getReport', 'Failed to fetch payroll report')
		}
	}

	static async downloadExcel(runId: string): Promise<void> {
		try {
			if (typeof window !== 'undefined') {
				window.open(ENDPOINTS.EXCEL(runId), '_blank')
			}
		} catch (error) {
			handleServiceError(error, 'PayrollService.downloadExcel', 'Failed to download payroll excel')
		}
	}

	static async downloadBCI(runId: string): Promise<void> {
		try {
			if (typeof window !== 'undefined') {
				window.open(ENDPOINTS.EXCEL_BCI(runId), '_blank')
			}
		} catch (error) {
			handleServiceError(error, 'PayrollService.downloadBCI', 'Failed to download BCI file')
		}
	}

	static async downloadTabela(runId: string, mes?: string): Promise<void> {
		try {
			if (typeof window !== 'undefined') {
				window.open(ENDPOINTS.EXCEL_TABELA(runId, mes), '_blank')
			}
		} catch (error) {
			handleServiceError(error, 'PayrollService.downloadTabela', 'Failed to download Tabela Salarial')
		}
	}
}


