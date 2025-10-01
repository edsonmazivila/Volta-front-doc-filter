import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'
import { API_BASE_URL } from '@/lib/config'

export class CompanyService {
	static async update(payload: Record<string, unknown>): Promise<void> {
		try {
			await apiClient.put(`${API_BASE_URL}/api/company`, payload)
		} catch (error) {
			return handleServiceError(error, 'CompanyService.update', 'Failed to update company')
		}
	}
}

export class PaySchedulesService {
	static async create(payload: Record<string, unknown>): Promise<void> {
		try { await apiClient.post(`${API_BASE_URL}/api/pay-schedules`, payload) }
		catch (error) { return handleServiceError(error, 'PaySchedulesService.create', 'Failed to create pay schedule') }
	}
    static async update(id: string, payload: Record<string, unknown>): Promise<void> {
        try { await apiClient.put(`${API_BASE_URL}/api/pay-schedules/${id}`, payload) }
        catch (error) { return handleServiceError(error, 'PaySchedulesService.update', 'Failed to update pay schedule') }
    }
    static async remove(id: string): Promise<void> {
        try { await apiClient.delete(`${API_BASE_URL}/api/pay-schedules/${id}`) }
        catch (error) { return handleServiceError(error, 'PaySchedulesService.remove', 'Failed to delete pay schedule') }
    }
}

export class LeavePoliciesService {
	static async create(payload: Record<string, unknown>): Promise<void> {
		try { await apiClient.post(`${API_BASE_URL}/api/leave-policies`, payload) }
		catch (error) { return handleServiceError(error, 'LeavePoliciesService.create', 'Failed to create leave policy') }
	}
    static async update(id: string, payload: Record<string, unknown>): Promise<void> {
        try { await apiClient.put(`${API_BASE_URL}/api/leave-policies/${id}`, payload) }
        catch (error) { return handleServiceError(error, 'LeavePoliciesService.update', 'Failed to update leave policy') }
    }
    static async remove(id: string): Promise<void> {
        try { await apiClient.delete(`${API_BASE_URL}/api/leave-policies/${id}`) }
        catch (error) { return handleServiceError(error, 'LeavePoliciesService.remove', 'Failed to delete leave policy') }
    }
}


