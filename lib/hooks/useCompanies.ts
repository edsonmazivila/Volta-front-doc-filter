/**
 * Hooks for Companies
 * TODO: Migrate to React Query when installed
 * For now, these are simple wrappers around the service functions
 */

'use client'

import { useState, useEffect } from 'react'
import type { Company } from '@/lib/types/organization'
import {
	getCompanies,
	getCompanyById,
	createCompany,
	updateCompany,
	deactivateCompany,
	getCompanyStats,
	type CreateCompanyData,
	type UpdateCompanyData
} from '@/lib/services/companies'

/**
 * Get all companies accessible to current user
 */
export function useCompanies() {
	const [data, setData] = useState<{ data: Company[], count: number } | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		getCompanies()
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false))
	}, [])

	const refetch = () => {
		setIsLoading(true)
		getCompanies()
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false))
	}

	return { data, isLoading, error, refetch }
}

/**
 * Get company by ID
 */
export function useCompany(id: string) {
	const [data, setData] = useState<Company | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!id) return
		
		getCompanyById(id)
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false))
	}, [id])

	return { data, isLoading, error }
}

/**
 * Get company statistics
 */
export function useCompanyStats(id: string) {
	const [data, setData] = useState<{
		employees_count: number
		active_employees: number
		departments_count: number
		pending_timesheets: number
		active_leave_requests: number
		next_payroll_date?: string
	} | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!id) return
		
		getCompanyStats(id)
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false))
	}, [id])

	return { data, isLoading, error }
}

/**
 * Helper functions for mutations (exported for direct use)
 */
export { createCompany, updateCompany, deactivateCompany }
export type { CreateCompanyData, UpdateCompanyData }

