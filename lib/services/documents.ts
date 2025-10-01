import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'

const ENDPOINTS = {
	LIST: '/api/documents',
	DETAIL: (id: string) => `/api/documents/${id}`,
	APPROVE: (id: string) => `/api/documents/${id}/approve`,
	REJECT: (id: string) => `/api/documents/${id}/reject`,
	DOWNLOAD: (id: string) => `/api/documents/${id}/download`,
	PREVIEW: (id: string) => `/api/documents/${id}/preview`,
	UPLOAD: '/api/documents/upload',
	TYPES: '/api/documents/types',
}

export class DocumentsService {
	static async list<T>(): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.LIST)
		} catch (error) {
			return handleServiceError(error, 'DocumentsService.list', 'Failed to load documents')
		}
	}

	static async get<T>(id: string): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.DETAIL(id))
		} catch (error) {
			return handleServiceError(error, 'DocumentsService.get', 'Failed to load document')
		}
	}

	static async remove(id: string): Promise<void> {
		try {
			await apiClient.delete(ENDPOINTS.DETAIL(id))
		} catch (error) {
			return handleServiceError(error, 'DocumentsService.remove', 'Failed to delete document')
		}
	}

	static async update(id: string, data: Record<string, unknown>): Promise<void> {
		try {
			await apiClient.put(ENDPOINTS.DETAIL(id), data)
		} catch (error) {
			return handleServiceError(error, 'DocumentsService.update', 'Failed to update document')
		}
	}

	static async approve(id: string): Promise<void> {
		try {
			await apiClient.post(ENDPOINTS.APPROVE(id), {})
		} catch (error) {
			return handleServiceError(error, 'DocumentsService.approve', 'Failed to approve document')
		}
	}

	static async reject(id: string, reason: string): Promise<void> {
		try {
			await apiClient.post(ENDPOINTS.REJECT(id), { reason })
		} catch (error) {
			return handleServiceError(error, 'DocumentsService.reject', 'Failed to reject document')
		}
	}

	static async upload(form: FormData): Promise<void> {
		try {
			// Use fetch directly for multipart; apiClient enforces JSON headers by default
			await fetch(ENDPOINTS.UPLOAD, { method: 'POST', body: form, credentials: 'include' })
		} catch (error) {
			return handleServiceError(error, 'DocumentsService.upload', 'Failed to upload document')
		}
	}

	static async types<T>(): Promise<T> {
		try {
			return await apiClient.get<T>(ENDPOINTS.TYPES)
		} catch (error) {
			return handleServiceError(error, 'DocumentsService.types', 'Failed to load document types')
		}
	}
}


