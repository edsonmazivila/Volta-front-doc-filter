/**
 * Hooks for Organizations
 * TODO: Migrate to React Query when installed
 * For now, these are simple wrappers around the service functions
 */

'use client'

import { useState, useEffect } from 'react'
import type { Organization, OrganizationStats } from '@/lib/types/organization'
import {
	getMyOrganization,
	getAllOrganizations,
	getPendingOrganizations,
	getOrganizationById,
	approveOrganization,
	rejectOrganization,
	getOrganizationStats
} from '@/lib/services/organizations'

/**
 * Get current user's organization
 */
export function useMyOrganization() {
	const [data, setData] = useState<Organization | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		getMyOrganization()
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false))
	}, [])

	return { data, isLoading, error }
}

/**
 * Get all organizations (Platform Owner only)
 */
export function useAllOrganizations() {
	const [data, setData] = useState<{ data: Organization[], count: number } | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		getAllOrganizations()
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false))
	}, [])

	return { data, isLoading, error }
}

/**
 * Get pending organizations (Platform Owner only)
 */
export function usePendingOrganizations() {
	const [data, setData] = useState<{ data: Organization[], count: number } | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		getPendingOrganizations()
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false))
	}, [])

	return { data, isLoading, error }
}

/**
 * Get organization by ID
 */
export function useOrganization(id: string) {
	const [data, setData] = useState<Organization | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!id) return
		
		getOrganizationById(id)
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false))
	}, [id])

	return { data, isLoading, error }
}

/**
 * Get organization statistics
 */
export function useOrganizationStats(id: string) {
	const [data, setData] = useState<OrganizationStats | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!id) return
		
		getOrganizationStats(id)
			.then(setData)
			.catch(setError)
			.finally(() => setIsLoading(false))
	}, [id])

	return { data, isLoading, error }
}

/**
 * Helper functions for mutations (no hooks needed for now)
 */
export { approveOrganization, rejectOrganization }

