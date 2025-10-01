import { apiClient } from '@/lib/http/api-client'
import { handleServiceError } from '@/lib/http/error-handler'

const ENDPOINTS = {
  CREATE: '/api/leave-requests',
  DETAIL: (id: string) => `/api/leave-requests/${id}`,
  SUBMIT: (id: string) => `/api/leave-requests/${id}/submit`,
  CANCEL: (id: string) => `/api/leave-requests/${id}/cancel`,
  APPROVE_L1: (id: string) => `/api/leave-requests/${id}/approve-l1`,
  APPROVE_FINAL: (id: string) => `/api/leave-requests/${id}/approve-final`,
  REJECT: (id: string) => `/api/leave-requests/${id}/reject`,
}

export class LeavesService {
  static async create(data: Record<string, unknown>): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.CREATE, data)
    } catch (error) {
      return handleServiceError(error, 'LeavesService.create', 'Failed to create leave request')
    }
  }

  static async submit(id: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.SUBMIT(id), {})
    } catch (error) {
      return handleServiceError(error, 'LeavesService.submit', 'Failed to submit leave request')
    }
  }

  static async cancel(id: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.CANCEL(id), { reason })
    } catch (error) {
      return handleServiceError(error, 'LeavesService.cancel', 'Failed to cancel leave request')
    }
  }

  static async approveL1(id: string, notes?: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.APPROVE_L1(id), { notes })
    } catch (error) {
      return handleServiceError(error, 'LeavesService.approveL1', 'Failed to approve (L1)')
    }
  }

  static async approveFinal(id: string, notes?: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.APPROVE_FINAL(id), { notes })
    } catch (error) {
      return handleServiceError(error, 'LeavesService.approveFinal', 'Failed to approve (final)')
    }
  }

  static async reject(id: string, reason: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.REJECT(id), { reason })
    } catch (error) {
      return handleServiceError(error, 'LeavesService.reject', 'Failed to reject leave request')
    }
  }
}


