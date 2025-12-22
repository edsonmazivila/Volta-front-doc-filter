/**
 * Companies Service
 * Handles company-related API calls for multi-tenant system
 */

import { getAuthCookieHeader } from '@/lib/http/request.server'
import { API_BASE_URL } from '@/lib/config'
import type { Company } from '@/lib/types/organization'

interface ApiResponse<T> {
	success: boolean
	data: T
	count?: number
	message?: string
}

export interface CreateCompanyData {
	name: string
	business_email: string
	country: string
	legal_name?: string
	tax_id?: string
	address_line1?: string
	city?: string
	state?: string
	postal_code?: string
	phone?: string
	website?: string
}

export interface UpdateCompanyData {
	name?: string
	business_email?: string
	country?: string
	legal_name?: string
	tax_id?: string
	address_line1?: string
	city?: string
	state?: string
	postal_code?: string
	phone?: string
	website?: string
	is_active?: boolean
}

/**
 * Get all companies accessible to current user
 * - Organization Admin: all companies in their organization
 * - System Admin: only their own company
 * GET /api/companies
 */
export async function getCompanies(): Promise<{ data: Company[], count: number }> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/companies`, {
		method: 'GET',
		headers,
		credentials: 'include',
		cache: 'no-store'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to fetch companies' }))
		throw new Error(error.message || 'Failed to fetch companies')
	}

	const json = await response.json() as ApiResponse<Company[]>
	return {
		data: json.data,
		count: json.count || json.data.length
	}
}

/**
 * Get all companies with stats (Organization Admin)
 * GET /api/companies?include_stats=true
 */
export async function getAllCompanies(): Promise<{ data: Company[], count: number }> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/companies?include_stats=true`, {
		method: 'GET',
		headers,
		credentials: 'include',
		cache: 'no-store'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to fetch companies' }))
		throw new Error(error.message || 'Failed to fetch companies')
	}

	const json = await response.json() as ApiResponse<Company[]>
	return {
		data: json.data,
		count: json.count || json.data.length
	}
}

/**
 * Get company by ID
 * GET /api/companies/:id
 */
export async function getCompanyById(id: string): Promise<Company> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
		method: 'GET',
		headers,
		credentials: 'include',
		cache: 'no-store'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to fetch company' }))
		throw new Error(error.message || 'Failed to fetch company')
	}

	const json = await response.json() as ApiResponse<Company>
	return json.data
}

/**
 * Create new company (Organization Admin only)
 * POST /api/companies
 */
export async function createCompany(data: CreateCompanyData): Promise<Company> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/companies`, {
		method: 'POST',
		headers: {
			...headers,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to create company' }))
		throw new Error(error.message || 'Failed to create company')
	}

	const json = await response.json() as ApiResponse<Company>
	return json.data
}

/**
 * Update company
 * PUT /api/companies/:id
 */
export async function updateCompany(id: string, data: UpdateCompanyData): Promise<Company> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
		method: 'PUT',
		headers: {
			...headers,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to update company' }))
		throw new Error(error.message || 'Failed to update company')
	}

	const json = await response.json() as ApiResponse<Company>
	return json.data
}

/**
 * Deactivate company (soft delete)
 * DELETE /api/companies/:id
 */
export async function deactivateCompany(id: string): Promise<void> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
		method: 'DELETE',
		headers,
		credentials: 'include'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to deactivate company' }))
		throw new Error(error.message || 'Failed to deactivate company')
	}
}

/**
 * Get company statistics
 * Useful for dashboards
 */
export async function getCompanyStats(companyId: string): Promise<{
	employees_count: number
	active_employees: number
	departments_count: number
	pending_timesheets: number
	active_leave_requests: number
	next_payroll_date?: string
}> {
	const headers = await getAuthCookieHeader()
	
	const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/stats`, {
		method: 'GET',
		headers,
		credentials: 'include',
		cache: 'no-store'
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to fetch company stats' }))
		throw new Error(error.message || 'Failed to fetch company stats')
	}

	const json = await response.json() as ApiResponse<{
		employees_count: number
		active_employees: number
		departments_count: number
		pending_timesheets: number
		active_leave_requests: number
		next_payroll_date?: string
	}>
	
	return json.data
}
