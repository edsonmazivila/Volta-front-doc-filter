/**
 * Platform Owner Services
 * Endpoints: /api/platform/*
 * Scope: Global - All organizations
 */

import { getAuthCookieHeader, fetchWithTimeout } from '@/lib/http/request.server';
import { API_BASE_URL } from '@/lib/config';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Platform-wide Statistics
 * GET /api/platform/organizations/stats
 */
export interface PlatformStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
  inactive: number;
  suspended: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const headers = await getAuthCookieHeader();
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/platform/organizations/stats`, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store'
  }, 10000);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch platform stats' }));
    throw new Error(error.message || 'Failed to fetch platform stats');
  }

  const json = await response.json() as ApiResponse<PlatformStats>;
  return json.data;
}

/**
 * Approve Organization
 * POST /api/platform/organizations/:id/approve
 */
export async function approveOrganization(
  id: string,
  data: { notes?: string; tier?: 'standard' | 'premium' | 'enterprise' }
): Promise<void> {
  const headers = await getAuthCookieHeader();
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/platform/organizations/${id}/approve`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data),
    cache: 'no-store'
  }, 10000);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve organization' }));
    throw new Error(error.message || 'Failed to approve organization');
  }
}

/**
 * Reject Organization
 * POST /api/platform/organizations/:id/reject
 */
export async function rejectOrganization(
  id: string,
  data: { notes: string }
): Promise<void> {
  const headers = await getAuthCookieHeader();
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/platform/organizations/${id}/reject`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data),
    cache: 'no-store'
  }, 10000);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reject organization' }));
    throw new Error(error.message || 'Failed to reject organization');
  }
}

/**
 * Suspend Organization
 * POST /api/platform/organizations/:id/suspend
 */
export async function suspendOrganization(
  id: string,
  data: { notes: string }
): Promise<void> {
  const headers = await getAuthCookieHeader();
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/platform/organizations/${id}/suspend`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data),
    cache: 'no-store'
  }, 10000);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to suspend organization' }));
    throw new Error(error.message || 'Failed to suspend organization');
  }
}

/**
 * Reactivate Organization
 * POST /api/platform/organizations/:id/reactivate
 */
export async function reactivateOrganization(
  id: string,
  data: { notes?: string }
): Promise<void> {
  const headers = await getAuthCookieHeader();
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/platform/organizations/${id}/reactivate`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data),
    cache: 'no-store'
  }, 10000);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reactivate organization' }));
    throw new Error(error.message || 'Failed to reactivate organization');
  }
}
