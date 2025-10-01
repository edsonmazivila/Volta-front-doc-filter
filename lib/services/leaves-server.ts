'use server'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { handleServiceError } from '@/lib/http/error-handler'

export type LeaveStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED_L1' | 'APPROVED_FINAL' | 'REJECTED' | 'CANCELLED'

export interface LeaveRequestItem {
  id: string
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  is_half_day?: boolean
  reason?: string
  status: LeaveStatus
  created_at?: string
  submitted_at?: string
  employee_first_name?: string
  employee_last_name?: string
}

export interface LeaveBalanceItem {
  leave_type: string
  remaining_days: number
  pending_days?: number
}

async function doServerGet<T>(endpoint: string): Promise<T> {
  const cookieHeader = await getAuthCookieHeader()
  const headers: Record<string,string> = { 'Content-Type': 'application/json' }
  if (cookieHeader) headers['Cookie'] = cookieHeader
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET', headers, cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed GET ${endpoint}: ${res.status}`)
  return await res.json() as T
}

export async function fetchMyLeaveRequests(params?: { status?: string, type?: string }): Promise<LeaveRequestItem[]> {
  try {
    const qs = new URLSearchParams()
    if (params?.status) qs.append('status', params.status)
    if (params?.type) qs.append('leave_type', params.type)
    const data = await doServerGet<{ requests?: LeaveRequestItem[] }>(`/api/leave-requests/my${qs.toString() ? `?${qs}` : ''}`)
    return data?.requests || []
  } catch (error) {
    return handleServiceError(error, 'fetchMyLeaveRequests', 'Failed to load leave requests')
  }
}

export async function fetchPendingApprovals(): Promise<LeaveRequestItem[]> {
  try {
    const data = await doServerGet<{ requests?: LeaveRequestItem[] }>(`/api/leave-requests/pending-approvals`)
    return data?.requests || []
  } catch (error) {
    return handleServiceError(error, 'fetchPendingApprovals', 'Failed to load pending approvals')
  }
}

export async function fetchLeaveBalances(): Promise<LeaveBalanceItem[]> {
  try {
    const data = await doServerGet<{ balances?: LeaveBalanceItem[] }>(`/api/leave-balances/me`)
    return data?.balances || []
  } catch (error) {
    return handleServiceError(error, 'fetchLeaveBalances', 'Failed to load leave balances')
  }
}


