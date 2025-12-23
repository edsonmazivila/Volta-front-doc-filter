'use server'

import { 
	createCompany as createCompanyService, 
	updateCompany as updateCompanyService,
	deactivateCompany as deactivateCompanyService,
	getCompanyStats as getCompanyStatsService,
	type CreateCompanyData,
	type UpdateCompanyData 
} from '@/lib/services/companies'
import { revalidatePath } from 'next/cache'

export interface CompanyActionResult {
	success?: boolean
	error?: string
	data?: {
		id: string
		name: string
	}
}

export interface CompanyStatsResult {
	success?: boolean
	error?: string
	data?: {
		employees_count: number
		active_employees: number
		departments_count: number
		pending_timesheets: number
		active_leave_requests: number
		next_payroll_date?: string
	}
}

/**
 * Server Action: Get company stats
 */
export async function getCompanyStatsAction(companyId: string): Promise<CompanyStatsResult> {
	try {
		const stats = await getCompanyStatsService(companyId)
		
		return {
			success: true,
			data: stats
		}
	} catch (error) {
		console.error('[GET_COMPANY_STATS_ACTION] Error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch company stats'
		}
	}
}

/**
 * Server Action: Create new company
 */
export async function createCompanyAction(data: CreateCompanyData): Promise<CompanyActionResult> {
	try {
		const company = await createCompanyService(data)
		
		// Revalidate organization dashboard to show new company
		revalidatePath('/dashboard/organization')
		
		return {
			success: true,
			data: {
				id: company.id,
				name: company.name
			}
		}
	} catch (error) {
		console.error('[CREATE_COMPANY_ACTION] Error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create company'
		}
	}
}

/**
 * Server Action: Update company
 */
export async function updateCompanyAction(companyId: string, data: UpdateCompanyData): Promise<CompanyActionResult> {
	try {
		const company = await updateCompanyService(companyId, data)
		
		// Revalidate company pages
		revalidatePath('/dashboard/organization')
		revalidatePath(`/dashboard/organization/companies/${companyId}`)
		
		return {
			success: true,
			data: {
				id: company.id,
				name: company.name
			}
		}
	} catch (error) {
		console.error('[UPDATE_COMPANY_ACTION] Error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update company'
		}
	}
}

/**
 * Server Action: Deactivate company
 */
export async function deactivateCompanyAction(companyId: string): Promise<CompanyActionResult> {
	try {
		await deactivateCompanyService(companyId)
		
		// Revalidate organization pages
		revalidatePath('/dashboard/organization')
		revalidatePath(`/dashboard/organization/companies/${companyId}`)
		
		return {
			success: true
		}
	} catch (error) {
		console.error('[DEACTIVATE_COMPANY_ACTION] Error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to deactivate company'
		}
	}
}
