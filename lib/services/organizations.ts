/**
 * Organizations Service
 * Handles organization-related API calls
 */

import { getAuthCookieHeader, fetchWithTimeout } from '@/lib/http/request.server'
import { API_BASE_URL } from '@/lib/config'
import type { Organization, OrganizationStats } from '@/lib/types/organization'

interface ApiResponse<T> {
	success: boolean
	data: T
	count?: number
	message?: string
}

/**
 * Get current user's organization
 * Available for: organization_admin, system_admin, and below
 * GET /api/organizations/me
 */
export async function getMyOrganization(): Promise<Organization> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/organizations/me`, {
		method: 'GET',
		headers,
		credentials: 'include',
		cache: 'no-store'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to fetch organization' }))
		throw new Error(error.message || 'Failed to fetch organization')
	}

	const json = await response.json() as ApiResponse<Organization>
	return json.data
}

/**
 * Get all organizations (Platform Owner only)
 * GET /api/platform/organizations?include_stats=true
 */
export async function getAllOrganizations(): Promise<{ data: Organization[], count: number }> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetchWithTimeout(`${API_BASE_URL}/api/platform/organizations?include_stats=true`, {
		method: 'GET',
		headers,
		credentials: 'include',
		cache: 'no-store'
	}, 10000)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to fetch organizations' }))
		throw new Error(error.message || 'Failed to fetch organizations')
	}

	const json = await response.json() as ApiResponse<Organization[]>
	const data = json.data || [];
	return {
		data,
		count: json.count || data.length
	}
}

/**
 * Get pending organizations (Platform Owner only)
 * GET /api/platform/organizations/pending
 */
export async function getPendingOrganizations(): Promise<{ data: Organization[], count: number }> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetchWithTimeout(`${API_BASE_URL}/api/platform/organizations/pending`, {
		method: 'GET',
		headers,
		credentials: 'include',
		cache: 'no-store'
	}, 10000)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to fetch pending organizations' }))
		throw new Error(error.message || 'Failed to fetch pending organizations')
	}

	const json = await response.json() as ApiResponse<Organization[]>
	const data = json.data || [];
	return {
		data,
		count: json.count || data.length
	}
}

/**
 * Get organization by ID (Platform Owner only)
 * GET /api/platform/organizations/:id
 */
export async function getOrganizationById(id: string): Promise<Organization> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/platform/organizations/${id}`, {
		method: 'GET',
		headers,
		credentials: 'include',
		cache: 'no-store'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to fetch organization' }))
		throw new Error(error.message || 'Failed to fetch organization')
	}

	const json = await response.json() as ApiResponse<Organization>
	return json.data
}

/**
 * Approve an organization (Platform Owner only)
 * POST /api/platform/organizations/:id/approve
 */
export async function approveOrganization(
	id: string,
	data: { notes?: string; tier?: 'standard' | 'premium' | 'enterprise' }
): Promise<Organization> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/platform/organizations/${id}/approve`, {
		method: 'POST',
		headers: {
			...headers,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to approve organization' }))
		throw new Error(error.message || 'Failed to approve organization')
	}

	const json = await response.json() as ApiResponse<Organization>
	return json.data
}

/**
 * Reject an organization (Platform Owner only)
 * POST /api/platform/organizations/:id/reject
 */
export async function rejectOrganization(
	id: string,
	data: { notes: string }
): Promise<Organization> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/platform/organizations/${id}/reject`, {
		method: 'POST',
		headers: {
			...headers,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to reject organization' }))
		throw new Error(error.message || 'Failed to reject organization')
	}

	const json = await response.json() as ApiResponse<Organization>
	return json.data
}

/**
 * Get organization statistics (Platform Owner only)
 * GET /api/platform/organizations/:id/stats
 */
export async function getOrganizationStats(id: string): Promise<OrganizationStats> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/platform/organizations/${id}/stats`, {
		method: 'GET',
		headers,
		credentials: 'include',
		cache: 'no-store'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to fetch organization stats' }))
		throw new Error(error.message || 'Failed to fetch organization stats')
	}

	const json = await response.json() as ApiResponse<OrganizationStats>
	return json.data
}
